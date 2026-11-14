import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/melhor-envio/diagnostico")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const response = await fetch(
            "https://melhorenvio.com.br/api/v2/me/shipment/services",
            {
              method: "GET",
              headers: {
                Accept: "application/json",
                "User-Agent": "KYN KIDS (contato técnico da loja)",
              },
              signal: AbortSignal.timeout(10000),
            },
          );

          return Response.json(
            {
              diagnostic: "melhor_envio_connectivity",
              reachable: true,
              upstreamStatus: response.status,
              upstreamContentType: response.headers.get("content-type"),
              interpretation:
                response.status === 401 || response.status === 403
                  ? "O servidor alcançou o Melhor Envio, mas a API recusou a chamada sem autenticação ou por política de acesso."
                  : response.ok
                    ? "A API respondeu sem bloqueio nesta chamada."
                    : "O Melhor Envio respondeu; é necessário investigar o código de retorno.",
            },
            {
              status: 200,
              headers: { "cache-control": "no-store" },
            },
          );
        } catch {
          return Response.json(
            {
              diagnostic: "melhor_envio_connectivity",
              reachable: false,
              interpretation:
                "A função da KYN KIDS não conseguiu estabelecer conexão com o Melhor Envio. Verifique rede, DNS ou bloqueio de saída.",
            },
            {
              status: 200,
              headers: { "cache-control": "no-store" },
            },
          );
        }
      },
    },
  },
});
