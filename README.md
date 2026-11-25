# KYN KIDS — loja online

Loja de moda infanto-juvenil: TanStack Start (React 19) + Vite + Supabase, hospedada na Vercel.

## Rodar localmente

```sh
npm install
cp .env.example .env   # preencha com os dados do seu projeto Supabase
npm run dev            # http://localhost:8080
```

## Banco de dados

As migrations ficam em `supabase/migrations/`. Aplique-as no projeto Supabase da loja (SQL Editor do painel ou `supabase db push`).

Consulte [docs/ATIVAR-CHECKOUT-KYN-KIDS.md](docs/ATIVAR-CHECKOUT-KYN-KIDS.md) para cadastrar a conta administradora. O painel privado fica em `/admin`.

## Deploy

A Vercel faz o build com `npm run build`. Cadastre as variáveis de `.env.example` em Settings → Environment Variables.
