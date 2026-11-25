import { ArrowLeft, ArrowRight, Minus, Plus, ShoppingBag } from "lucide-react";
import { formatPrice, variantLabel } from "@/data/products";
import type { useCart } from "@/lib/cart";

type Props = {
  cart: ReturnType<typeof useCart>;
  onClose: () => void;
  onCheckout: () => void;
};

export function BagDrawer({ cart, onClose, onCheckout }: Props) {
  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <aside
        className="bag-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Sacola"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="drawer-heading">
          <div>
            <span className="eyebrow">SUA SELEÇÃO</span>
            <h3>
              Sacola <span>({cart.count})</span>
            </h3>
          </div>
          <button className="drawer-continue" onClick={onClose}>
            <ArrowLeft size={15} /> Continuar comprando
          </button>
        </div>
        {cart.lines.length === 0 ? (
          <div className="bag-empty">
            <ShoppingBag size={34} />
            <p>Sua sacola está vazia.</p>
            <button className="button-primary" onClick={onClose}>
              Explorar coleção
            </button>
          </div>
        ) : (
          <>
            <div className="bag-items">
              {cart.lines.map(({ product, variant, quantity }) => (
                <div className="bag-item" key={`${product.id}-${variant.index}`}>
                  <img src={product.image} alt="" />
                  <div>
                    <b>{product.name}</b>
                    <small>
                      Tamanho {variantLabel(variant)} · {formatPrice(variant.price)}
                    </small>
                    {quantity > variant.stock && (
                      <small className="bag-warning">
                        {variant.stock === 0
                          ? "Esgotou — remova da sacola"
                          : `Só restam ${variant.stock}`}
                      </small>
                    )}
                    <div
                      className="bag-quantity"
                      role="group"
                      aria-label={`Quantidade de ${product.name}`}
                    >
                      <button
                        type="button"
                        aria-label="Diminuir"
                        onClick={() => cart.setQuantity(product.id, variant.index, quantity - 1)}
                      >
                        <Minus size={14} />
                      </button>
                      <span aria-live="polite">{quantity}</span>
                      <button
                        type="button"
                        aria-label="Aumentar"
                        disabled={quantity >= variant.stock}
                        onClick={() => cart.setQuantity(product.id, variant.index, quantity + 1)}
                      >
                        <Plus size={14} />
                      </button>
                      <button
                        type="button"
                        className="bag-remove"
                        onClick={() => cart.setQuantity(product.id, variant.index, 0)}
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="bag-checkout">
              <div className="bag-total">
                <span>Total dos produtos</span>
                <strong>{formatPrice(cart.total)}</strong>
              </div>
              <button
                className="button-primary full-button"
                disabled={cart.problems.length > 0}
                onClick={onCheckout}
              >
                Finalizar compra <ArrowRight size={17} />
              </button>
              <p className="payment-notice">
                {cart.problems.length > 0
                  ? "Ajuste os itens sem estoque para continuar."
                  : "Informe seus dados e endereço para registrar o pedido diretamente na loja."}
              </p>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
