import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Instagram, MessageCircle, Share2 } from "lucide-react";
import { useState } from "react";
import {
  fetchCatalog,
  formatPrice,
  inStock,
  startingPrice,
  type StoreProduct,
} from "@/data/products";
import { ShopLayout } from "@/components/store/ShopLayout";
import { VariantPicker } from "@/components/store/VariantPicker";
import { ProductCard } from "@/components/store/ProductCard";
import { INSTAGRAM_URL, SITE_NAME, absoluteUrl } from "@/lib/site";

export const Route = createFileRoute("/produto/$id")({
  loader: async ({ params }) => {
    const catalog = await fetchCatalog();
    const product = catalog.find((item) => item.id === params.id);
    if (!product) throw notFound();
    return { catalog, product };
  },
  staleTime: 30_000,
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: `Peça não encontrada | ${SITE_NAME}` }] };
    const { product } = loaderData;
    const url = absoluteUrl(`/produto/${product.id}`);
    const image = absoluteUrl(product.image);
    const title = `${product.name} | ${SITE_NAME}`;
    const description = productDescription(product);
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:type", content: "product" },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: url },
        { property: "og:image", content: image },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:image", content: image },
        { property: "product:price:amount", content: startingPrice(product).toFixed(2) },
        { property: "product:price:currency", content: "BRL" },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: ProductPage,
  notFoundComponent: ProductNotFound,
});

function productDescription(product: StoreProduct) {
  const sizes = [...new Set(product.variants.filter((v) => v.stock > 0).map((v) => v.size))];
  const sizeText = sizes.length
    ? `Tamanhos disponíveis: ${sizes.join(", ")}.`
    : "Peça esgotada no momento.";
  return `${product.name} — ${product.category}, a partir de ${formatPrice(startingPrice(product))}. ${sizeText} Enviamos para todo o Brasil.`;
}

/** Dados estruturados (schema.org/Product) para o Google mostrar preço e disponibilidade. */
function productJsonLd(product: StoreProduct) {
  const url = absoluteUrl(`/produto/${product.id}`);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: [absoluteUrl(product.image)],
    description: productDescription(product),
    sku: product.id,
    category: product.category,
    brand: { "@type": "Brand", name: SITE_NAME },
    offers: product.variants.map((variant) => ({
      "@type": "Offer",
      sku: `${product.id}-${variant.index}`,
      name: `Tamanho ${variant.size}${variant.color ? ` ${variant.color}` : ""}`,
      price: variant.price.toFixed(2),
      priceCurrency: "BRL",
      availability:
        variant.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url,
    })),
  };
}

function ProductPage() {
  const { catalog, product } = Route.useLoaderData();
  return (
    <ShopLayout products={catalog}>
      <ProductContent catalog={catalog} product={product} />
    </ShopLayout>
  );
}

function ProductContent({ catalog, product }: { catalog: StoreProduct[]; product: StoreProduct }) {
  const [copied, setCopied] = useState(false);
  const url = absoluteUrl(`/produto/${product.id}`);
  const related = catalog
    .filter((item) => item.id !== product.id && item.category === product.category && inStock(item))
    .slice(0, 4);

  const share = async () => {
    const data = { title: product.name, text: `${product.name} na ${SITE_NAME}`, url };
    try {
      if (navigator.share) {
        await navigator.share(data);
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Compartilhamento cancelado pelo usuário.
    }
  };

  return (
    <main className="product-page section-shell">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd(product)).replace(/</g, "\\u003c"),
        }}
      />
      <nav className="product-breadcrumb" aria-label="Você está em">
        <Link to="/" hash="colecao">
          <ArrowLeft size={15} /> Coleção
        </Link>
        <span aria-hidden="true">/</span>
        <span>{product.category}</span>
      </nav>
      <div className="product-page-grid">
        <div className="product-page-image">
          <img src={product.image} alt={product.name} />
          {!inStock(product) && <span className="product-tag">Esgotado</span>}
        </div>
        <div className="product-page-info">
          <span className="eyebrow">{product.category}</span>
          <h1>{product.name}</h1>
          <p className="product-page-price">
            {new Set(product.variants.map((v) => v.price)).size > 1 ? "A partir de " : ""}
            {formatPrice(startingPrice(product))}
          </p>
          {product.description && <p className="product-description">{product.description}</p>}
          <VariantPicker product={product} />
          <div className="product-page-actions">
            <button type="button" onClick={() => void share()}>
              <Share2 size={16} /> {copied ? "Link copiado!" : "Compartilhar"}
            </button>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`${product.name} — ${url}`)}`}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle size={16} /> Enviar no WhatsApp
            </a>
            <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer">
              <Instagram size={16} /> Instagram
            </a>
          </div>
          <ul className="product-page-notes">
            <li>Enviamos para todo o Brasil.</li>
            <li>O estoque é atualizado a cada pedido.</li>
          </ul>
        </div>
      </div>
      {related.length > 0 && (
        <section className="product-related" aria-labelledby="related-title">
          <h2 id="related-title">
            Combine com <em>outras peças</em>
          </h2>
          <div className="products-grid">
            {related.map((item) => (
              <RelatedCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

/** Nos relacionados, o clique leva direto para a página da peça (sem visualização rápida). */
function RelatedCard({ product }: { product: StoreProduct }) {
  const navigate = Route.useNavigate();
  return (
    <ProductCard
      product={product}
      onSelect={(item) => void navigate({ to: "/produto/$id", params: { id: item.id } })}
    />
  );
}

function ProductNotFound() {
  return (
    <main className="product-page section-shell product-not-found">
      <h1>Peça não encontrada</h1>
      <p>Ela pode ter saído da coleção. Veja as outras peças disponíveis.</p>
      <Link className="button-primary" to="/" hash="colecao">
        Ver coleção
      </Link>
    </main>
  );
}
