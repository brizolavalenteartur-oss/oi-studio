-- KYN KIDS: pedidos online, itens e permissões administrativas.
create extension if not exists pgcrypto;

create table if not exists public.store_catalog_variants (
  product_id text not null,
  variant_index integer not null,
  product_name text not null,
  size_label text not null,
  unit_price numeric(10,2) not null check (unit_price >= 0),
  active boolean not null default true,
  primary key (product_id, variant_index)
);

insert into public.store_catalog_variants (product_id, variant_index, product_name, size_label, unit_price)
values
  ('produto-01', 0, 'Blusa básica pink', '2/1', 30.29),
  ('produto-01', 1, 'Blusa básica pink', '8/10', 36.00),
  ('produto-02', 0, 'Conjunto feminino rosa', '2', 108.00),
  ('produto-03', 0, 'Conjunto elefantinho blusa e legging', 'G', 65.21),
  ('produto-03', 1, 'Conjunto elefantinho blusa e legging', '3 -2 PEÇAS', 74.45),
  ('produto-04', 0, 'Macacão curto rosa', 'M/G', 99.90),
  ('produto-05', 0, 'Bermuda ciclista pink', '2/3', 25.37),
  ('produto-06', 0, 'Conjunto gatinho blusa e short', '2/3-2 PEÇAS', 74.45),
  ('produto-06', 1, 'Conjunto gatinho blusa e short', 'G', 65.21),
  ('produto-07', 0, 'Conjunto ursinho blusa e short', '2/3', 65.21),
  ('produto-08', 0, 'Blusa manga babado branca', '2', 58.48),
  ('produto-08', 1, 'Blusa manga babado branca', '4', 64.40),
  ('produto-09', 0, 'Conjunto gatinho rosa e short lima', '2', 65.20),
  ('produto-10', 0, 'Vestido polo gatinha tenista', '1/3', 30.29),
  ('produto-10', 1, 'Vestido polo gatinha tenista', '6 VERDE', 83.83),
  ('produto-11', 0, 'Blusa bailarina manga babado', '2/3', 42.86),
  ('produto-12', 0, 'Vestido floral passarinhos creme', '2', 87.82),
  ('produto-13', 0, 'Vestido polo listrado', '2', 103.38),
  ('produto-14', 0, 'Conjunto onça blusa e saia short', '1', 87.00),
  ('produto-14', 1, 'Conjunto onça blusa e saia short', '3', 93.00),
  ('produto-15', 0, 'Conjunto gatinho verde lima', '1', 30.29),
  ('produto-16', 0, 'Bermuda ciclista estampada', '4', 36.00),
  ('produto-17', 0, 'Blusa básica branca', '2/1/3  10 R$ 36,00', 30.29),
  ('produto-18', 0, 'Blusa ribana manga babado lilás', '1/3/10', 26.38),
  ('produto-19', 0, 'Conjunto laços blusa e short', '1/3', 58.48),
  ('produto-19', 1, 'Conjunto laços blusa e short', '6 VERDE', 136.49),
  ('produto-20', 0, 'Conjunto cachorrinho blusa e short', '4/3', 79.90),
  ('produto-21', 0, 'Conjunto princesa blusa e bermuda', '3', 69.59),
  ('produto-21', 1, 'Conjunto princesa blusa e bermuda', '4', 83.87),
  ('produto-21', 2, 'Conjunto princesa blusa e bermuda', '4', 57.71),
  ('produto-22', 0, 'Legging corações preta', '4/6', 46.00),
  ('produto-23', 0, 'Calça xadrez preta', '3/4', 40.00),
  ('produto-24', 0, 'Saia short rosa', '8/6/4 E 3 PRETA 4/6/10', 80.00),
  ('produto-25', 0, 'Conjunto flor blusa e short laranja', '4', 93.00),
  ('produto-26', 0, 'Conjunto blusa e bermuda estampada', '4', 93.75),
  ('produto-27', 0, 'Blusa bailarina rosa', '4', 33.50),
  ('produto-27', 1, 'Blusa bailarina rosa', '8', 46.60),
  ('produto-28', 0, 'Vestido passarinhos creme', '4', 97.50),
  ('produto-29', 0, 'Vestido passarinhos rosa', '4', 97.50),
  ('produto-30', 0, 'Conjunto estampado verde blusa e short', '6 ROSA', 200.00),
  ('produto-31', 0, 'Conjunto blusa branca e legging estampada', '6/10 E UMA 10 PRETA', 72.00),
  ('produto-32', 0, 'Conjunto floral cropped e saia', '8/1O', 150.00),
  ('produto-33', 0, 'Conjunto Paris blusa e legging', '8', 75.00),
  ('produto-34', 0, 'Vestido branco manga sino', '12/14/16', 234.00),
  ('produto-35', 0, 'Conjunto branco regata e calça', '10', 282.79),
  ('produto-36', 0, 'Conjunto tropical blusa e short', '16/14', 166.00),
  ('produto-37', 0, 'Conjunto cropped e short pink', '10', 115.40),
  ('produto-38', 0, 'Bermuda ciclista preta', '14', 37.00),
  ('produto-39', 0, 'Blusa canelada decote V', '14', 58.48),
  ('produto-40', 0, 'Vestido amarelo lima com babados', '12', 100.00),
  ('produto-41', 0, 'Camiseta aranha vermelha', '2/4/6', 47.00),
  ('produto-42', 0, 'Camiseta jacaré bege', '1/2/3 E VERDE 2/3', 20.00),
  ('produto-43', 0, 'Conjunto dino camiseta e bermuda verde', '1/3', 68.90),
  ('produto-44', 0, 'Macacão azul', 'M/GG/G AMARELO P', 99.90),
  ('produto-45', 0, 'Conjunto camiseta vermelha e bermuda mescla', '2/3/4/8', 83.83),
  ('produto-46', 0, 'Conjunto dino vermelho camiseta e bermuda', '1/3', 65.21),
  ('produto-47', 0, 'Conjunto polo menta e bermuda', '3/6/8', 111.66),
  ('produto-48', 0, 'Camiseta cachorrinho vermelha', '3', 46.60),
  ('produto-49', 0, 'Camiseta palmeiras preta', '10/12', 100.00),
  ('produto-50', 0, 'Camiseta dino marinho', '3/4', 67.10),
  ('produto-51', 0, 'Camiseta manga longa camping vermelha', '4', 50.00),
  ('produto-52', 0, 'Camiseta bege', '4', 130.00),
  ('produto-53', 0, 'Camiseta marinho básica', '4/6/8/12', 45.00),
  ('produto-54', 0, 'Polo branca', '4/6/8/14', 50.00),
  ('produto-55', 0, 'Camiseta manga longa herói verde', '4/6/8', 42.00),
  ('produto-56', 0, 'Bermuda moletom preta', '4/6/8', 50.00),
  ('produto-57', 0, 'Camiseta laranja estampada', '4/6/8', 40.00),
  ('produto-58', 0, 'Camiseta manga longa marinho', '6', 50.00),
  ('produto-59', 0, 'Camiseta manga longa branca', '6', 50.00),
  ('produto-60', 0, 'Camiseta branca básica', '6/8/12/14', 40.00),
  ('produto-61', 0, 'Camiseta preta básica', '6/8/12', 47.00),
  ('produto-62', 0, 'Camiseta amarela estampada', '8', 93.00),
  ('produto-63', 0, 'Conjunto masculino azul', '14/12', 200.00)
