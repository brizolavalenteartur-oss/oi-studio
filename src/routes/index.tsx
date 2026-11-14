import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowDown, ArrowRight, Heart, Instagram, Search, ShoppingBag, Sparkles, Truck, X } from "lucide-react";
import { formatPrice, products, type ProductVariant, type StoreProduct } from "@/data/products";
import { ProductCard } from "@/components/store/ProductCard";
import { SiteHeader } from "@/components/store/SiteHeader";
import { SiteFooter } from "@/components/store/SiteFooter";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "KYN KIDS | Moda Infantil e Juvenil" },
      { name: "description", content: "Moda infanto-juvenil do tamanho 1 ao 18. Solicite sua malinha sem custo em Caxias do Sul. Enviamos para todo o Brasil." },
      { property: "og:title", content: "KYN KIDS | Moda Infantil e Juvenil" },
      { property: "og:description", content: "Estilo, conforto e personalidade para cada fase." },
    ],
  }),
  component: StoreHome,
});

const categories = ["Todas", "Meninas", "Meninos", "Bebês", "Conjuntos"];

function StoreHome() {
  const [activeCategory, setActiveCategory] = useState("Todas");
  const [search, setSearch] = useState("");
  const [bag, setBag] = useState<{ product: StoreProduct; variant: ProductVariant }[]>([]);
  const [bagOpen, setBagOpen] = useState(false);
  const [selected, setSelected] = useState<StoreProduct | null>(null);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "credit" | "debit" | "">("");

  const filteredProducts = useMemo(() => products.filter((product) => {
    const matchesCategory = activeCategory === "Todas" || product.category === activeCategory;
    const matchesSearch = `${product.name} ${product.category}`.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  }), [activeCategory, search]);

  const bagTotal = bag.reduce((total, item) => total + item.variant.price, 0);

  const addToBag = (product: StoreProduct, variant: ProductVariant) => {
    setBag((current) => [...current, { product, variant }]);
    setSelected(null);
    setSelectedVariantIndex(0);
    setBagOpen(true);
  };
  const instagramUrl = "https://www.instagram.com/kynkidsmoda/";

  return (
    <div className="kyn-store" id="inicio">
      <SiteHeader cartCount={bag.length} onCart={() => setBagOpen(true)} />

      <main>
        <section className="hero-section">
          <div className="hero-copy">
            <span className="eyebrow"><Sparkles size={14} /> PEQUENOS TAMANHOS, GRANDES PERSONALIDADES</span>
            <h1>O jeito deles.<br /><em>O estilo KYN.</em></h1>
            <p>Moda infantil e juvenil feita para acompanhar cada descoberta, cada brincadeira e cada fase.</p>
            <div className="hero-buttons">
              <a href="#colecao" className="button-primary">Descobrir coleção <ArrowRight size={17} /></a>
              <a href="#malinha" className="button-text">Conheça a malinha grátis <ArrowDown size={16} /></a>
            </div>
            <div className="hero-note"><span className="note-dot" /> Tamanhos do 1 ao 18</div>
          </div>
          <div className="hero-visual">
            <img src="https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?auto=format&fit=crop&w=1200&q=90" alt="Crianças aproveitando um dia ao ar livre" />
            <div className="hero-sticker"><span>FEITO PARA</span><strong>ser criança</strong><span>♡</span></div>
            <div className="hero-caption">KYN KIDS <span>·</span> INFANTO-JUVENIL</div>
          </div>
          <div className="hero-side-label">CAXIAS DO SUL · RS</div>
        </section>

        <section className="benefit-bar" aria-label="Benefícios da loja">
          <div><Truck size={20} /><span><b>Enviamos para todo o Brasil</b><small>Receba onde você estiver</small></span></div>
          <div><Heart size={20} /><span><b>Malinha sem custo</b><small>Consulte a disponibilidade em Caxias do Sul</small></span></div>
          <div><Sparkles size={20} /><span><b>Do 1 ao 18</b><small>Moda para cada fase</small></span></div>
        </section>

        <section className="category-section section-shell" id="categorias">
          <div className="section-heading">
            <div><span className="eyebrow">ESCOLHA O SEU JEITO</span><h2>Um mundo de <em>possibilidades.</em></h2></div>
            <p>Looks para brincar, passear, celebrar e ser quem se é.</p>
          </div>
          <div className="category-grid">
            <a className="category-tile tile-girls" href="#colecao" onClick={() => setActiveCategory("Meninas")}><img src="https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=900&q=85" alt="Moda infantil feminina" /><span>01 / MENINAS</span><strong>Cheias de atitude <ArrowRight size={17} /></strong></a>
            <a className="category-tile tile-boys" href="#colecao" onClick={() => setActiveCategory("Meninos")}><img src="https://images.unsplash.com/photo-1503919005314-30d93d07d823?auto=format&fit=crop&w=900&q=85" alt="Moda infantil masculina" /><span>02 / MENINOS</span><strong>Prontos para tudo <ArrowRight size={17} /></strong></a>
            <a className="category-tile tile-babies" href="#colecao" onClick={() => setActiveCategory("Bebês")}><img src="https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=900&q=85" alt="Roupas para bebês" /><span>03 / PEQUENOS</span><strong>Conforto em cada detalhe <ArrowRight size={17} /></strong></a>
          </div>
        </section>

        <section className="collection-section section-shell" id="colecao">
          <div className="section-heading collection-heading">
            <div><span className="eyebrow">ENCONTRE SEU PRÓXIMO LOOK</span><h2>Novidades & <em>favoritos.</em></h2></div>
            <div className="collection-tools">
              <label className="search-field"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar peças..." aria-label="Buscar peças" /></label>
            </div>
          </div>
          <div className="filter-row" role="group" aria-label="Filtrar categorias">
            {categories.map((category) => <button key={category} className={activeCategory === category ? "filter-chip active" : "filter-chip"} onClick={() => setActiveCategory(category)}>{category}</button>)}
          </div>
          <div className="products-grid">
            {filteredProducts.map((product) => <ProductCard key={product.id} product={product} onSelect={(item) => { setSelectedVariantIndex(0); setSelected(item); }} />)}
          </div>
          {filteredProducts.length === 0 && <div className="empty-state">Não encontramos resultados. Tente outra busca ou categoria.</div>}
          <p className="catalog-note">As imagens são referências ilustrativas. Consulte pelo Instagram os modelos disponíveis, tamanhos, cores e valores atualizados.</p>
        </section>

        <section className="malinha-section" id="malinha">
          <div className="malinha-image"><img src="https://images.unsplash.com/photo-1551232864-3f0890e580d9?auto=format&fit=crop&w=1100&q=90" alt="Seleção de roupas infantis" /></div>
          <div className="malinha-copy">
            <span className="eyebrow">UMA EXPERIÊNCIA KYN KIDS</span>
            <h2>Seu provador,<br /><em>no seu tempo.</em></h2>
            <p>Em Caxias do Sul, você pode solicitar sua malinha sem custo e escolher com calma as peças que mais combinam com a sua família.</p>
            <a className="button-light" href={instagramUrl} target="_blank" rel="noreferrer">Quero solicitar minha malinha <ArrowRight size={17} /></a>
            <small>* Consulte pelo Instagram as condições e a disponibilidade de atendimento.</small>
          </div>
        </section>

        <section className="about-section section-shell" id="sobre">
          <div className="about-mark">K<span>·</span>K</div>
          <div><span className="eyebrow">MAIS QUE ROUPA, MEMÓRIAS</span><h2>Infância é movimento.<br /><em>Vista essa liberdade.</em></h2></div>
          <p>A KYN KIDS acredita que cada fase merece ser vivida com conforto, autenticidade e alegria. Uma curadoria infanto-juvenil para acompanhar os pequenos — e os nem tão pequenos — em todos os momentos.</p>
        </section>
      </main>

      <SiteFooter />

      {selected && <div className="modal-backdrop" role="presentation" onClick={() => setSelected(null)}><div className="product-modal" role="dialog" aria-modal="true" aria-label={selected.name} onClick={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setSelected(null)} aria-label="Fechar"><X /></button><img src={selected.image} alt={selected.name} /><div><span className="eyebrow">{selected.category}</span><h3>{selected.name}</h3><p className="variant-label">Escolha o tamanho e confira o valor:</p><div className="variant-options">{selected.variants.map((variant, i) => <button type="button" key={i} className={selectedVariantIndex === i ? "variant-option selected" : "variant-option"} onClick={() => setSelectedVariantIndex(i)}><span>Tamanho {variant.sizes}</span><b>{formatPrice(variant.price)}</b></button>)}</div><p className="modal-availability">Confirme cores e disponibilidade antes de concluir o pedido.</p><button className="button-primary full-button" onClick={() => addToBag(selected, selected.variants[selectedVariantIndex])}>Adicionar à sacola <ShoppingBag size={17} /></button><a className="modal-instagram" href={instagramUrl} target="_blank" rel="noreferrer"><Instagram size={16} /> Ver Instagram da KYN KIDS</a></div></div></div>}

      {bagOpen && <div className="drawer-backdrop" onClick={() => setBagOpen(false)}><aside className="bag-drawer" onClick={(event) => event.stopPropagation()}><div className="drawer-heading"><div><span className="eyebrow">SUA SELEÇÃO</span><h3>Sacola <span>({bag.length})</span></h3></div><button onClick={() => setBagOpen(false)} aria-label="Fechar sacola"><X /></button></div>{bag.length === 0 ? <div className="bag-empty"><ShoppingBag size={34} /><p>Sua sacola está vazia.</p><button className="button-primary" onClick={() => setBagOpen(false)}>Explorar coleção</button></div> : <><div className="bag-items">{bag.map((item, index) => <div className="bag-item" key={`${item.product.id}-${index}`}><img src={item.product.image} alt="" /><div><b>{item.product.name}</b><small>Tamanho {item.variant.sizes} · {formatPrice(item.variant.price)}</small><button onClick={() => setBag((current) => current.filter((_, i) => i !== index))}>Remover</button></div></div>)}</div><div className="bag-checkout"><div className="bag-total"><span>Total dos produtos</span><strong>{formatPrice(bagTotal)}</strong></div><h4>Forma de pagamento</h4><div className="payment-options"><label className={paymentMethod === "pix" ? "payment-option selected" : "payment-option"}><input type="radio" name="payment" value="pix" checked={paymentMethod === "pix"} onChange={() => setPaymentMethod("pix")} /><span><b>Pix</b><small>Pagamento via Pix</small></span></label><label className={paymentMethod === "credit" ? "payment-option selected" : "payment-option"}><input type="radio" name="payment" value="credit" checked={paymentMethod === "credit"} onChange={() => setPaymentMethod("credit")} /><span><b>Cartão de crédito</b><small>Consulte parcelamento</small></span></label><label className={paymentMethod === "debit" ? "payment-option selected" : "payment-option"}><input type="radio" name="payment" value="debit" checked={paymentMethod === "debit"} onChange={() => setPaymentMethod("debit")} /><span><b>Cartão de débito</b><small>Pagamento no débito</small></span></label></div><p className="payment-notice">A forma de pagamento será confirmada pela loja. O pagamento online ainda precisa ser conectado a um intermediador.</p><a className="button-primary full-button" href={instagramUrl} target="_blank" rel="noreferrer" onClick={() => setBagOpen(false)}>Continuar pedido <ArrowRight size={17} /></a></div></>}</aside></div>}
    </div>
  );
}
