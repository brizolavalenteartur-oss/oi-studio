# Publicar a KYN KIDS sem o Lovable

O código desta branch usa o projeto Supabase **kyn-kids-loja** (São Paulo). O banco já está pronto: tabelas, estoque e catálogo com 63 produtos.

> Faça os passos 1 e 2 **antes** de juntar esta branch na `main`. Se o site publicado rodar este código ainda apontando para o banco do Lovable, a vitrine fica vazia (as tabelas novas não existem lá).

## 1. Variáveis de ambiente na Vercel

Vercel → projeto da loja → **Settings → Environment Variables**. Para cada variável abaixo, marque **Production** e **Preview**.

| Variável | Valor |
|---|---|
| `VITE_SUPABASE_URL` | `https://vxuddfejktypncicnkby.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_1O9RGmbZca7UmkQu5UfSmA_mWWjBfk5` |
| `VITE_SUPABASE_PROJECT_ID` | `vxuddfejktypncicnkby` |
| `SUPABASE_URL` | `https://vxuddfejktypncicnkby.supabase.co` |
| `SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_1O9RGmbZca7UmkQu5UfSmA_mWWjBfk5` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → kyn-kids-loja → **Project Settings → API Keys** → chave *secret* / *service_role*. **Nunca** coloque essa chave no GitHub. |
| `MELHOR_ENVIO_*` | Mantenha os valores que já estão lá (`CLIENT_ID`, `CLIENT_SECRET`, `REDIRECT_URI`, `USER_AGENT`, `ENVIRONMENT`). |

A chave *publishable* e a URL são públicas (vão para o navegador). Só a *service role* é secreta.

Se houver variáveis antigas apontando para o projeto do Lovable (`awzqatkvdfa…`), troque o valor delas pelo da tabela.

## 2. Conta de administrador

1. Supabase → kyn-kids-loja → **Authentication → Users → Add user**: e-mail da loja e uma senha forte.
2. Copie o **UID** do usuário criado e rode no **SQL Editor**:

```sql
insert into public.store_admins (user_id, email)
values ('UID-DO-USUARIO', 'email-da-loja@exemplo.com');
```

## 3. Testar o preview

Ao enviar a branch `sair-do-lovable-estoque`, a Vercel gera um link de *preview*. Nele, confira:

- A vitrine mostra os produtos, e cada tamanho aparece separado.
- Em `/admin`, depois de entrar, a aba **Estoque** lista as peças. Ajuste as quantidades reais (o estoque inicial é 1 por tamanho).
- Faça um pedido de teste e veja o estoque baixar. Depois cancele o pedido no painel e veja a peça voltar.

## 4. Publicar

Junte a branch na `main` (pelo Pull Request no GitHub). A Vercel publica sozinha.

## 5. Melhor Envio

Os tokens do Melhor Envio ficavam no banco do Lovable. No painel `/admin`, clique em **Conectar Melhor Envio** de novo, para salvar os tokens no banco novo.

## Pedidos antigos

Os pedidos feitos antes desta mudança continuam no banco do Lovable Cloud. Para guardá-los, exporte pelo Lovable antes de desativar o projeto lá.