on conflict (product_id, variant_index) do update set
  product_name = excluded.product_name,
  size_label = excluded.size_label,
  unit_price = excluded.unit_price,
  active = true;

create table if not exists public.store_orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default ('KYN-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))),
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  zip_code text not null,
  address_line text not null,
  address_number text not null,
  complement text,
  neighborhood text not null,
  city text not null,
  state text not null,
  delivery_method text not null check (delivery_method in ('shipping','malinha')),
  payment_method text not null check (payment_method in ('pix','credit','debit')),
  subtotal numeric(10,2) not null check (subtotal >= 0),
  shipping_fee numeric(10,2) not null default 0 check (shipping_fee >= 0),
  total numeric(10,2) not null check (total >= 0),
  payment_status text not null default 'pending' check (payment_status in ('pending','paid','failed','refunded')),
  fulfillment_status text not null default 'received' check (fulfillment_status in ('received','preparing','shipped','delivered','cancelled')),
  shipping_status text not null default 'quote_pending' check (shipping_status in ('quote_pending','label_created','in_transit','delivered')),
  created_at timestamptz not null default now()
);

create table if not exists public.store_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.store_orders(id) on delete cascade,
  product_id text not null,
  product_name text not null,
  size_label text not null,
  quantity integer not null check (quantity between 1 and 20),
  unit_price numeric(10,2) not null check (unit_price >= 0),
  line_total numeric(10,2) not null check (line_total >= 0)
);

