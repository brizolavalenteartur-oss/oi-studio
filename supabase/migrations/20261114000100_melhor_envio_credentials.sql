-- KYN KIDS: credenciais OAuth do Melhor Envio.
-- Esta tabela só pode ser acessada pelo servidor usando a chave service role.
create table if not exists public.melhor_envio_credentials (
  id text primary key default 'primary' check (id = 'primary'),
  access_token text not null,
  refresh_token text not null,
  token_type text not null default 'Bearer',
  scope text,
  expires_at timestamptz not null,
  refresh_expires_at timestamptz not null,
  updated_at timestamptz not null default now()
);

alter table public.melhor_envio_credentials enable row level security;
revoke all on table public.melhor_envio_credentials from anon, authenticated;
grant all on table public.melhor_envio_credentials to service_role;
