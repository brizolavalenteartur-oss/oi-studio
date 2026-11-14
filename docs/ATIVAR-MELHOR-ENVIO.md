# Ativar a integração Melhor Envio — KYN KIDS

## 1. Executar a migration no Supabase

No projeto Supabase da KYN KIDS, abra **SQL Editor → New query** e execute todo o conteúdo do arquivo:

`supabase/migrations/20261114000100_melhor_envio_credentials.sql`

A tabela criada não possui acesso para `anon` nem `authenticated`; somente o servidor com a chave `service_role` poderá ler ou gravar tokens.

## 2. Configurar variáveis no Vercel

Abra o projeto KYN KIDS no Vercel → **Settings → Environment Variables**. Cadastre estas variáveis para **Production**:

| Nome | Valor |
|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Chave secreta do projeto Supabase (`sb_secret_...` ou service_role legacy). Nunca usar prefixo `VITE_`. |
| `MELHOR_ENVIO_CLIENT_ID` | Client ID do aplicativo criado na Área Dev. do Melhor Envio. |
| `MELHOR_ENVIO_CLIENT_SECRET` | Client Secret do aplicativo. Nunca colocar em variável `VITE_`. |
| `MELHOR_ENVIO_USER_AGENT` | `KYN KIDS (email de contato técnico da loja)`. Use um e-mail real de contato. |
| `MELHOR_ENVIO_REDIRECT_URI` | `https://kynkids.vercel.app/api/melhor-envio/callback` |

As variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` já usadas pela loja serão aproveitadas pelo servidor para identificar o projeto e validar a sessão administrativa. Não é necessário enviar esses valores pelo chat.

**Atenção:** não envie Client Secret, chave Supabase secreta ou tokens nesta conversa, em prints ou no GitHub. Insira-os diretamente no painel do Vercel.

## 3. Fazer o redeploy

Depois de salvar as variáveis, abra **Deployments** e faça um novo redeploy da versão mais recente de `main`.

## 4. Autorizar a conta

Quando a migration e o deploy estiverem concluídos:

1. Entre em `https://kynkids.vercel.app/admin` com o usuário administrador autorizado.
2. Clique em **Conectar Melhor Envio**.
3. Entre na conta Melhor Envio da loja e autorize o aplicativo.
4. O Melhor Envio retornará ao painel. O servidor trocará o código OAuth pelos tokens e os salvará na tabela privada.

O servidor renova o token de acesso quando necessário. O access token tem validade de 30 dias e o refresh token, de 45 dias, conforme a documentação do Melhor Envio.

## Limites desta etapa

Esta entrega implementa a autorização OAuth e a persistência/renovação dos tokens. Ela ainda não implementa a cotação de frete no checkout, seleção de transportadora, compra/impressão de etiqueta ou atualização automática de rastreio. Essas etapas vêm depois de confirmar que a conta foi conectada.
