# Ativação do checkout e painel KYN KIDS

O código do checkout e do painel está no repositório. Para receber pedidos reais, é necessário aplicar a migração no projeto Supabase conectado à loja.

## 1. Aplicar o banco de dados

1. Abra o projeto Supabase conectado à KYN KIDS.
2. Entre em **SQL Editor**.
3. Abra o arquivo `supabase/migrations/20261113000100_kyn_kids_orders.sql` no GitHub.
4. Copie todo o SQL e execute no SQL Editor.

A migração cria:
- Catálogo de preços e tamanhos usado para validar os itens do pedido no servidor.
- Tabela de pedidos com dados de entrega, forma de pagamento e situação.
- Tabela de itens de cada pedido.
- Regras de segurança (RLS) para que os dados dos clientes não fiquem públicos.
- Função transacional que valida os produtos e registra o pedido.

Se o projeto já usa Supabase, mantenha as variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` configuradas no ambiente de deploy. Não coloque chaves secretas no código do navegador.

## 2. Criar o acesso da loja

1. No Supabase, abra **Authentication → Users**.
2. Crie um usuário para a responsável pela loja, usando o e-mail dela e uma senha forte.
3. Copie o UUID desse usuário.
4. No SQL Editor, execute o comando abaixo substituindo os dois valores pelos dados do usuário criado:

```sql
insert into public.store_admins (user_id, email)
values ('UUID-DO-USUARIO', 'EMAIL-DA-LOJA');
```

O painel ficará disponível em `/admin`. Somente usuários cadastrados em `store_admins` conseguem consultar os pedidos.

## 3. O que já fica registrado

- Nome, e-mail e telefone do cliente.
- CEP, rua, número, complemento, bairro, cidade e estado.
- Produtos, tamanhos, quantidades e valores validados no banco.
- Forma de pagamento escolhida (Pix, crédito ou débito).
- Situação do pagamento e do preparo do pedido.
- Número único do pedido e data de recebimento.

## 4. O que ainda precisa ser conectado

**Pagamento online:** nesta etapa o site registra a opção escolhida, mas não cobra o cliente. O pedido aparece como aguardando pagamento. Para cobrar Pix e cartões dentro do site, é necessário escolher e integrar um provedor de pagamento (por exemplo, uma solução empresarial compatível com a conta da loja), configurar credenciais secretas no servidor e confirmar pagamentos por webhook. Não compartilhe tokens ou senhas no GitHub.

**Frete:** o pedido salva o endereço e fica com frete pendente de cálculo. Para mostrar preço de entrega automaticamente e emitir etiquetas, será necessária integração com Correios ou um intermediador logístico, com as credenciais correspondentes.

**Estoque:** o catálogo atual informa tamanhos e preços, mas ainda não controla unidades disponíveis em estoque. A confirmação de disponibilidade continua sendo uma etapa da loja.

Não anuncie o checkout como pagamento concluído até que o provedor de pagamento esteja integrado e testado em ambiente de homologação.
