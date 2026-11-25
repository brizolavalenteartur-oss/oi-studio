-- KYN KIDS: catálogo no banco (fonte única) + estoque por variante (1 tamanho + 1 cor).

-- Quem é administrador da loja (usado nas políticas abaixo).
create or replace function public.is_store_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.store_admins a where a.user_id = auth.uid());
$$;
grant execute on function public.is_store_admin() to anon, authenticated;

-- Produtos
create table if not exists public.store_products (
  id text primary key,
  name text not null,
  category text not null check (category in ('Meninas','Meninos','Bebês','Conjuntos')),
  image_url text not null,
  description text,
  active boolean not null default true,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.store_products enable row level security;

drop policy if exists "Products are public" on public.store_products;
create policy "Products are public" on public.store_products
for select to anon, authenticated using (active = true or public.is_store_admin());

drop policy if exists "Admins manage products" on public.store_products;
create policy "Admins manage products" on public.store_products
for all to authenticated using (public.is_store_admin()) with check (public.is_store_admin());

grant select on public.store_products to anon, authenticated;
grant insert, update, delete on public.store_products to authenticated;

-- Variantes: cor e estoque
alter table public.store_catalog_variants
  add column if not exists color text not null default '',
  add column if not exists stock integer not null default 0;

do $$ begin
  alter table public.store_catalog_variants add constraint store_catalog_variants_stock_check check (stock >= 0);
exception when duplicate_object then null; end $$;

drop policy if exists "Catalog prices are public" on public.store_catalog_variants;
create policy "Catalog prices are public" on public.store_catalog_variants
for select to anon, authenticated using (active = true or public.is_store_admin());

drop policy if exists "Admins manage variants" on public.store_catalog_variants;
create policy "Admins manage variants" on public.store_catalog_variants
for all to authenticated using (public.is_store_admin()) with check (public.is_store_admin());

grant insert, update, delete on public.store_catalog_variants to authenticated;

-- Itens do pedido guardam a variante exata, para devolver ao estoque se o pedido for cancelado.
alter table public.store_order_items
  add column if not exists variant_index integer,
  add column if not exists color text not null default '';

-- Pedido: valida preço e estoque no banco e baixa o estoque na mesma transação.
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
  if coalesce(trim(p_customer->>'name'),'') = '' or coalesce(trim(p_customer->>'email'),'') = ''
    or coalesce(trim(p_customer->>'phone'),'') = '' or coalesce(trim(p_customer->>'zip_code'),'') = ''
    or coalesce(trim(p_customer->>'address_line'),'') = '' or coalesce(trim(p_customer->>'address_number'),'') = ''
    or coalesce(trim(p_customer->>'neighborhood'),'') = '' or coalesce(trim(p_customer->>'city'),'') = ''
    or coalesce(trim(p_customer->>'state'),'') = '' then
    raise exception 'Preencha todos os dados obrigatórios de entrega';
  end if;

  insert into public.store_orders (
    customer_name, customer_email, customer_phone, zip_code, address_line, address_number,
    complement, neighborhood, city, state, delivery_method, payment_method,
    subtotal, shipping_fee, total, payment_status, fulfillment_status, shipping_status
  ) values (
    trim(p_customer->>'name'), lower(trim(p_customer->>'email')), trim(p_customer->>'phone'),
    regexp_replace(p_customer->>'zip_code','[^0-9]','','g'), trim(p_customer->>'address_line'),
    trim(p_customer->>'address_number'), nullif(trim(coalesce(p_customer->>'complement','')),''),
    trim(p_customer->>'neighborhood'), trim(p_customer->>'city'), upper(trim(p_customer->>'state')),
    p_delivery_method, p_payment_method, 0, v_shipping_fee, 0, 'pending', 'received', 'quote_pending'
  ) returning id, order_number into v_order_id, v_order_number;

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    v_quantity := (v_item->>'quantity')::integer;
    if v_quantity is null or v_quantity < 1 or v_quantity > 20 then raise exception 'Quantidade inválida'; end if;

    -- "for update" trava a variante: dois clientes não compram a última peça ao mesmo tempo.
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

-- Cancelar um pedido devolve as peças ao estoque; reabrir um cancelado baixa de novo.
create or replace function public.store_orders_restock()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_item record;
begin
  if new.fulfillment_status = old.fulfillment_status then return new; end if;

  if new.fulfillment_status = 'cancelled' then
    update public.store_catalog_variants v
    set stock = v.stock + i.quantity
    from public.store_order_items i
    where i.order_id = new.id and i.variant_index is not null
      and v.product_id = i.product_id and v.variant_index = i.variant_index;
  elsif old.fulfillment_status = 'cancelled' then
    for v_item in
      select i.product_id, i.variant_index, i.quantity, i.product_name, i.size_label
      from public.store_order_items i
      where i.order_id = new.id and i.variant_index is not null
    loop
      update public.store_catalog_variants
      set stock = stock - v_item.quantity
      where product_id = v_item.product_id and variant_index = v_item.variant_index and stock >= v_item.quantity;
      if not found then
        raise exception 'Sem estoque para reabrir o pedido: % (tamanho %)', v_item.product_name, v_item.size_label;
      end if;
    end loop;
  end if;
  return new;
end;
$$;

revoke all on function public.store_orders_restock() from public, anon, authenticated;

drop trigger if exists store_orders_restock on public.store_orders;
create trigger store_orders_restock
after update of fulfillment_status on public.store_orders
for each row execute function public.store_orders_restock();

-- Catálogo inicial
-- Gerado a partir do catálogo original (src/data/products.ts). Estoque inicial = 1 unidade por variante: AJUSTE no painel.
insert into public.store_products (id, name, category, image_url, position) values
  ('produto-01', 'Blusa básica pink', 'Meninas', '/images/produtos/produto-01.jpg', 1),
  ('produto-02', 'Conjunto feminino rosa', 'Conjuntos', '/images/produtos/produto-02.jpg', 2),
  ('produto-03', 'Conjunto elefantinho blusa e legging', 'Conjuntos', '/images/produtos/produto-03.jpg', 3),
  ('produto-04', 'Macacão curto rosa', 'Bebês', '/images/produtos/produto-04.jpg', 4),
  ('produto-05', 'Bermuda ciclista pink', 'Meninas', '/images/produtos/produto-05.jpg', 5),
  ('produto-06', 'Conjunto gatinho blusa e short', 'Conjuntos', '/images/produtos/produto-06.jpg', 6),
  ('produto-07', 'Conjunto ursinho blusa e short', 'Conjuntos', '/images/produtos/produto-07.jpg', 7),
  ('produto-08', 'Blusa manga babado branca', 'Meninas', '/images/produtos/produto-08.jpg', 8),
  ('produto-09', 'Conjunto gatinho rosa e short lima', 'Conjuntos', '/images/produtos/produto-09.jpg', 9),
  ('produto-10', 'Vestido polo gatinha tenista', 'Meninas', '/images/produtos/produto-10.jpg', 10),
  ('produto-11', 'Blusa bailarina manga babado', 'Meninas', '/images/produtos/produto-11.jpg', 11),
  ('produto-12', 'Vestido floral passarinhos creme', 'Meninas', '/images/produtos/produto-12.jpg', 12),
  ('produto-13', 'Vestido polo listrado', 'Meninas', '/images/produtos/produto-13.jpg', 13),
  ('produto-14', 'Conjunto onça blusa e saia short', 'Conjuntos', '/images/produtos/produto-14.jpg', 14),
  ('produto-15', 'Conjunto gatinho verde lima', 'Conjuntos', '/images/produtos/produto-15.jpg', 15),
  ('produto-16', 'Bermuda ciclista estampada', 'Meninas', '/images/produtos/produto-16.jpg', 16),
  ('produto-17', 'Blusa básica branca', 'Meninas', '/images/produtos/produto-17.jpg', 17),
  ('produto-18', 'Blusa ribana manga babado lilás', 'Meninas', '/images/produtos/produto-18.jpg', 18),
  ('produto-19', 'Conjunto laços blusa e short', 'Conjuntos', '/images/produtos/produto-19.jpg', 19),
  ('produto-20', 'Conjunto cachorrinho blusa e short', 'Conjuntos', '/images/produtos/produto-20.jpg', 20),
  ('produto-21', 'Conjunto princesa blusa e bermuda', 'Conjuntos', '/images/produtos/produto-21.jpg', 21),
  ('produto-22', 'Legging corações preta', 'Meninas', '/images/produtos/produto-22.jpg', 22),
  ('produto-23', 'Calça xadrez preta', 'Meninas', '/images/produtos/produto-23.jpg', 23),
  ('produto-24', 'Saia short rosa', 'Meninas', '/images/produtos/produto-24.jpg', 24),
  ('produto-25', 'Conjunto flor blusa e short laranja', 'Conjuntos', '/images/produtos/produto-25.jpg', 25),
  ('produto-26', 'Conjunto blusa e bermuda estampada', 'Conjuntos', '/images/produtos/produto-26.jpg', 26),
  ('produto-27', 'Blusa bailarina rosa', 'Meninas', '/images/produtos/produto-27.jpg', 27),
  ('produto-28', 'Vestido passarinhos creme', 'Meninas', '/images/produtos/produto-28.jpg', 28),
  ('produto-29', 'Vestido passarinhos rosa', 'Meninas', '/images/produtos/produto-29.jpg', 29),
  ('produto-30', 'Conjunto estampado verde blusa e short', 'Conjuntos', '/images/produtos/produto-30.jpg', 30),
  ('produto-31', 'Conjunto blusa branca e legging estampada', 'Conjuntos', '/images/produtos/produto-31.jpg', 31),
  ('produto-32', 'Conjunto floral cropped e saia', 'Conjuntos', '/images/produtos/produto-32.jpg', 32),
  ('produto-33', 'Conjunto Paris blusa e legging', 'Conjuntos', '/images/produtos/produto-33.jpg', 33),
  ('produto-34', 'Vestido branco manga sino', 'Meninas', '/images/produtos/produto-34.jpg', 34),
  ('produto-35', 'Conjunto branco regata e calça', 'Conjuntos', '/images/produtos/produto-35.jpg', 35),
  ('produto-36', 'Conjunto tropical blusa e short', 'Conjuntos', '/images/produtos/produto-36.jpg', 36),
  ('produto-37', 'Conjunto cropped e short pink', 'Conjuntos', '/images/produtos/produto-37.jpg', 37),
  ('produto-38', 'Bermuda ciclista preta', 'Meninos', '/images/produtos/produto-38.jpg', 38),
  ('produto-39', 'Blusa canelada decote V', 'Meninas', '/images/produtos/produto-39.jpg', 39),
  ('produto-40', 'Vestido amarelo lima com babados', 'Meninas', '/images/produtos/produto-40.jpg', 40),
  ('produto-41', 'Camiseta aranha vermelha', 'Meninos', '/images/produtos/produto-41.jpg', 41),
  ('produto-42', 'Camiseta jacaré bege', 'Meninos', '/images/produtos/produto-42.jpg', 42),
  ('produto-43', 'Conjunto dino camiseta e bermuda verde', 'Conjuntos', '/images/produtos/produto-43.jpg', 43),
  ('produto-44', 'Macacão azul', 'Bebês', '/images/produtos/produto-44.jpg', 44),
  ('produto-45', 'Conjunto camiseta vermelha e bermuda mescla', 'Conjuntos', '/images/produtos/produto-45.jpg', 45),
  ('produto-46', 'Conjunto dino vermelho camiseta e bermuda', 'Conjuntos', '/images/produtos/produto-46.jpg', 46),
  ('produto-47', 'Conjunto polo menta e bermuda', 'Conjuntos', '/images/produtos/produto-47.jpg', 47),
  ('produto-48', 'Camiseta cachorrinho vermelha', 'Meninos', '/images/produtos/produto-48.jpg', 48),
  ('produto-49', 'Camiseta palmeiras preta', 'Meninos', '/images/produtos/produto-49.jpg', 49),
  ('produto-50', 'Camiseta dino marinho', 'Meninos', '/images/produtos/produto-50.jpg', 50),
  ('produto-51', 'Camiseta manga longa camping vermelha', 'Meninos', '/images/produtos/produto-51.jpg', 51),
  ('produto-52', 'Camiseta bege', 'Meninos', '/images/produtos/produto-52.jpg', 52),
  ('produto-53', 'Camiseta marinho básica', 'Meninos', '/images/produtos/produto-53.jpg', 53),
  ('produto-54', 'Polo branca', 'Meninos', '/images/produtos/produto-54.jpg', 54),
  ('produto-55', 'Camiseta manga longa herói verde', 'Meninos', '/images/produtos/produto-55.jpg', 55),
  ('produto-56', 'Bermuda moletom preta', 'Meninos', '/images/produtos/produto-56.jpg', 56),
  ('produto-57', 'Camiseta laranja estampada', 'Meninos', '/images/produtos/produto-57.jpg', 57),
  ('produto-58', 'Camiseta manga longa marinho', 'Meninos', '/images/produtos/produto-58.jpg', 58),
  ('produto-59', 'Camiseta manga longa branca', 'Meninos', '/images/produtos/produto-59.jpg', 59),
  ('produto-60', 'Camiseta branca básica', 'Meninos', '/images/produtos/produto-60.jpg', 60),
  ('produto-61', 'Camiseta preta básica', 'Meninos', '/images/produtos/produto-61.jpg', 61),
  ('produto-62', 'Camiseta amarela estampada', 'Meninos', '/images/produtos/produto-62.jpg', 62),
  ('produto-63', 'Conjunto masculino azul', 'Conjuntos', '/images/produtos/produto-63.jpg', 63)
on conflict (id) do update set name = excluded.name, category = excluded.category, image_url = excluded.image_url, position = excluded.position;

insert into public.store_catalog_variants (product_id, variant_index, product_name, size_label, color, unit_price, stock, active) values
  ('produto-01', 0, 'Blusa básica pink', '1', '', 30.29, 1, true),
  ('produto-01', 1, 'Blusa básica pink', '2', '', 30.29, 1, true),
  ('produto-01', 2, 'Blusa básica pink', '8', '', 36.00, 1, true),
  ('produto-01', 3, 'Blusa básica pink', '10', '', 36.00, 1, true),
  ('produto-02', 0, 'Conjunto feminino rosa', '2', '', 108.00, 1, true),
  ('produto-03', 0, 'Conjunto elefantinho blusa e legging', 'G', '', 65.21, 1, true),
  ('produto-03', 1, 'Conjunto elefantinho blusa e legging', '3', '', 74.45, 1, true),
  ('produto-04', 0, 'Macacão curto rosa', 'M', '', 99.90, 1, true),
  ('produto-04', 1, 'Macacão curto rosa', 'G', '', 99.90, 1, true),
  ('produto-05', 0, 'Bermuda ciclista pink', '2', '', 25.37, 1, true),
  ('produto-05', 1, 'Bermuda ciclista pink', '3', '', 25.37, 1, true),
  ('produto-06', 0, 'Conjunto gatinho blusa e short', 'G', '', 65.21, 1, true),
  ('produto-06', 1, 'Conjunto gatinho blusa e short', '2', '', 74.45, 1, true),
  ('produto-06', 2, 'Conjunto gatinho blusa e short', '3', '', 74.45, 1, true),
  ('produto-07', 0, 'Conjunto ursinho blusa e short', '2', '', 65.21, 1, true),
  ('produto-07', 1, 'Conjunto ursinho blusa e short', '3', '', 65.21, 1, true),
  ('produto-08', 0, 'Blusa manga babado branca', '2', '', 58.48, 1, true),
  ('produto-08', 1, 'Blusa manga babado branca', '4', '', 64.40, 1, true),
  ('produto-09', 0, 'Conjunto gatinho rosa e short lima', '2', '', 65.20, 1, true),
  ('produto-10', 0, 'Vestido polo gatinha tenista', '1', '', 30.29, 1, true),
  ('produto-10', 1, 'Vestido polo gatinha tenista', '3', '', 30.29, 1, true),
  ('produto-10', 2, 'Vestido polo gatinha tenista', '6', 'Verde', 83.83, 1, true),
  ('produto-11', 0, 'Blusa bailarina manga babado', '2', '', 42.86, 1, true),
  ('produto-11', 1, 'Blusa bailarina manga babado', '3', '', 42.86, 1, true),
  ('produto-12', 0, 'Vestido floral passarinhos creme', '2', '', 87.82, 1, true),
  ('produto-13', 0, 'Vestido polo listrado', '2', '', 103.38, 1, true),
  ('produto-14', 0, 'Conjunto onça blusa e saia short', '1', '', 87.00, 1, true),
  ('produto-14', 1, 'Conjunto onça blusa e saia short', '3', '', 93.00, 1, true),
  ('produto-15', 0, 'Conjunto gatinho verde lima', '1', '', 30.29, 1, true),
  ('produto-16', 0, 'Bermuda ciclista estampada', '4', '', 36.00, 1, true),
  ('produto-17', 0, 'Blusa básica branca', '1', '', 30.29, 1, true),
  ('produto-17', 1, 'Blusa básica branca', '2', '', 30.29, 1, true),
  ('produto-17', 2, 'Blusa básica branca', '3', '', 30.29, 1, true),
  ('produto-17', 3, 'Blusa básica branca', '10', '', 36.00, 1, true),
  ('produto-18', 0, 'Blusa ribana manga babado lilás', '1', '', 26.38, 1, true),
  ('produto-18', 1, 'Blusa ribana manga babado lilás', '3', '', 26.38, 1, true),
  ('produto-18', 2, 'Blusa ribana manga babado lilás', '10', '', 26.38, 1, true),
  ('produto-19', 0, 'Conjunto laços blusa e short', '1', '', 58.48, 1, true),
  ('produto-19', 1, 'Conjunto laços blusa e short', '3', '', 58.48, 1, true),
  ('produto-19', 2, 'Conjunto laços blusa e short', '6', 'Verde', 136.49, 1, true),
  ('produto-20', 0, 'Conjunto cachorrinho blusa e short', '3', '', 79.90, 1, true),
  ('produto-20', 1, 'Conjunto cachorrinho blusa e short', '4', '', 79.90, 1, true),
  ('produto-21', 0, 'Conjunto princesa blusa e bermuda', '3', '', 69.59, 1, true),
  ('produto-21', 1, 'Conjunto princesa blusa e bermuda', '4', '', 83.87, 1, true),
  ('produto-21', 2, 'Conjunto princesa blusa e bermuda', '4', 'Opção 2', 57.71, 1, true),
  ('produto-22', 0, 'Legging corações preta', '4', '', 46.00, 1, true),
  ('produto-22', 1, 'Legging corações preta', '6', '', 46.00, 1, true),
  ('produto-23', 0, 'Calça xadrez preta', '3', '', 40.00, 1, true),
  ('produto-23', 1, 'Calça xadrez preta', '4', '', 40.00, 1, true),
  ('produto-24', 0, 'Saia short rosa', '4', '', 80.00, 1, true),
  ('produto-24', 1, 'Saia short rosa', '6', '', 80.00, 1, true),
  ('produto-24', 2, 'Saia short rosa', '8', '', 80.00, 1, true),
  ('produto-24', 3, 'Saia short rosa', '4', 'Preta', 80.00, 1, true),
  ('produto-24', 4, 'Saia short rosa', '6', 'Preta', 80.00, 1, true),
  ('produto-24', 5, 'Saia short rosa', '10', 'Preta', 80.00, 1, true),
  ('produto-25', 0, 'Conjunto flor blusa e short laranja', '4', '', 93.00, 1, true),
  ('produto-26', 0, 'Conjunto blusa e bermuda estampada', '4', '', 93.75, 1, true),
  ('produto-27', 0, 'Blusa bailarina rosa', '4', '', 33.50, 1, true),
  ('produto-27', 1, 'Blusa bailarina rosa', '8', '', 46.60, 1, true),
  ('produto-28', 0, 'Vestido passarinhos creme', '4', '', 97.50, 1, true),
  ('produto-29', 0, 'Vestido passarinhos rosa', '4', '', 97.50, 1, true),
  ('produto-30', 0, 'Conjunto estampado verde blusa e short', '6', 'Rosa', 200.00, 1, true),
  ('produto-31', 0, 'Conjunto blusa branca e legging estampada', '6', '', 72.00, 1, true),
  ('produto-31', 1, 'Conjunto blusa branca e legging estampada', '10', '', 72.00, 1, true),
  ('produto-31', 2, 'Conjunto blusa branca e legging estampada', '10', 'Preta', 72.00, 1, true),
  ('produto-32', 0, 'Conjunto floral cropped e saia', '8', '', 150.00, 1, true),
  ('produto-32', 1, 'Conjunto floral cropped e saia', '10', '', 150.00, 1, true),
  ('produto-33', 0, 'Conjunto Paris blusa e legging', '8', '', 75.00, 1, true),
  ('produto-34', 0, 'Vestido branco manga sino', '12', '', 234.00, 1, true),
  ('produto-34', 1, 'Vestido branco manga sino', '14', '', 234.00, 1, true),
  ('produto-34', 2, 'Vestido branco manga sino', '16', '', 234.00, 1, true),
  ('produto-35', 0, 'Conjunto branco regata e calça', '10', '', 282.79, 1, true),
  ('produto-36', 0, 'Conjunto tropical blusa e short', '14', '', 166.00, 1, true),
  ('produto-36', 1, 'Conjunto tropical blusa e short', '16', '', 166.00, 1, true),
  ('produto-37', 0, 'Conjunto cropped e short pink', '10', '', 115.40, 1, true),
  ('produto-38', 0, 'Bermuda ciclista preta', '14', '', 37.00, 1, true),
  ('produto-39', 0, 'Blusa canelada decote V', '14', '', 58.48, 1, true),
  ('produto-40', 0, 'Vestido amarelo lima com babados', '12', '', 100.00, 1, true),
  ('produto-41', 0, 'Camiseta aranha vermelha', '2', '', 47.00, 1, true),
  ('produto-41', 1, 'Camiseta aranha vermelha', '4', '', 47.00, 1, true),
  ('produto-41', 2, 'Camiseta aranha vermelha', '6', '', 47.00, 1, true),
  ('produto-42', 0, 'Camiseta jacaré bege', '1', '', 20.00, 1, true),
  ('produto-42', 1, 'Camiseta jacaré bege', '2', '', 20.00, 1, true),
  ('produto-42', 2, 'Camiseta jacaré bege', '3', '', 20.00, 1, true),
  ('produto-42', 3, 'Camiseta jacaré bege', '2', 'Verde', 20.00, 1, true),
  ('produto-42', 4, 'Camiseta jacaré bege', '3', 'Verde', 20.00, 1, true),
  ('produto-43', 0, 'Conjunto dino camiseta e bermuda verde', '1', '', 68.90, 1, true),
  ('produto-43', 1, 'Conjunto dino camiseta e bermuda verde', '3', '', 68.90, 1, true),
  ('produto-44', 0, 'Macacão azul', 'M', '', 99.90, 1, true),
  ('produto-44', 1, 'Macacão azul', 'G', '', 99.90, 1, true),
  ('produto-44', 2, 'Macacão azul', 'GG', '', 99.90, 1, true),
  ('produto-44', 3, 'Macacão azul', 'P', 'Amarelo', 99.90, 1, true),
  ('produto-45', 0, 'Conjunto camiseta vermelha e bermuda mescla', '2', '', 83.83, 1, true),
  ('produto-45', 1, 'Conjunto camiseta vermelha e bermuda mescla', '3', '', 83.83, 1, true),
  ('produto-45', 2, 'Conjunto camiseta vermelha e bermuda mescla', '4', '', 83.83, 1, true),
  ('produto-45', 3, 'Conjunto camiseta vermelha e bermuda mescla', '8', '', 83.83, 1, true),
  ('produto-46', 0, 'Conjunto dino vermelho camiseta e bermuda', '1', '', 65.21, 1, true),
  ('produto-46', 1, 'Conjunto dino vermelho camiseta e bermuda', '3', '', 65.21, 1, true),
  ('produto-47', 0, 'Conjunto polo menta e bermuda', '3', '', 111.66, 1, true),
  ('produto-47', 1, 'Conjunto polo menta e bermuda', '6', '', 111.66, 1, true),
  ('produto-47', 2, 'Conjunto polo menta e bermuda', '8', '', 111.66, 1, true),
  ('produto-48', 0, 'Camiseta cachorrinho vermelha', '3', '', 46.60, 1, true),
  ('produto-49', 0, 'Camiseta palmeiras preta', '10', '', 100.00, 1, true),
  ('produto-49', 1, 'Camiseta palmeiras preta', '12', '', 100.00, 1, true),
  ('produto-50', 0, 'Camiseta dino marinho', '3', '', 67.10, 1, true),
  ('produto-50', 1, 'Camiseta dino marinho', '4', '', 67.10, 1, true),
  ('produto-51', 0, 'Camiseta manga longa camping vermelha', '4', '', 50.00, 1, true),
  ('produto-52', 0, 'Camiseta bege', '4', '', 130.00, 1, true),
  ('produto-53', 0, 'Camiseta marinho básica', '4', '', 45.00, 1, true),
  ('produto-53', 1, 'Camiseta marinho básica', '6', '', 45.00, 1, true),
  ('produto-53', 2, 'Camiseta marinho básica', '8', '', 45.00, 1, true),
  ('produto-53', 3, 'Camiseta marinho básica', '12', '', 45.00, 1, true),
  ('produto-54', 0, 'Polo branca', '4', '', 50.00, 1, true),
  ('produto-54', 1, 'Polo branca', '6', '', 50.00, 1, true),
  ('produto-54', 2, 'Polo branca', '8', '', 50.00, 1, true),
  ('produto-54', 3, 'Polo branca', '14', '', 50.00, 1, true),
  ('produto-55', 0, 'Camiseta manga longa herói verde', '4', '', 42.00, 1, true),
  ('produto-55', 1, 'Camiseta manga longa herói verde', '6', '', 42.00, 1, true),
  ('produto-55', 2, 'Camiseta manga longa herói verde', '8', '', 42.00, 1, true),
  ('produto-56', 0, 'Bermuda moletom preta', '4', '', 50.00, 1, true),
  ('produto-56', 1, 'Bermuda moletom preta', '6', '', 50.00, 1, true),
  ('produto-56', 2, 'Bermuda moletom preta', '8', '', 50.00, 1, true),
  ('produto-57', 0, 'Camiseta laranja estampada', '4', '', 40.00, 1, true),
  ('produto-57', 1, 'Camiseta laranja estampada', '6', '', 40.00, 1, true),
  ('produto-57', 2, 'Camiseta laranja estampada', '8', '', 40.00, 1, true),
  ('produto-58', 0, 'Camiseta manga longa marinho', '6', '', 50.00, 1, true),
  ('produto-59', 0, 'Camiseta manga longa branca', '6', '', 50.00, 1, true),
  ('produto-60', 0, 'Camiseta branca básica', '6', '', 40.00, 1, true),
  ('produto-60', 1, 'Camiseta branca básica', '8', '', 40.00, 1, true),
  ('produto-60', 2, 'Camiseta branca básica', '12', '', 40.00, 1, true),
  ('produto-60', 3, 'Camiseta branca básica', '14', '', 40.00, 1, true),
  ('produto-61', 0, 'Camiseta preta básica', '6', '', 47.00, 1, true),
  ('produto-61', 1, 'Camiseta preta básica', '8', '', 47.00, 1, true),
  ('produto-61', 2, 'Camiseta preta básica', '12', '', 47.00, 1, true),
  ('produto-62', 0, 'Camiseta amarela estampada', '8', '', 93.00, 1, true),
  ('produto-63', 0, 'Conjunto masculino azul', '12', '', 200.00, 1, true),
  ('produto-63', 1, 'Conjunto masculino azul', '14', '', 200.00, 1, true)
on conflict (product_id, variant_index) do update set product_name = excluded.product_name, size_label = excluded.size_label, color = excluded.color, unit_price = excluded.unit_price, active = true;

-- Toda variante pertence a um produto cadastrado.
do $$ begin
  alter table public.store_catalog_variants
    add constraint store_catalog_variants_product_fk foreign key (product_id) references public.store_products(id) on delete cascade;
exception when duplicate_object then null; end $$;