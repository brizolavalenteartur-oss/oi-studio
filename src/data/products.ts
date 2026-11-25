import { supabase } from "@/integrations/supabase/client";

export type ProductCategory = "Meninas" | "Meninos" | "Bebês" | "Conjuntos";

/** Uma variante = um tamanho + uma cor, com preço e estoque próprios. */
export type ProductVariant = {
  index: number;
  size: string;
  color: string;
  price: number;
  stock: number;
};

export type StoreProduct = {
  id: string;
  name: string;
  category: ProductCategory;
  image: string;
  description: string | null;
  variants: ProductVariant[];
};

export const formatPrice = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const variantLabel = (variant: Pick<ProductVariant, "size" | "color">) =>
  variant.color ? `${variant.size} · ${variant.color}` : variant.size;

export const inStock = (product: StoreProduct) =>
  product.variants.some((variant) => variant.stock > 0);

/** Menor preço entre as variantes com estoque (ou entre todas, se esgotado). */
export const startingPrice = (product: StoreProduct) => {
  const available = product.variants.filter((variant) => variant.stock > 0);
  const pool = available.length ? available : product.variants;
  return Math.min(...pool.map((variant) => variant.price));
};

/** Catálogo vem do Supabase: é a mesma fonte que o banco usa para validar preço e estoque no pedido. */
export async function fetchCatalog(): Promise<StoreProduct[]> {
  const { data, error } = await supabase
    .from("store_products")
    .select(
      "id, name, category, image_url, description, position, store_catalog_variants(variant_index, size_label, color, unit_price, stock, active)",
    )
    .eq("active", true)
    .order("position");
  if (error) throw new Error(`Não foi possível carregar o catálogo: ${error.message}`);

  return (data ?? [])
    .map((row) => ({
      id: row.id,
      name: row.name,
      category: row.category as ProductCategory,
      image: row.image_url,
      description: row.description,
      variants: row.store_catalog_variants
        .filter((variant) => variant.active)
        .sort((a, b) => a.variant_index - b.variant_index)
        .map((variant) => ({
          index: variant.variant_index,
          size: variant.size_label,
          color: variant.color,
          price: Number(variant.unit_price),
          stock: variant.stock,
        })),
    }))
    .filter((product) => product.variants.length > 0);
}
