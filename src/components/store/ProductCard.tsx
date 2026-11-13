import type { StoreProduct } from "@/data/products";
import { ArrowUpRight } from "lucide-react";

type Props = { product: StoreProduct; onSelect: (product: StoreProduct) => void };

export function ProductCard({ product, onSelect }: Props) {
  return (
    <article className="product-card group">
      <button className="product-image-wrap" onClick={() => onSelect(product)} aria-label={`Consultar ${product.name}`}>
        <img src={product.image} alt={product.name} loading="lazy" />
        {product.tag && <span className="product-tag">{product.tag}</span>}
        <span className="product-arrow"><ArrowUpRight size={18} /></span>
      </button>
      <div className="product-info">
        <span className="product-category">{product.category} · {product.age}</span>
        <h3>{product.name}</h3>
        <button className="product-link" onClick={() => onSelect(product)}>Consultar disponibilidade <ArrowUpRight size={15} /></button>
      </div>
    </article>
  );
}
