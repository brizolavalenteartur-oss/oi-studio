import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Instagram,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  Sparkles,
  Truck,
  X,
} from "lucide-react";
import { fetchCatalog, formatPrice, variantLabel, type StoreProduct } from "@/data/products";
import { useCart } from "@/lib/cart";
import { ProductCard } from "@/components/store/ProductCard";
import { SiteHeader } from "@/components/store/SiteHeader";
import { SiteFooter } from "@/components/store/SiteFooter";
import { CheckoutModal } from "@/components/store/CheckoutModal";

export const Route = createFileRoute("/")({
  loader: () => fetchCatalog(),
  // Estoque muda a cada venda: recarrega o catálogo ao voltar para a página depois de 30 s.
  staleTime: 30_000,
  head: () => ({
    meta: [
      { title: "KYN KIDS | Moda Infantil e Juvenil" },
      {
        name: "description",
        content: "Moda infanto-juvenil do tamanho 1 ao 18. Enviamos para todo o Brasil.",
      },
      { property: "og:title", content: "KYN KIDS | Moda Infantil e Juvenil" },
      { property: "og:description", content: "Estilo, conforto e personalidade para cada fase." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: "https://kynkids.vercel.app/images/kyn-campanha.webp" },
      {
        name: "twitter:image",
        content: "https://kynkids.vercel.app/images/categoria-meninas.webp",
      },
    ],
  }),
  component: StoreHome,
});

const categories = ["Todas", "Meninas", "Meninos", "Bebês", "Conjuntos"];

