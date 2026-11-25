import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Instagram, Search, Sparkles, Truck, X } from "lucide-react";
import { fetchCatalog, startingPrice, type StoreProduct } from "@/data/products";
import { ProductCard } from "@/components/store/ProductCard";
import { ShopLayout } from "@/components/store/ShopLayout";
import { VariantPicker } from "@/components/store/VariantPicker";
import { INSTAGRAM_URL, SITE_URL, absoluteUrl } from "@/lib/site";

const SHARE_IMAGE = absoluteUrl("/images/kyn-campanha.webp");

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
      { property: "og:url", content: SITE_URL },
      { property: "og:image", content: SHARE_IMAGE },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: SHARE_IMAGE },
    ],
    links: [{ rel: "canonical", href: SITE_URL }],
  }),
  component: StoreHome,
});

const categories = ["Todas", "Meninas", "Meninos", "Bebês", "Conjuntos"];
type SortOrder = "relevance" | "price-asc" | "price-desc";

/** Ordena tamanhos: letras de bebê (RN, P, M, G, GG) antes dos números. */
const sizeRank = (size: string) => {
  const letters = ["RN", "P", "M", "G", "GG"];
  const i = letters.indexOf(size);
  if (i >= 0) return i - 10;
  const n = Number(size);
  return Number.isFinite(n) ? n : 100;
};

function StoreHome() {
  const products = Route.useLoaderData();
  return (
    <ShopLayout products={products}>
      <StoreContent products={products} />
    </ShopLayout>
  );
}

function StoreContent({ products }: { products: StoreProduct[] }) {
  const [activeCategory, setActiveCategory] = useState("Todas");
  const [search, setSearch] = useState("");
  const [size, setSize] = useState("");
  const [sort, setSort] = useState<SortOrder>("relevance");
  const [selected, setSelected] = useState<StoreProduct | null>(null);

  // Abrir /#colecao (ou outra âncora) rola até a seção depois que a página monta.
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (id) document.getElementById(id)?.scrollIntoView({ behavior: "instant" });
  }, []);

  // Tamanhos com estoque em pelo menos uma peça.
  const sizes = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => p.variants.forEach((v) => v.stock > 0 && set.add(v.size)));
    return [...set].sort((a, b) => sizeRank(a) - sizeRank(b));
  }, [products]);

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    const list = products.filter((product) => {
      if (activeCategory !== "Todas" && product.category !== activeCategory) return false;
      if (term && !`${product.name} ${product.category}`.toLowerCase().includes(term)) return false;
      if (size && !product.variants.some((v) => v.size === size && v.stock > 0)) return false;
      return true;
    });
    if (sort === "price-asc") list.sort((a, b) => startingPrice(a) - startingPrice(b));
    if (sort === "price-desc") list.sort((a, b) => startingPrice(b) - startingPrice(a));
    return list;
  }, [products, activeCategory, search, size, sort]);

  const hasFilters =
    activeCategory !== "Todas" || search !== "" || size !== "" || sort !== "relevance";

  return (
    <>
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
                aria-pressed={activeCategory === category}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
          <div className="filter-bar">
            <label>
              Tamanho
              <select value={size} onChange={(event) => setSize(event.target.value)}>
                <option value="">Todos</option>
                {sizes.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Ordenar
              <select value={sort} onChange={(event) => setSort(event.target.value as SortOrder)}>
                <option value="relevance">Destaques</option>
                <option value="price-asc">Menor preço</option>
                <option value="price-desc">Maior preço</option>
              </select>
            </label>
            <span className="filter-count" aria-live="polite">
              {filteredProducts.length} {filteredProducts.length === 1 ? "peça" : "peças"}
            </span>
            {hasFilters && (
              <button
                type="button"
                className="filter-clear"
                onClick={() => {
                  setActiveCategory("Todas");
                  setSearch("");
                  setSize("");
                  setSort("relevance");
                }}
              >
                Limpar filtros
              </button>
            )}
          </div>
          <div className="products-grid">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} onSelect={setSelected} />
            ))}
          </div>
          {filteredProducts.length === 0 && (
            <div className="empty-state">
              Não encontramos resultados. Tente outra busca, tamanho ou categoria.
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
              <VariantPicker
                key={selected.id}
                product={selected}
                onAdded={() => setSelected(null)}
              />
              <Link className="modal-instagram" to="/produto/$id" params={{ id: selected.id }}>
                Ver página da peça <ArrowRight size={15} />
              </Link>
              <a className="modal-instagram" href={INSTAGRAM_URL} target="_blank" rel="noreferrer">
                <Instagram size={16} /> Ver Instagram da KYN KIDS
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
