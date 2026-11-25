/** Endereço público da loja. Troque aqui quando houver domínio próprio (ex.: https://kynkids.com.br). */
export const SITE_URL = "https://kynkids.vercel.app";
export const SITE_NAME = "KYN KIDS";
export const INSTAGRAM_URL = "https://www.instagram.com/kynkidsmoda/";

export const absoluteUrl = (path: string) =>
  path.startsWith("http") ? path : `${SITE_URL}${path}`;
