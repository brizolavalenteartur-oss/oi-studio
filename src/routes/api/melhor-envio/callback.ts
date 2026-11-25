import { createFileRoute } from "@tanstack/react-router";

const REDIRECT_URI = process.env['MELHOR_ENVIO_REDIRECT_URI']
  || "https://kynkids.vercel.app/api/melhor-envio/callback";

function clearStateCookie() {
  return "kyn_me_oauth_state=; HttpOnly; Secure; SameSite=Lax; Path=/api/melhor-envio/callback; Max-Age=0";
}

function redirectToAdmin(request: Request, result: "connected" | "error") {
  const destination = new URL("/admin", request.url);
  destination.searchParams.set("melhor_envio", result);
  return new Response(null, {
    status: 303,
    headers: {
      Location: destination.toString(),
      "Set-Cookie": clearStateCookie(),
      "Cache-Control": "no-store",
    },
  });
}

export const Route = createFileRoute("/api/melhor-envio/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const cookieHeader = request.headers.get("cookie") || "";
        const stateCookie = cookieHeader
          .split(";")
          .map((part) => part.trim())
          .find((part) => part.startsWith("kyn_me_oauth_state="))
          ?.slice("kyn_me_oauth_state=".length);
        const returnedState = url.searchParams.get("state");
        const code = url.searchParams.get("code");
        const providerError = url.searchParams.get("error");

        if (providerError || !stateCookie || !returnedState || stateCookie !== returnedState || !code) {
          return redirectToAdmin(request, "error");
        }

        try {
          const { exchangeAuthorizationCode } = await import("@/lib/melhor-envio.server");
          await exchangeAuthorizationCode(code, REDIRECT_URI);
          return redirectToAdmin(request, "connected");
        } catch (error) {
          console.error("[Melhor Envio] Falha no callback OAuth:", error);
          return redirectToAdmin(request, "error");
        }
      },
    },
  },
});
