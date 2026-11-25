-- KYN KIDS: CPF do comprador (exigido pelo Melhor Envio e pela nota fiscal) e limite anti-spam de pedidos.
-- Compatível com a versão anterior do site: o CPF só é validado quando enviado.

alter table public.store_orders add column if not exists customer_document text;

-- Valida CPF pelos dígitos verificadores (aceita com ou sem pontuação).
create or replace function public.is_valid_cpf(p_cpf text)
returns boolean
language plpgsql
immutable
set search_path = public
as $$
declare
  d text := regexp_replace(coalesce(p_cpf, ''), '[^0-9]', '', 'g');
  s integer;
  r integer;
  i integer;
begin
  if length(d) <> 11 or d ~ '^(\d)\1{10}$' then return false; end if;
  for pos in 9..10 loop
    s := 0;
    for i in 1..pos loop
      s := s + substr(d, i, 1)::integer * (pos + 2 - i);
    end loop;
    r := (s * 10) % 11;
    if r = 10 then r := 0; end if;
    if r <> substr(d, pos + 1, 1)::integer then return false; end if;
  end loop;
  return true;
end;
$$;

create index if not exists store_orders_email_created_idx on public.store_orders (customer_email, created_at desc);
create index if not exists store_orders_created_idx on public.store_orders (created_at desc);

create or replace function public.submit_store_order(
  p_customer jsonb,
  p_items jsonb,
  p_payment_method text,
  p_delivery_method text
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid;
  v_order_number text;
  v_subtotal numeric(10,2) := 0;
  v_item jsonb;
  v_variant public.store_catalog_variants%rowtype;
  v_quantity integer;
  v_line_total numeric(10,2);
  v_shipping_fee numeric(10,2) := 0;
  v_email text := lower(trim(coalesce(p_customer->>'email', '')));
  v_cpf text := nullif(regexp_replace(coalesce(p_customer->>'cpf', ''), '[^0-9]', '', 'g'), '');
begin
  if p_payment_method not in ('pix','credit','debit') then
    raise exception 'Forma de pagamento inválida';
  end if;
  if p_delivery_method not in ('shipping','malinha') then
    raise exception 'Forma de entrega inválida';
  end if;
  if p_delivery_method = 'malinha' and lower(coalesce(p_customer->>'city','')) not like '%caxias do sul%' then
    raise exception 'A malinha gratuita está disponível somente em Caxias do Sul';
  end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) < 1 or jsonb_array_length(p_items) > 50 then
    raise exception 'Carrinho inválido';
  end if;
  if coalesce(trim(p_customer->>'name'),'') = '' or v_email = ''
    or coalesce(trim(p_customer->>'phone'),'') = '' or coalesce(trim(p_customer->>'zip_code'),'') = ''
    or coalesce(trim(p_customer->>'address_line'),'') = '' or coalesce(trim(p_customer->>'address_number'),'') = ''
    or coalesce(trim(p_customer->>'neighborhood'),'') = '' or coalesce(trim(p_customer->>'city'),'') = ''
    or coalesce(trim(p_customer->>'state'),'') = '' then
    raise exception 'Preencha todos os dados obrigatórios de entrega';
  end if;
  if v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'E-mail inválido';
  end if;
  if length(regexp_replace(p_customer->>'zip_code', '[^0-9]', '', 'g')) <> 8 then
    raise exception 'CEP inválido';
  end if;
  if v_cpf is not null and not public.is_valid_cpf(v_cpf) then
    raise exception 'CPF inválido';
  end if;

  -- Anti-spam: no máximo 3 pedidos por e-mail em 10 minutos e 60 pedidos na loja em 10 minutos.
  if (select count(*) from public.store_orders where customer_email = v_email and created_at > now() - interval '10 minutes') >= 3 then
    raise exception 'Muitos pedidos em pouco tempo com este e-mail. Aguarde alguns minutos ou fale com a loja.';
  end if;
  if (select count(*) from public.store_orders where created_at > now() - interval '10 minutes') >= 60 then
    raise exception 'A loja recebeu muitos pedidos agora. Tente novamente em alguns minutos.';
  end if;

  insert into public.store_orders (
    customer_name, customer_email, customer_phone, customer_document, zip_code, address_line, address_number,
    complement, neighborhood, city, state, delivery_method, payment_method,
    subtotal, shipping_fee, total, payment_status, fulfillment_status, shipping_status
  ) values (
    trim(p_customer->>'name'), v_email, trim(p_customer->>'phone'), v_cpf,
    regexp_replace(p_customer->>'zip_code','[^0-9]','','g'), trim(p_customer->>'address_line'),
    trim(p_customer->>'address_number'), nullif(trim(coalesce(p_customer->>'complement','')),''),
    trim(p_customer->>'neighborhood'), trim(p_customer->>'city'), upper(trim(p_customer->>'state')),
    p_delivery_method, p_payment_method, 0, v_shipping_fee, 0, 'pending', 'received', 'quote_pending'
  ) returning id, order_number into v_order_id, v_order_number;

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    v_quantity := (v_item->>'quantity')::integer;
    if v_quantity is null or v_quantity < 1 or v_quantity > 20 then raise exception 'Quantidade inválida'; end if;

    select v.* into v_variant
    from public.store_catalog_variants v
    join public.store_products p on p.id = v.product_id and p.active
    where v.product_id = v_item->>'product_id'
      and v.variant_index = (v_item->>'variant_index')::integer
      and v.active = true
    for update of v;

    if not found then raise exception 'Produto ou tamanho indisponível'; end if;
    if v_variant.stock < v_quantity then
      raise exception 'Estoque insuficiente: % (tamanho %) — restam % unidade(s)',
        v_variant.product_name,
        v_variant.size_label || case when v_variant.color <> '' then ' ' || v_variant.color else '' end,
        v_variant.stock
        using errcode = 'P0001';
    end if;

    update public.store_catalog_variants
    set stock = stock - v_quantity
    where product_id = v_variant.product_id and variant_index = v_variant.variant_index;

    v_line_total := v_variant.unit_price * v_quantity;
    v_subtotal := v_subtotal + v_line_total;

    insert into public.store_order_items (
      order_id, product_id, variant_index, product_name, size_label, color, quantity, unit_price, line_total
    ) values (
      v_order_id, v_variant.product_id, v_variant.variant_index, v_variant.product_name, v_variant.size_label,
      v_variant.color, v_quantity, v_variant.unit_price, v_line_total
    );
  end loop;

  update public.store_orders
  set subtotal = v_subtotal, total = v_subtotal + v_shipping_fee
  where id = v_order_id;

  return jsonb_build_object(
    'id', v_order_id,
    'order_number', v_order_number,
    'subtotal', v_subtotal,
    'shipping_fee', v_shipping_fee,
    'total', v_subtotal + v_shipping_fee
  );
end;
$$;

revoke all on function public.submit_store_order(jsonb,jsonb,text,text) from public;
grant execute on function public.submit_store_order(jsonb,jsonb,text,text) to anon, authenticated;
