import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import {
  availableSizes,
  formatPrice,
  inStock,
  startingPrice,
  totalStock,
  type StoreProduct,
} from "@/data/products";

type Props = { product: StoreProduct; onSelect: (product: StoreProduct) => void };

const MAX_SIZE_CHIPS = 5;

/** Link real para a página do produto (bom para Google e para abrir em nova aba);
 *  um clique normal abre a visualização rápida. */
export function ProductCard({ product, onSelect }: Props) {
  const available = inStock(product);
  const sizes = availableSizes(product);
  const prices = new Set(
    product.variants.filter((variant) => variant.stock > 0).map((variant) => variant.price),
  );
  const lastUnit = totalStock(product) === 1;
  const quickView = (event: React.MouseEvent) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
    event.preventDefault();
    onSelect(product);
  };
  return (
    <article className={available ? "product-card" : "product-card sold-out"}>
      <Link
        to="/produto/$id"
        params={{ id: product.id }}
        className="product-image-wrap"
        onClick={quickView}
        aria-label={`Ver ${product.name}`}
      >
        <img src={product.image} alt={product.name} loading="lazy" />
        {!available && <span className="product-tag">Esgotado</span>}
        {lastUnit && <span className="product-tag product-tag-hot">Última peça</span>}
        <span className="product-quick">
          Escolher tamanho <ArrowUpRight size={15} />
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
          {prices.size > 1 && <small>a partir de </small>}
          {formatPrice(startingPrice(product))}
        </p>
        {sizes.length > 0 && (
          <ul className="size-chips" aria-label="Tamanhos disponíveis">
            {sizes.slice(0, MAX_SIZE_CHIPS).map((size) => (
              <li key={size}>{size}</li>
            ))}
            {sizes.length > MAX_SIZE_CHIPS && <li>+{sizes.length - MAX_SIZE_CHIPS}</li>}
          </ul>
        )}
      </div>
    </article>
  );
}
