import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

const REDIRECT_URI = process.env.MELHOR_ENVIO_REDIRECT_URI
  || "https://kynkids.vercel.app/api/melhor-envio/callback";

export const Route = createFileRoute("/api/melhor-envio/authorize")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const authorization = request.headers.get("authorization") || "";
          const accessToken = authorization.startsWith("Bearer ")
            ? authorization.slice(7)
            : "";
          if (!accessToken) {
            return Response.json({ error: "Faça login como administradora para conectar o Melhor Envio." }, { status: 401 });
          }

          const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
          const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
          const clientId = process.env.MELHOR_ENVIO_CLIENT_ID;
          if (!supabaseUrl || !publishableKey || !clientId || !process.env.MELHOR_ENVIO_CLIENT_SECRET || !process.env.MELHOR_ENVIO_USER_AGENT || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
            return Response.json({
              error: "Falta configurar variáveis privadas do servidor no Vercel: SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, SUPABASE_SERVICE_ROLE_KEY, MELHOR_ENVIO_CLIENT_ID, MELHOR_ENVIO_CLIENT_SECRET e MELHOR_ENVIO_USER_AGENT.",
            }, { status: 503 });
          }

          const authClient = createClient(supabaseUrl, publishableKey, {
            auth: { persistSession: false, autoRefreshToken: false },
          });
          const { data: claimsData, error: claimsError } = await authClient.auth.getClaims(accessToken);
          const userId = claimsData?.claims?.sub;
          if (claimsError || typeof userId !== "string") {
            return Response.json({ error: "Sua sessão expirou. Entre novamente no painel." }, { status: 401 });
          }

          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { data: admin, error: adminError } = await (supabaseAdmin as any)
            .from("store_admins")
            .select("user_id")
            .eq("user_id", userId)
            .maybeSingle();
          if (adminError || !admin) {
            return Response.json({ error: "Somente uma administradora autorizada pode conectar a conta." }, { status: 403 });
          }

          const state = crypto.randomUUID();
          const baseUrl = process.env.MELHOR_ENVIO_ENVIRONMENT === "sandbox"
            ? "https://sandbox.melhorenvio.com.br"
            : "https://melhorenvio.com.br";
          const authorizationUrl = new URL("/oauth/authorize", baseUrl);
          authorizationUrl.searchParams.set("client_id", clientId);
          authorizationUrl.searchParams.set("redirect_uri", REDIRECT_URI);
          authorizationUrl.searchParams.set("response_type", "code");
          authorizationUrl.searchParams.set("state", state);
          authorizationUrl.searchParams.set("scope", "ecommerce-shipping");

          return Response.json(
            { authorizationUrl: authorizationUrl.toString() },
            {
              headers: {
                "Set-Cookie": `kyn_me_oauth_state=${state}; HttpOnly; Secure; SameSite=Lax; Path=/api/melhor-envio/callback; Max-Age=600`,
                "Cache-Control": "no-store",
              },
            },
          );
        } catch (error) {
          console.error("[Melhor Envio] Erro ao iniciar autorização:", error);
          return Response.json({ error: "Não foi possível iniciar a conexão com o Melhor Envio." }, { status: 500 });
        }
      },
    },
  },
});
