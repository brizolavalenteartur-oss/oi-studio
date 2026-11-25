import { createContext, useContext, useState, type ReactNode } from "react";
import { useRouter } from "@tanstack/react-router";
import type { StoreProduct } from "@/data/products";
import { useCart } from "@/lib/cart";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { BagDrawer } from "./BagDrawer";
import { CheckoutModal } from "./CheckoutModal";

type ShopContextValue = {
  cart: ReturnType<typeof useCart>;
  openBag: () => void;
};

const ShopContext = createContext<ShopContextValue | null>(null);

export function useShop() {
  const value = useContext(ShopContext);
  if (!value) throw new Error("useShop precisa estar dentro de <ShopLayout>");
  return value;
}

/** Cabeçalho, rodapé, sacola e checkout compartilhados pela vitrine e pelas páginas de produto. */
export function ShopLayout({
  products,
  children,
}: {
  products: StoreProduct[];
  children: ReactNode;
}) {
  const router = useRouter();
  const cart = useCart(products);
  const [bagOpen, setBagOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  return (
    <ShopContext.Provider value={{ cart, openBag: () => setBagOpen(true) }}>
      <div className="kyn-store" id="inicio">
        <SiteHeader cartCount={cart.count} onCart={() => setBagOpen(true)} />
        {children}
        <SiteFooter />
        {bagOpen && (
          <BagDrawer
            cart={cart}
            onClose={() => setBagOpen(false)}
            onCheckout={() => {
              setBagOpen(false);
              setCheckoutOpen(true);
            }}
          />
        )}
        {checkoutOpen && (
          <CheckoutModal
            items={cart.lines}
            onClose={() => {
              setCheckoutOpen(false);
              void router.invalidate();
            }}
            onSuccess={() => {
              cart.clear();
              void router.invalidate();
            }}
            onStockError={() => {
              void router.invalidate();
            }}
          />
        )}
      </div>
    </ShopContext.Provider>
  );
}
