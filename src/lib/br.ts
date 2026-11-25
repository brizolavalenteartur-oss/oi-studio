/** Utilidades de formulário para o Brasil: máscaras, CPF e consulta de CEP. */

export const onlyDigits = (value: string) => value.replace(/\D/g, "");

export function maskCep(value: string) {
  const d = onlyDigits(value).slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
}

export function maskCpf(value: string) {
  const d = onlyDigits(value).slice(0, 11);
  return d
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1-$2");
}

export function maskPhone(value: string) {
  const d = onlyDigits(value).slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/** Mesma regra da função is_valid_cpf do banco. */
export function isValidCpf(value: string) {
  const d = onlyDigits(value);
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  for (const pos of [9, 10]) {
    let sum = 0;
    for (let i = 0; i < pos; i++) sum += Number(d[i]) * (pos + 1 - i);
    const check = ((sum * 10) % 11) % 10;
    if (check !== Number(d[pos])) return false;
  }
  return true;
}

export type CepAddress = { street: string; neighborhood: string; city: string; state: string };

/** Consulta o ViaCEP. Retorna null quando o CEP não existe ou o serviço não responde. */
export async function lookupCep(cep: string, signal?: AbortSignal): Promise<CepAddress | null> {
  const digits = onlyDigits(cep);
  if (digits.length !== 8) return null;
  try {
    const response = await fetch(
      `https://viacep.com.br/ws/${digits}/json/`,
      signal ? { signal } : {},
    );
    if (!response.ok) return null;
    const data = (await response.json()) as {
      erro?: boolean;
      logradouro?: string;
      bairro?: string;
      localidade?: string;
      uf?: string;
    };
    if (data.erro) return null;
    return {
      street: data.logradouro ?? "",
      neighborhood: data.bairro ?? "",
      city: data.localidade ?? "",
      state: data.uf ?? "",
    };
  } catch {
    return null;
  }
}
