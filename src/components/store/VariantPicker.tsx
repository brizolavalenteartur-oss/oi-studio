import { useState } from "react";
import { ShoppingBag } from "lucide-react";
import { formatPrice, variantLabel, type StoreProduct } from "@/data/products";
import { useShop } from "./ShopLayout";

type Props = { product: StoreProduct; onAdded?: () => void };

/** Escolha de tamanho/cor com estoque e botão "Adicionar à sacola". */
export function VariantPicker({ product, onAdded }: Props) {
  const { cart, openBag } = useShop();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(
    () => product.variants.find((variant) => variant.stock > 0)?.index ?? null,
  );

  const selected = product.variants.find((variant) => variant.index === selectedIndex) ?? null;
  const inBag =
    cart.lines.find(
      (line) => line.product.id === product.id && line.variant.index === selectedIndex,
    )?.quantity ?? 0;
  const canAdd = !!selected && inBag < selected.stock;

  const add = () => {
    if (!selected || !canAdd) return;
    cart.add(product.id, selected.index);
    onAdded?.();
    openBag();
  };

  return (
    <>
      <p className="variant-label">Escolha o tamanho e confira o valor:</p>
      <div className="variant-options" role="radiogroup" aria-label="Tamanhos">
        {product.variants.map((variant) => {
          const soldOut = variant.stock <= 0;
          return (
            <button
              type="button"
              role="radio"
              key={variant.index}
              disabled={soldOut}
              aria-checked={selectedIndex === variant.index}
              className={[
                "variant-option",
                selectedIndex === variant.index ? "selected" : "",
                soldOut ? "sold-out" : "",
              ]
                .join(" ")
                .trim()}
              onClick={() => setSelectedIndex(variant.index)}
            >
              <span>
                Tamanho {variantLabel(variant)}
                {soldOut ? " · esgotado" : variant.stock === 1 ? " · última peça" : ""}
              </span>
              <b>{formatPrice(variant.price)}</b>
            </button>
          );
        })}
      </div>
      {!selected && (
        <p className="modal-availability">
          Todos os tamanhos desta peça estão esgotados no momento.
        </p>
      )}
      {selected && !canAdd && (
        <p className="modal-availability">
          Você já colocou na sacola todas as unidades disponíveis deste tamanho.
        </p>
      )}
      <button className="button-primary full-button" disabled={!canAdd} onClick={add}>
        Adicionar à sacola <ShoppingBag size={17} />
      </button>
    </>
  );
}
