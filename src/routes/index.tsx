import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Baby,
  Instagram,
  PackageCheck,
  Ruler,
  Search,
  Shirt,
  Sparkles,
  Truck,
  X,
} from "lucide-react";
import {
  fetchCatalog,
  inStock,
  sizeRank,
  startingPrice,
  totalStock,
  type StoreProduct,
} from "@/data/products";
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

const categories = ["Todas", "Meninas", "Meninos", "Bebês", "Conjuntos"] as const;
type SortOrder = "relevance" | "price-asc" | "price-desc";
type Special = "" | "last";
const PAGE_SIZE = 12;

function StoreHome() {
  const products = Route.useLoaderData();
  return (
    <ShopLayout products={products}>
      <StoreContent products={products} />
    </ShopLayout>
  );
}

function StoreContent({ products }: { products: StoreProduct[] }) {
  const [activeCategory, setActiveCategory] = useState<string>("Todas");
  const [search, setSearch] = useState("");
  const [size, setSize] = useState("");
  const [sort, setSort] = useState<SortOrder>("relevance");
  const [special, setSpecial] = useState<Special>("");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [selected, setSelected] = useState<StoreProduct | null>(null);

  // Abrir /#colecao (ou outra âncora) rola até a seção depois que a página monta.
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (id) document.getElementById(id)?.scrollIntoView({ behavior: "instant" });
  }, []);

  // Qualquer mudança de filtro volta para a primeira "página" da grade.
  useEffect(() => setVisible(PAGE_SIZE), [activeCategory, search, size, sort, special]);

  const sizes = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => p.variants.forEach((v) => v.stock > 0 && set.add(v.size)));
    return [...set].sort((a, b) => sizeRank(a) - sizeRank(b));
  }, [products]);

  /** Foto de capa de cada categoria: a primeira peça com estoque. */
  const categoryCover = useMemo(() => {
    // Fotos de campanha onde existem; nas outras, a primeira peça com estoque.
    const cover: Record<string, string> = {
      Todas: "/images/kyn-campanha.webp",
      Meninas: "/images/categoria-meninas.webp",
      Meninos: "/images/categoria-meninos.webp",
      Bebês: "/images/categoria-bebes.webp",
    };
    for (const product of products) {
      if (!inStock(product)) continue;
      cover[product.category] ??= product.image;
      cover["Todas"] ??= product.image;
    }
    return cover;
  }, [products]);

  const lastPieces = useMemo(() => products.filter((p) => totalStock(p) === 1), [products]);

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    const list = products.filter((product) => {
      if (activeCategory !== "Todas" && product.category !== activeCategory) return false;
      if (term && !`${product.name} ${product.category}`.toLowerCase().includes(term)) return false;
      if (size && !product.variants.some((v) => v.size === size && v.stock > 0)) return false;
      if (special === "last" && totalStock(product) !== 1) return false;
      return true;
    });
    // Peças esgotadas vão para o fim; dentro disso, a ordem escolhida.
    list.sort((a, b) => Number(inStock(b)) - Number(inStock(a)));
    if (sort === "price-asc") list.sort((a, b) => startingPrice(a) - startingPrice(b));
    if (sort === "price-desc") list.sort((a, b) => startingPrice(b) - startingPrice(a));
    return list;
  }, [products, activeCategory, search, size, sort, special]);

  const hasFilters =
    activeCategory !== "Todas" ||
    search !== "" ||
    size !== "" ||
    sort !== "relevance" ||
    special !== "";

  const clearFilters = () => {
    setActiveCategory("Todas");
    setSearch("");
    setSize("");
    setSort("relevance");
    setSpecial("");
  };

  /** Aplica um filtro rápido e leva o cliente até a grade. */
  const goToCollection = (apply: () => void) => {
    clearFilters();
    apply();
    requestAnimationFrame(() => document.getElementById("colecao")?.scrollIntoView());
  };

  const shown = filteredProducts.slice(0, visible);

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
              <a href="#colecao" className="button-pill">
                Ver a coleção <ArrowRight size={17} />
              </a>
              <a href="#categorias" className="button-ghost">
                Comprar por categoria
              </a>
            </div>
            <ul className="hero-perks" aria-label="Vantagens">
              <li>
                <Truck size={18} />
                <span>
                  <b>Envio para todo o Brasil</b>
                  <small>Receba onde estiver</small>
                </span>
              </li>
              <li>
                <Ruler size={18} />
                <span>
                  <b>Do 1 ao 18</b>
                  <small>Moda para cada fase</small>
                </span>
              </li>
              <li>
                <PackageCheck size={18} />
                <span>
                  <b>Estoque real</b>
                  <small>Atualizado a cada pedido</small>
                </span>
              </li>
            </ul>
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
              KYN KIDS <span>·</span> CAXIAS DO SUL · RS
            </div>
          </div>
        </section>

        <nav className="quick-cats" aria-label="Atalhos de categoria">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              className="quick-cat"
              onClick={() => goToCollection(() => setActiveCategory(category))}
            >
              <span className="quick-cat-img">
                {categoryCover[category] && (
                  <img src={categoryCover[category]} alt="" loading="lazy" />
                )}
              </span>
              <span>{category === "Todas" ? "Ver tudo" : category}</span>
            </button>
          ))}
          {lastPieces.length > 0 && (
            <button
              type="button"
              className="quick-cat quick-cat-accent"
              onClick={() => goToCollection(() => setSpecial("last"))}
            >
              <span className="quick-cat-img">
                <b>{lastPieces.length}</b>
              </span>
              <span>Peças únicas</span>
            </button>
          )}
        </nav>

        <section className="category-section section-shell" id="categorias">
          <div className="section-heading">
            <div>
              <span className="eyebrow">ESCOLHA O SEU JEITO</span>
              <h2>
                Um mundo de <em>possibilidades.</em>
              </h2>
            </div>
            <a
              href="#colecao"
              className="section-link"
              onClick={(event) => {
                event.preventDefault();
                goToCollection(() => {});
              }}
            >
              Ver todas as peças <ArrowRight size={15} />
            </a>
          </div>
          <div className="category-grid">
            <CategoryTile
              className="tile-girls"
              image="/images/categoria-meninas.webp"
              alt="Moda infantil feminina"
              label="Meninas"
              title="Cheias de atitude"
              onClick={() => goToCollection(() => setActiveCategory("Meninas"))}
            />
            <CategoryTile
              className="tile-boys"
              image="/images/categoria-meninos.webp"
              alt="Moda infantil masculina"
              label="Meninos"
              title="Prontos para tudo"
              onClick={() => goToCollection(() => setActiveCategory("Meninos"))}
            />
            <CategoryTile
              className="tile-babies"
              image="/images/categoria-bebes.webp"
              alt="Moda infantil para bebês"
              label="Pequenos"
              title="Conforto em cada detalhe"
              onClick={() => goToCollection(() => setActiveCategory("Bebês"))}
            />
          </div>
        </section>

        <section className="promo-section section-shell" aria-label="Destaques">
          <button
            type="button"
            className="promo-card promo-blue"
            onClick={() => goToCollection(() => setActiveCategory("Conjuntos"))}
          >
            <span className="promo-copy">
              <span className="eyebrow">LOOK COMPLETO</span>
              <strong>
                Conjuntos prontos <em>para sair.</em>
              </strong>
              <span className="promo-text">Blusa e short, blusa e legging: é só vestir.</span>
              <span className="button-pill button-pill-light">
                Ver conjuntos <ArrowRight size={16} />
              </span>
            </span>
            <Shirt className="promo-icon" size={120} strokeWidth={1} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="promo-card promo-green"
            onClick={() =>
              goToCollection(() =>
                lastPieces.length ? setSpecial("last") : setActiveCategory("Bebês"),
              )
            }
          >
            <span className="promo-copy">
              <span className="eyebrow">
                {lastPieces.length ? "SÓ TEM UMA" : "PARA OS PEQUENOS"}
              </span>
              <strong>
                {lastPieces.length ? (
                  <>
                    Peças <em>únicas.</em>
                  </>
                ) : (
                  <>
                    Conforto <em>desde cedo.</em>
                  </>
                )}
              </strong>
              <span className="promo-text">
                {lastPieces.length
                  ? `${lastPieces.length} peças com só 1 unidade no estoque.`
                  : "Macacões e conjuntos para bebês."}
              </span>
              <span className="button-pill button-pill-yellow">
                Aproveitar <ArrowRight size={16} />
              </span>
            </span>
            <Baby className="promo-icon" size={120} strokeWidth={1} aria-hidden="true" />
          </button>
        </section>

        <section className="collection-section section-shell" id="colecao">
          <div className="section-heading collection-heading">
            <div>
              <span className="eyebrow">ENCONTRE SEU PRÓXIMO LOOK</span>
              <h2>
                Novidades & <em>favoritos.</em>
              </h2>
            </div>
            <label className="search-field">
              <Search size={17} />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar peças..."
                aria-label="Buscar peças"
              />
            </label>
          </div>
          <div className="collection-toolbar">
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
              {lastPieces.length > 0 && (
                <button
                  className={special === "last" ? "filter-chip active" : "filter-chip"}
                  aria-pressed={special === "last"}
                  onClick={() => setSpecial(special === "last" ? "" : "last")}
                >
                  Peças únicas
                </button>
              )}
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
            </div>
          </div>
          <div className="collection-status">
            <span className="filter-count" aria-live="polite">
              {filteredProducts.length} {filteredProducts.length === 1 ? "peça" : "peças"}
            </span>
            {hasFilters && (
              <button type="button" className="filter-clear" onClick={clearFilters}>
                Limpar filtros
              </button>
            )}
          </div>
          <div className="products-grid">
            {shown.map((product) => (
              <ProductCard key={product.id} product={product} onSelect={setSelected} />
            ))}
          </div>
          {filteredProducts.length === 0 && (
            <div className="empty-state">
              Não encontramos resultados. Tente outra busca, tamanho ou categoria.
            </div>
          )}
          {filteredProducts.length > visible && (
            <div className="load-more">
              <p>
                Mostrando {shown.length} de {filteredProducts.length} peças
              </p>
              <button
                type="button"
                className="button-pill"
                onClick={() => setVisible((count) => count + PAGE_SIZE)}
              >
                Ver mais peças
              </button>
            </div>
          )}
        </section>

        <section className="trust-strip" aria-label="Por que comprar na KYN KIDS">
          <div>
            <Truck size={22} />
            <span>
              <b>Envio para todo o Brasil</b>
              <small>Frete informado antes do envio</small>
            </span>
          </div>
          <div>
            <Ruler size={22} />
            <span>
              <b>Tamanhos do 1 ao 18</b>
              <small>Do bebê ao adolescente</small>
            </span>
          </div>
          <div>
            <PackageCheck size={22} />
            <span>
              <b>Estoque em tempo real</b>
              <small>O que aparece, está disponível</small>
            </span>
          </div>
          <div>
            <Instagram size={22} />
            <span>
              <b>Atendimento próximo</b>
              <small>Fale com a gente no Instagram</small>
            </span>
          </div>
        </section>

        <section className="about-section section-shell" id="sobre">
          <div className="about-photo">
            <img src="/images/categoria-meninos.webp" alt="" loading="lazy" />
          </div>
          <div className="about-copy">
            <span className="eyebrow">MAIS QUE ROUPA, MEMÓRIAS</span>
            <h2>
              Infância é movimento.
              <br />
              <em>Vista essa liberdade.</em>
            </h2>
            <p>
              A KYN KIDS acredita que cada fase merece ser vivida com conforto, autenticidade e
              alegria. Uma curadoria infanto-juvenil para acompanhar os pequenos — e os nem tão
              pequenos — em todos os momentos.
            </p>
            <a className="button-pill" href={INSTAGRAM_URL} target="_blank" rel="noreferrer">
              <Instagram size={17} /> Siga @kynkidsmoda
            </a>
          </div>
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
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function CategoryTile(props: {
  className: string;
  image: string;
  alt: string;
  label: string;
  title: string;
  onClick: () => void;
}) {
  return (
    <a
      className={`category-tile ${props.className}`}
      href="#colecao"
      onClick={(event) => {
        event.preventDefault();
        props.onClick();
      }}
    >
      <img src={props.image} alt={props.alt} loading="lazy" />
      <span className="category-label">{props.label}</span>
      <strong>{props.title}</strong>
      <span className="category-cta">
        Explorar <ArrowRight size={15} />
      </span>
    </a>
  );
}
