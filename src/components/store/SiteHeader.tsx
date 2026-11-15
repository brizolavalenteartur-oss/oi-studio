import { Instagram, Menu, ShoppingBag, X } from "lucide-react";
import { useState } from "react";
import { KynKidsLogo } from "@/data/brand";

type Props = { cartCount: number; onCart: () => void };

export function SiteHeader({ cartCount, onCart }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header className="site-header">
      <div className="top-strip">MODA INFANTO-JUVENIL · TAMANHOS 1 AO 18 · ENVIO PARA TODO O BRASIL</div>
      <div className="header-main">
        <button className="mobile-menu" aria-label="Abrir menu" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button>
        <a href="#inicio" className="brand-mark logo-link" aria-label="KYN KIDS - início"><KynKidsLogo className="kyn-logo-header" /></a>
        <nav className={menuOpen ? "main-nav is-open" : "main-nav"}>
          <a href="#colecao" onClick={() => setMenuOpen(false)}>Coleção</a>
          <a href="#categorias" onClick={() => setMenuOpen(false)}>Categorias</a>
          <a href="#sobre" onClick={() => setMenuOpen(false)}>A KYN KIDS</a>
        </nav>
        <div className="header-actions">
          <a className="instagram-link" href="https://www.instagram.com/kynkidsmoda/" target="_blank" rel="noreferrer" aria-label="Instagram KYN KIDS"><Instagram size={19} /></a>
          <button className="bag-button" onClick={onCart} aria-label="Abrir sacola"><ShoppingBag size={19} /><span>Sacola</span>{cartCount > 0 && <b>{cartCount}</b>}</button>
        </div>
      </div>
    </header>
  );
}
