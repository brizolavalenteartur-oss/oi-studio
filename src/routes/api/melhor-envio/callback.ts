import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/melhor-envio/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const authorizationError = url.searchParams.get("error");

        if (authorizationError) {
          return new Response(
            "A autorização do Melhor Envio não foi concluída. Você pode fechar esta página e tentar novamente pelo painel da KYN KIDS.",
            {
              status: 400,
              headers: { "content-type": "text/plain; charset=utf-8" },
            },
          );
        }

        // The endpoint is reserved for the OAuth callback. Token exchange and
        // secure persistence must be enabled before anyone authorizes the app.
        if (url.searchParams.has("code")) {
          return new Response(
            "O retorno de autorização foi recebido, mas a integração ainda não está habilitada. Não tente conectar a conta até a configuração do servidor ser concluída.",
            {
              status: 503,
              headers: {
                "content-type": "text/plain; charset=utf-8",
                "cache-control": "no-store",
              },
            },
          );
        }

        return new Response(
          "Endpoint de retorno do Melhor Envio da KYN KIDS. A integração ainda está em configuração.",
          {
            status: 200,
            headers: {
              "content-type": "text/plain; charset=utf-8",
              "cache-control": "no-store",
            },
          },
        );
      },
    },
  },
});
