import { formatPrice, inStock, startingPrice, type StoreProduct } from "@/data/products";
import { ArrowUpRight } from "lucide-react";

type Props = { product: StoreProduct; onSelect: (product: StoreProduct) => void };

export function ProductCard({ product, onSelect }: Props) {
  const available = inStock(product);
  const prices = new Set(
    product.variants.filter((variant) => variant.stock > 0).map((variant) => variant.price),
  );
  return (
    <article className={available ? "product-card group" : "product-card group sold-out"}>
      <button
        className="product-image-wrap"
        onClick={() => onSelect(product)}
        aria-label={`Consultar ${product.name}`}
      >
        <img src={product.image} alt={product.name} loading="lazy" />
        {!available && <span className="product-tag">Esgotado</span>}
        <span className="product-arrow">
          <ArrowUpRight size={18} />
        </span>
      </button>
      <div className="product-info">
        <span className="product-category">{product.category}</span>
        <h3>{product.name}</h3>
        <p className="product-price">
          {prices.size > 1 ? "A partir de " : ""}
          {formatPrice(startingPrice(product))}
        </p>
        <button className="product-link" onClick={() => onSelect(product)}>
          {available ? "Ver tamanhos" : "Ver peça"} <ArrowUpRight size={15} />
        </button>
      </div>
    </article>
  );
}
