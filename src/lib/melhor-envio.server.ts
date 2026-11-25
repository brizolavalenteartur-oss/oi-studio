import { supabaseAdmin } from "@/integrations/supabase/client.server";

type TokenResponse = {
  access_token?: string;
  refresh_token?: string;
  token_type?: string;
  expires_in?: number;
  scope?: string;
};

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Configuração ausente no servidor: ${name}`);
  return value;
}

function tokenEndpoint(): string {
  const environment = process.env['MELHOR_ENVIO_ENVIRONMENT'] === "sandbox"
    ? "https://sandbox.melhorenvio.com.br"
    : "https://melhorenvio.com.br";
  return `${environment}/oauth/token`;
}

async function requestToken(body: URLSearchParams): Promise<TokenResponse> {
  const response = await fetch(tokenEndpoint(), {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": requiredEnv("MELHOR_ENVIO_USER_AGENT"),
    },
    body,
    signal: AbortSignal.timeout(15000),
  });
  const payload = await response.json().catch(() => ({})) as TokenResponse & { message?: string };
  if (!response.ok || !payload.access_token || !payload.refresh_token) {
    console.error("[Melhor Envio] Falha na solicitação/renovação do token:", response.status);
    throw new Error("Não foi possível autenticar com o Melhor Envio. Verifique as credenciais e tente reconectar.");
  }
  return payload;
}

export async function exchangeAuthorizationCode(code: string, redirectUri: string) {
  const payload = await requestToken(new URLSearchParams({
    grant_type: "authorization_code",
    client_id: requiredEnv("MELHOR_ENVIO_CLIENT_ID"),
    client_secret: requiredEnv("MELHOR_ENVIO_CLIENT_SECRET"),
    redirect_uri: redirectUri,
    code,
  }));
  return persistTokens(payload);
}

async function persistTokens(payload: TokenResponse) {
  const now = Date.now();
  const expiresIn = Number(payload.expires_in) || 2_592_000;
  const { error } = await supabaseAdmin.from("melhor_envio_credentials").upsert({
    id: "primary",
    access_token: payload.access_token!,
    refresh_token: payload.refresh_token!,
    token_type: payload.token_type || "Bearer",
    scope: payload.scope || null,
    expires_at: new Date(now + expiresIn * 1000).toISOString(),
    refresh_expires_at: new Date(now + 45 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(now).toISOString(),
  }, { onConflict: "id" });
  if (error) {
    console.error("[Melhor Envio] Não foi possível salvar as credenciais:", error.message);
    throw new Error("A autorização foi recebida, mas o servidor não conseguiu guardar as credenciais. Verifique a configuração Supabase do servidor.");
  }
}

export async function getValidMelhorEnvioAccessToken(): Promise<string> {
  const { data, error } = await supabaseAdmin
    .from("melhor_envio_credentials")
    .select("access_token, refresh_token, expires_at, refresh_expires_at")
    .eq("id", "primary")
    .maybeSingle();

  if (error) throw new Error("Não foi possível consultar a conexão com o Melhor Envio.");
  if (!data) throw new Error("A conta do Melhor Envio ainda não foi conectada.");

  const now = Date.now();
  if (new Date(data.expires_at).getTime() > now + 5 * 60 * 1000) {
    return data.access_token;
  }
  if (new Date(data.refresh_expires_at).getTime() <= now) {
    throw new Error("A autorização do Melhor Envio expirou. Conecte a conta novamente pelo painel da loja.");
  }

  const payload = await requestToken(new URLSearchParams({
    grant_type: "refresh_token",
    client_id: requiredEnv("MELHOR_ENVIO_CLIENT_ID"),
    client_secret: requiredEnv("MELHOR_ENVIO_CLIENT_SECRET"),
    refresh_token: data.refresh_token,
  }));
  await persistTokens(payload);
  return payload.access_token!;
}
