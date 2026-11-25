import { Link } from "@tanstack/react-router";
import { formatPrice, inStock, startingPrice, type StoreProduct } from "@/data/products";
import { ArrowUpRight } from "lucide-react";

type Props = { product: StoreProduct; onSelect: (product: StoreProduct) => void };

/** Link real para a página do produto (bom para Google e para abrir em nova aba);
 *  um clique normal abre a visualização rápida. */
export function ProductCard({ product, onSelect }: Props) {
  const available = inStock(product);
  const prices = new Set(
    product.variants.filter((variant) => variant.stock > 0).map((variant) => variant.price),
  );
  const quickView = (event: React.MouseEvent) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
    event.preventDefault();
    onSelect(product);
  };
  return (
    <article className={available ? "product-card group" : "product-card group sold-out"}>
      <Link
        to="/produto/$id"
        params={{ id: product.id }}
        className="product-image-wrap"
        onClick={quickView}
        aria-label={`Ver ${product.name}`}
      >
        <img src={product.image} alt={product.name} loading="lazy" />
        {!available && <span className="product-tag">Esgotado</span>}
        <span className="product-arrow">
          <ArrowUpRight size={18} />
        </span>
      </Link>
      <div className="product-info">
        <span className="product-category">{product.category}</span>
        <h3>
          <Link to="/produto/$id" params={{ id: product.id }} onClick={quickView}>
            {product.name}
          </Link>
        </h3>
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
