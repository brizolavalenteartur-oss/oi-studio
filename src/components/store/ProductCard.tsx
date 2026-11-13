import { formatPrice, startingPrice, type StoreProduct } from "@/data/products";
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
        <span className="product-category">{product.category}</span>
        <h3>{product.name}</h3>
        <p className="product-price">{product.variants.length > 1 ? "A partir de " : ""}{formatPrice(startingPrice(product))}</p>
        <button className="product-link" onClick={() => onSelect(product)}>Ver tamanhos <ArrowUpRight size={15} /></button>
      </div>
    </article>
  );
}