create table if not exists public.store_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  created_at timestamptz not null default now()
);

alter table public.store_catalog_variants enable row level security;
alter table public.store_orders enable row level security;
alter table public.store_order_items enable row level security;
alter table public.store_admins enable row level security;

drop policy if exists "Catalog prices are public" on public.store_catalog_variants;
create policy "Catalog prices are public" on public.store_catalog_variants
for select to anon, authenticated using (active = true);

drop policy if exists "Admins can read their own admin record" on public.store_admins;
create policy "Admins can read their own admin record" on public.store_admins
for select to authenticated using (user_id = auth.uid());

drop policy if exists "Admins can read orders" on public.store_orders;
create policy "Admins can read orders" on public.store_orders
for select to authenticated using (
  exists (select 1 from public.store_admins a where a.user_id = auth.uid())
);

drop policy if exists "Admins can update orders" on public.store_orders;
create policy "Admins can update orders" on public.store_orders
for update to authenticated using (
  exists (select 1 from public.store_admins a where a.user_id = auth.uid())
) with check (
  exists (select 1 from public.store_admins a where a.user_id = auth.uid())
);

drop policy if exists "Admins can read order items" on public.store_order_items;
create policy "Admins can read order items" on public.store_order_items
for select to authenticated using (
  exists (select 1 from public.store_admins a where a.user_id = auth.uid())
);

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
  if jsonb_typeof(p_items) <> 'array' then
    raise exception 'Carrinho inválido';
  end if;
  if jsonb_array_length(p_items) < 1 or jsonb_array_length(p_items) > 50 then
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
    p_delivery_method, p_payment_method, 0, v_shipping_fee, 0, 'pending', 'received',
    case when p_delivery_method = 'shipping' then 'quote_pending' else 'quote_pending' end
  ) returning id, order_number into v_order_id, v_order_number;

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    v_quantity := (v_item->>'quantity')::integer;
    if v_quantity < 1 or v_quantity > 20 then raise exception 'Quantidade inválida'; end if;

    select * into v_variant
    from public.store_catalog_variants
    where product_id = v_item->>'product_id'
      and variant_index = (v_item->>'variant_index')::integer
      and active = true;

    if not found then raise exception 'Produto ou tamanho indisponível'; end if;
    v_line_total := v_variant.unit_price * v_quantity;
    v_subtotal := v_subtotal + v_line_total;

    insert into public.store_order_items (
      order_id, product_id, product_name, size_label, quantity, unit_price, line_total
    ) values (
      v_order_id, v_variant.product_id, v_variant.product_name, v_variant.size_label,
      v_quantity, v_variant.unit_price, v_line_total
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

-- Permissões SQL explícitas; RLS continua controlando quais linhas cada perfil acessa.
grant select on public.store_catalog_variants to anon, authenticated;
grant select on public.store_admins, public.store_orders, public.store_order_items to authenticated;
grant update on public.store_orders to authenticated;