function StoreHome() {
  const [activeCategory, setActiveCategory] = useState("Todas");
  const [search, setSearch] = useState("");
  const products = Route.useLoaderData();
  const router = useRouter();
  const cart = useCart(products);
  const [bagOpen, setBagOpen] = useState(false);
  const [selected, setSelected] = useState<StoreProduct | null>(null);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState<number | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  // Abrir /#colecao (ou outra âncora) rola até a seção depois que a página monta.
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (id) document.getElementById(id)?.scrollIntoView({ behavior: "instant" });
  }, []);

  const filteredProducts = useMemo(
    () =>
      products.filter((product) => {
        const matchesCategory = activeCategory === "Todas" || product.category === activeCategory;
        const matchesSearch = `${product.name} ${product.category}`
          .toLowerCase()
          .includes(search.toLowerCase());
        return matchesCategory && matchesSearch;
      }),
    [products, activeCategory, search],
  );

  const openProduct = (product: StoreProduct) => {
    const firstAvailable = product.variants.find((variant) => variant.stock > 0);
    setSelectedVariantIndex(firstAvailable?.index ?? null);
    setSelected(product);
  };

  const quantityInBag = (productId: string, variantIndex: number) =>
    cart.lines.find((line) => line.product.id === productId && line.variant.index === variantIndex)
      ?.quantity ?? 0;

  const selectedVariant =
    selected?.variants.find((variant) => variant.index === selectedVariantIndex) ?? null;
  const canAddSelected =
    !!selected &&
    !!selectedVariant &&
    quantityInBag(selected.id, selectedVariant.index) < selectedVariant.stock;

  const addSelectedToBag = () => {
    if (!selected || !selectedVariant || !canAddSelected) return;
    cart.add(selected.id, selectedVariant.index);
    setSelected(null);
    setBagOpen(true);
  };
  const instagramUrl = "https://www.instagram.com/kynkidsmoda/";

  return (
    <div className="kyn-store" id="inicio">
      <SiteHeader cartCount={cart.count} onCart={() => setBagOpen(true)} />

      <main>
        <section className="hero-section">
          <div className="hero-copy">
            <span className="eyebrow">
              <Sparkles size={14} /> PEQUENOS TAMANHOS, GRANDES PERSONALIDADES
            </span>
            <h1>
              O jeito deles.
              <br />
              <em>O estilo KYN.</em>
            </h1>
            <p>
              Moda infantil e juvenil feita para acompanhar cada descoberta, cada brincadeira e cada
              fase.
            </p>
            <div className="hero-buttons">
              <a href="#colecao" className="button-primary">
                Descobrir coleção <ArrowRight size={17} />
              </a>
            </div>
            <div className="hero-note">
              <span className="note-dot" /> Tamanhos do 1 ao 18
            </div>
          </div>
          <div className="hero-visual">
            <img
              src="/images/kyn-campanha.webp"
              alt="Duas crianças usando looks coloridos da campanha KYN KIDS em um parque"
            />
            <div className="hero-sticker">
              <span>FEITO PARA</span>
              <strong>ser criança</strong>
              <span>♡</span>
            </div>
            <div className="hero-caption">
              KYN KIDS <span>·</span> INFANTO-JUVENIL
            </div>
          </div>
          <div className="hero-side-label">CAXIAS DO SUL · RS</div>
        </section>

        <section className="benefit-bar" aria-label="Benefícios da loja">
          <div>
            <Truck size={20} />
            <span>
              <b>Enviamos para todo o Brasil</b>
              <small>Receba onde você estiver</small>
            </span>
          </div>
          <div>
            <Sparkles size={20} />
            <span>
              <b>Do 1 ao 18</b>
              <small>Moda para cada fase</small>
            </span>
          </div>
        </section>

        <section className="category-section section-shell" id="categorias">
          <div className="section-heading">
            <div>
              <span className="eyebrow">ESCOLHA O SEU JEITO</span>
              <h2>
                Um mundo de <em>possibilidades.</em>
              </h2>
            </div>
            <p>Looks para brincar, passear, celebrar e ser quem se é.</p>
          </div>
          <div className="category-grid">
            <a
              className="category-tile tile-girls"
              href="#colecao"
              onClick={() => setActiveCategory("Meninas")}
            >
              <img src="/images/categoria-meninas.webp" alt="Moda infantil feminina" />
              <span>01 / MENINAS</span>
              <strong>
                Cheias de atitude <ArrowRight size={17} />
              </strong>
            </a>
            <a
              className="category-tile tile-boys"
              href="#colecao"
              onClick={() => setActiveCategory("Meninos")}
            >
              <img src="/images/categoria-meninos.webp" alt="Moda infantil masculina" />
              <span>02 / MENINOS</span>
              <strong>
                Prontos para tudo <ArrowRight size={17} />
              </strong>
            </a>
            <a
              className="category-tile tile-babies"
              href="#colecao"
              onClick={() => setActiveCategory("Bebês")}
            >
              <img src="/images/categoria-bebes.webp" alt="Moda infantil para bebês" />
              <span>03 / PEQUENOS</span>
              <strong>
                Conforto em cada detalhe <ArrowRight size={17} />
              </strong>
            </a>
          </div>
        </section>

        <section className="collection-section section-shell" id="colecao">
          <div className="section-heading collection-heading">
            <div>
              <span className="eyebrow">ENCONTRE SEU PRÓXIMO LOOK</span>
              <h2>
                Novidades & <em>favoritos.</em>
              </h2>
            </div>
            <div className="collection-tools">
              <label className="search-field">
                <Search size={17} />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar peças..."
                  aria-label="Buscar peças"
                />
              </label>
            </div>
          </div>
          <div className="filter-row" role="group" aria-label="Filtrar categorias">
            {categories.map((category) => (
              <button
                key={category}
                className={activeCategory === category ? "filter-chip active" : "filter-chip"}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
          <div className="products-grid">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} onSelect={openProduct} />
            ))}
          </div>
          {filteredProducts.length === 0 && (
            <div className="empty-state">
              Não encontramos resultados. Tente outra busca ou categoria.
            </div>
          )}
          <p className="catalog-note">
            Confira os tamanhos, cores e valores de cada peça ao selecionar o produto. O estoque é
            atualizado a cada pedido.
          </p>
        </section>

        <section className="about-section section-shell" id="sobre">
          <div className="about-mark">
            K<span>·</span>K
          </div>
          <div>
            <span className="eyebrow">MAIS QUE ROUPA, MEMÓRIAS</span>
            <h2>
              Infância é movimento.
              <br />
              <em>Vista essa liberdade.</em>
            </h2>
          </div>
          <p>
            A KYN KIDS acredita que cada fase merece ser vivida com conforto, autenticidade e
            alegria. Uma curadoria infanto-juvenil para acompanhar os pequenos — e os nem tão
            pequenos — em todos os momentos.
          </p>
        </section>
      </main>

      <SiteFooter />

      {selected && (
        <div className="modal-backdrop" role="presentation" onClick={() => setSelected(null)}>
          <div
            className="product-modal"
            role="dialog"
            aria-modal="true"
            aria-label={selected.name}
            onClick={(event) => event.stopPropagation()}
          >
            <button className="modal-close" onClick={() => setSelected(null)} aria-label="Fechar">
              <X />
            </button>
            <img src={selected.image} alt={selected.name} />
            <div>
              <span className="eyebrow">{selected.category}</span>
              <h3>{selected.name}</h3>
              {selected.description && (
                <p className="product-description">{selected.description}</p>
              )}
              <p className="variant-label">Escolha o tamanho e confira o valor:</p>
              <div className="variant-options">
                {selected.variants.map((variant) => {
                  const soldOut = variant.stock <= 0;
                  return (
                    <button
                      type="button"
                      key={variant.index}
                      disabled={soldOut}
                      aria-pressed={selectedVariantIndex === variant.index}
                      className={[
                        "variant-option",
                        selectedVariantIndex === variant.index ? "selected" : "",
                        soldOut ? "sold-out" : "",
                      ]
                        .join(" ")
                        .trim()}
                      onClick={() => setSelectedVariantIndex(variant.index)}
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
              {!selectedVariant && (
                <p className="modal-availability">
                  Todos os tamanhos desta peça estão esgotados no momento.
                </p>
              )}
              {selectedVariant && !canAddSelected && (
                <p className="modal-availability">
                  Você já colocou na sacola todas as unidades disponíveis deste tamanho.
                </p>
              )}
              <button
                className="button-primary full-button"
                disabled={!canAddSelected}
                onClick={addSelectedToBag}
              >
                Adicionar à sacola <ShoppingBag size={17} />
              </button>
              <a className="modal-instagram" href={instagramUrl} target="_blank" rel="noreferrer">
                <Instagram size={16} /> Ver Instagram da KYN KIDS
              </a>
            </div>
          </div>
        </div>
      )}

      {bagOpen && (
        <div className="drawer-backdrop" onClick={() => setBagOpen(false)}>
          <aside className="bag-drawer" onClick={(event) => event.stopPropagation()}>
            <div className="drawer-heading">
              <div>
                <span className="eyebrow">SUA SELEÇÃO</span>
                <h3>
                  Sacola <span>({cart.count})</span>
                </h3>
              </div>
              <button className="drawer-continue" onClick={() => setBagOpen(false)}>
                <ArrowLeft size={15} /> Continuar comprando
              </button>
            </div>
            {cart.lines.length === 0 ? (
              <div className="bag-empty">
                <ShoppingBag size={34} />
                <p>Sua sacola está vazia.</p>
                <button className="button-primary" onClick={() => setBagOpen(false)}>
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
                            onClick={() =>
                              cart.setQuantity(product.id, variant.index, quantity - 1)
                            }
                          >
                            <Minus size={14} />
                          </button>
                          <span aria-live="polite">{quantity}</span>
                          <button
                            type="button"
                            aria-label="Aumentar"
                            disabled={quantity >= variant.stock}
                            onClick={() =>
                              cart.setQuantity(product.id, variant.index, quantity + 1)
                            }
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
                    onClick={() => {
                      setBagOpen(false);
                      setCheckoutOpen(true);
                    }}
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
  );
}
