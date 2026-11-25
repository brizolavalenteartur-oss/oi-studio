# KYN KIDS — notas para agentes

- Stack: TanStack Start (React 19) + Vite + Supabase, hospedado na Vercel (Nitro detecta o preset).
- Banco: as mudanças de schema ficam em `supabase/migrations/` e são aplicadas no projeto Supabase da loja.
- Segredos (service role, Melhor Envio, pagamento) ficam só nas variáveis de ambiente da Vercel, nunca no repositório.
- O código de servidor que usa a service role fica em arquivos `*.server.ts` e é importado só dentro de handlers de servidor.
