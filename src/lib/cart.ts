import { useCallback, useEffect, useMemo, useState } from "react";
import type { ProductVariant, StoreProduct } from "@/data/products";

/** O que fica salvo no navegador: só ids e quantidades. Preço e estoque vêm sempre do catálogo. */
type StoredLine = { productId: string; variantIndex: number; quantity: number };

export type CartLine = {
  product: StoreProduct;
  variant: ProductVariant;
  quantity: number;
};

const STORAGE_KEY = "kyn-kids-sacola-v1";
const MAX_PER_LINE = 20; // mesmo limite do banco

function readStored(): StoredLine[] {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (line): line is StoredLine =>
        typeof line?.productId === "string" &&
        Number.isInteger(line?.variantIndex) &&
        Number.isInteger(line?.quantity) &&
        line.quantity > 0,
    );
  } catch {
    return [];
  }
}

function writeStored(lines: StoredLine[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  } catch {
    // Navegação privada ou armazenamento bloqueado: a sacola funciona só nesta aba.
  }
}

export function useCart(catalog: StoreProduct[]) {
  const [stored, setStored] = useState<StoredLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Lê depois de montar, para o HTML do servidor e do navegador baterem.
  useEffect(() => {
    setStored(readStored());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) writeStored(stored);
  }, [stored, hydrated]);

  const lines = useMemo<CartLine[]>(() => {
    const result: CartLine[] = [];
    for (const line of stored) {
      const product = catalog.find((item) => item.id === line.productId);
      const variant = product?.variants.find((item) => item.index === line.variantIndex);
      if (!product || !variant) continue;
      result.push({ product, variant, quantity: line.quantity });
    }
    return result;
  }, [stored, catalog]);

  const add = useCallback((productId: string, variantIndex: number, quantity = 1) => {
    setStored((current) => {
      const existing = current.find(
        (line) => line.productId === productId && line.variantIndex === variantIndex,
      );
      if (existing) {
        return current.map((line) =>
          line === existing
            ? { ...line, quantity: Math.min(MAX_PER_LINE, line.quantity + quantity) }
            : line,
        );
      }
      return [...current, { productId, variantIndex, quantity: Math.min(MAX_PER_LINE, quantity) }];
    });
  }, []);

  const setQuantity = useCallback((productId: string, variantIndex: number, quantity: number) => {
    setStored((current) =>
      quantity <= 0
        ? current.filter(
            (line) => !(line.productId === productId && line.variantIndex === variantIndex),
          )
        : current.map((line) =>
            line.productId === productId && line.variantIndex === variantIndex
              ? { ...line, quantity: Math.min(MAX_PER_LINE, quantity) }
              : line,
          ),
    );
  }, []);

  const clear = useCallback(() => setStored([]), []);

  const count = lines.reduce((sum, line) => sum + line.quantity, 0);
  const total = lines.reduce((sum, line) => sum + line.variant.price * line.quantity, 0);
  /** Linhas pedindo mais do que há em estoque (ex.: alguém comprou enquanto a sacola estava salva). */
  const problems = lines.filter((line) => line.quantity > line.variant.stock);

  return { lines, count, total, problems, add, setQuantity, clear };
}
