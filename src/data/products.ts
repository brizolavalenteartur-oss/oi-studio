export type ProductVariant = { price: number; sizes: string };

export type StoreProduct = {
  id: string;
  name: string;
  category: "Meninas" | "Meninos" | "Bebês" | "Conjuntos";
  image: string;
  variants: ProductVariant[];
  tag?: string;
};

export const formatPrice = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const startingPrice = (product: StoreProduct) =>
  Math.min(...product.variants.map((variant) => variant.price));

/** Catálogo KYN KIDS (63 peças) importado do arquivo Word. */
export const products: StoreProduct[] = [
  { id: "produto-01", name: "Blusa básica pink", category: "Meninas", image: "/images/produtos/produto-01.jpg", variants: [{"price": 30.29, "sizes": "2/1"}, {"price": 36.0, "sizes": "8/10"}] },
  { id: "produto-02", name: "Vestido com calcinha rosa", category: "Bebês", image: "/images/produtos/produto-02.jpg", variants: [{"price": 108.0, "sizes": "2"}] },
  { id: "produto-03", name: "Conjunto elefantinho blusa e legging", category: "Conjuntos", image: "/images/produtos/produto-03.jpg", variants: [{"price": 65.21, "sizes": "G"}, {"price": 74.45, "sizes": "3 -2 PEÇAS"}] },
  { id: "produto-04", name: "Macacão curto rosa", category: "Bebês", image: "/images/produtos/produto-04.jpg", variants: [{"price": 99.9, "sizes": "M/G"}] },
  { id: "produto-05", name: "Bermuda ciclista pink", category: "Meninas", image: "/images/produtos/produto-05.jpg", variants: [{"price": 25.37, "sizes": "2/3"}] },
  { id: "produto-06", name: "Conjunto gatinho blusa e short", category: "Conjuntos", image: "/images/produtos/produto-06.jpg", variants: [{"price": 74.45, "sizes": "2/3-2 PEÇAS"}, {"price": 65.21, "sizes": "G"}] },
  { id: "produto-07", name: "Conjunto ursinho blusa e short", category: "Conjuntos", image: "/images/produtos/produto-07.jpg", variants: [{"price": 65.21, "sizes": "2/3"}] },
  { id: "produto-08", name: "Blusa manga babado branca", category: "Meninas", image: "/images/produtos/produto-08.jpg", variants: [{"price": 58.48, "sizes": "2"}, {"price": 64.4, "sizes": "4"}] },
  { id: "produto-09", name: "Conjunto gatinho rosa e short lima", category: "Conjuntos", image: "/images/produtos/produto-09.jpg", variants: [{"price": 65.2, "sizes": "2"}] },
  { id: "produto-10", name: "Vestido polo gatinha tenista", category: "Meninas", image: "/images/produtos/produto-10.jpg", variants: [{"price": 30.29, "sizes": "1/3"}, {"price": 83.83, "sizes": "6 VERDE"}] },
  { id: "produto-11", name: "Blusa bailarina manga babado", category: "Meninas", image: "/images/produtos/produto-11.jpg", variants: [{"price": 42.86, "sizes": "2/3"}] },
  { id: "produto-12", name: "Vestido floral passarinhos creme", category: "Meninas", image: "/images/produtos/produto-12.jpg", variants: [{"price": 87.82, "sizes": "2"}] },
  { id: "produto-13", name: "Vestido polo listrado", category: "Meninas", image: "/images/produtos/produto-13.jpg", variants: [{"price": 103.38, "sizes": "2"}] },
  { id: "produto-14", name: "Conjunto onça blusa e saia short", category: "Conjuntos", image: "/images/produtos/produto-14.jpg", variants: [{"price": 87.0, "sizes": "1"}, {"price": 93.0, "sizes": "3"}] },
  { id: "produto-15", name: "Conjunto gatinho verde lima", category: "Conjuntos", image: "/images/produtos/produto-15.jpg", variants: [{"price": 30.29, "sizes": "1"}] },
  { id: "produto-16", name: "Bermuda ciclista estampada", category: "Meninas", image: "/images/produtos/produto-16.jpg", variants: [{"price": 36.0, "sizes": "4"}] },
  { id: "produto-17", name: "Blusa básica branca", category: "Meninas", image: "/images/produtos/produto-17.jpg", variants: [{"price": 30.29, "sizes": "2/1/3  10 R$ 36,00"}] },
  { id: "produto-18", name: "Blusa ribana manga babado lilás", category: "Meninas", image: "/images/produtos/produto-18.jpg", variants: [{"price": 26.38, "sizes": "1/3/10"}] },
  { id: "produto-19", name: "Conjunto laços blusa e short", category: "Conjuntos", image: "/images/produtos/produto-19.jpg", variants: [{"price": 58.48, "sizes": "1/3"}, {"price": 136.49, "sizes": "6 VERDE"}] },
  { id: "produto-20", name: "Conjunto cachorrinho blusa e short", category: "Conjuntos", image: "/images/produtos/produto-20.jpg", variants: [{"price": 79.9, "sizes": "4/3"}] },
  { id: "produto-21", name: "Conjunto princesa blusa e bermuda", category: "Conjuntos", image: "/images/produtos/produto-21.jpg", variants: [{"price": 69.59, "sizes": "3"}, {"price": 83.87, "sizes": "4"}, {"price": 57.71, "sizes": "4"}] },
  { id: "produto-22", name: "Legging corações preta", category: "Meninas", image: "/images/produtos/produto-22.jpg", variants: [{"price": 46.0, "sizes": "4/6"}] },
  { id: "produto-23", name: "Calça xadrez preta", category: "Meninas", image: "/images/produtos/produto-23.jpg", variants: [{"price": 40.0, "sizes": "3/4"}] },
  { id: "produto-24", name: "Saia short rosa", category: "Meninas", image: "/images/produtos/produto-24.jpg", variants: [{"price": 80.0, "sizes": "8/6/4 E 3 PRETA 4/6/10"}] },
  { id: "produto-25", name: "Conjunto flor blusa e short laranja", category: "Conjuntos", image: "/images/produtos/produto-25.jpg", variants: [{"price": 93.0, "sizes": "4"}] },
  { id: "produto-26", name: "Conjunto blusa e bermuda estampada", category: "Conjuntos", image: "/images/produtos/produto-26.jpg", variants: [{"price": 93.75, "sizes": "4"}] },
  { id: "produto-27", name: "Blusa bailarina rosa", category: "Meninas", image: "/images/produtos/produto-27.jpg", variants: [{"price": 33.5, "sizes": "4"}, {"price": 46.6, "sizes": "8"}] },
  { id: "produto-28", name: "Vestido passarinhos creme", category: "Meninas", image: "/images/produtos/produto-28.jpg", variants: [{"price": 97.5, "sizes": "4"}] },
  { id: "produto-29", name: "Vestido passarinhos rosa", category: "Meninas", image: "/images/produtos/produto-29.jpg", variants: [{"price": 97.5, "sizes": "4"}] },
  { id: "produto-30", name: "Conjunto estampado verde blusa e short", category: "Conjuntos", image: "/images/produtos/produto-30.jpg", variants: [{"price": 200.0, "sizes": "6 ROSA"}] },
  { id: "produto-31", name: "Conjunto blusa branca e legging estampada", category: "Conjuntos", image: "/images/produtos/produto-31.jpg", variants: [{"price": 72.0, "sizes": "6/10 E UMA 10 PRETA"}] },
  { id: "produto-32", name: "Conjunto floral cropped e saia", category: "Conjuntos", image: "/images/produtos/produto-32.jpg", variants: [{"price": 150.0, "sizes": "8/1O"}] },
  { id: "produto-33", name: "Conjunto Paris blusa e legging", category: "Conjuntos", image: "/images/produtos/produto-33.jpg", variants: [{"price": 75.0, "sizes": "8"}] },
  { id: "produto-34", name: "Vestido branco manga sino", category: "Meninas", image: "/images/produtos/produto-34.jpg", variants: [{"price": 234.0, "sizes": "12/14/16"}] },
  { id: "produto-35", name: "Conjunto branco regata e calça", category: "Conjuntos", image: "/images/produtos/produto-35.jpg", variants: [{"price": 282.79, "sizes": "10"}] },
  { id: "produto-36", name: "Conjunto tropical blusa e short", category: "Conjuntos", image: "/images/produtos/produto-36.jpg", variants: [{"price": 166.0, "sizes": "16/14"}] },
  { id: "produto-37", name: "Conjunto cropped e short pink", category: "Conjuntos", image: "/images/produtos/produto-37.jpg", variants: [{"price": 115.4, "sizes": "10"}] },
  { id: "produto-38", name: "Bermuda ciclista preta", category: "Meninas", image: "/images/produtos/produto-38.jpg", variants: [{"price": 37.0, "sizes": "14"}] },
  { id: "produto-39", name: "Blusa canelada decote V", category: "Meninas", image: "/images/produtos/produto-39.jpg", variants: [{"price": 58.48, "sizes": "14"}] },
  { id: "produto-40", name: "Vestido amarelo lima com babados", category: "Meninas", image: "/images/produtos/produto-40.jpg", variants: [{"price": 100.0, "sizes": "12"}] },
  { id: "produto-41", name: "Camiseta aranha vermelha", category: "Meninos", image: "/images/produtos/produto-41.jpg", variants: [{"price": 47.0, "sizes": "2/4/6"}] },
  { id: "produto-42", name: "Camiseta jacaré bege", category: "Meninos", image: "/images/produtos/produto-42.jpg", variants: [{"price": 20.0, "sizes": "1/2/3 E VERDE 2/3"}] },
  { id: "produto-43", name: "Conjunto dino camiseta e bermuda verde", category: "Conjuntos", image: "/images/produtos/produto-43.jpg", variants: [{"price": 68.9, "sizes": "1/3"}] },
  { id: "produto-44", name: "Macacão azul", category: "Bebês", image: "/images/produtos/produto-44.jpg", variants: [{"price": 99.9, "sizes": "M/GG/G AMARELO P"}] },
  { id: "produto-45", name: "Conjunto camiseta vermelha e bermuda mescla", category: "Conjuntos", image: "/images/produtos/produto-45.jpg", variants: [{"price": 83.83, "sizes": "2/3/4/8"}] },
  { id: "produto-46", name: "Conjunto dino vermelho camiseta e bermuda", category: "Conjuntos", image: "/images/produtos/produto-46.jpg", variants: [{"price": 65.21, "sizes": "1/3"}] },
  { id: "produto-47", name: "Conjunto polo menta e bermuda", category: "Conjuntos", image: "/images/produtos/produto-47.jpg", variants: [{"price": 111.66, "sizes": "3/6/8"}] },
  { id: "produto-48", name: "Camiseta cachorrinho vermelha", category: "Meninos", image: "/images/produtos/produto-48.jpg", variants: [{"price": 46.6, "sizes": "3"}] },
  { id: "produto-49", name: "Camiseta palmeiras preta", category: "Meninos", image: "/images/produtos/produto-49.jpg", variants: [{"price": 100.0, "sizes": "10/12"}] },
  { id: "produto-50", name: "Camiseta dino marinho", category: "Meninos", image: "/images/produtos/produto-50.jpg", variants: [{"price": 67.1, "sizes": "3/4"}] },
  { id: "produto-51", name: "Camiseta manga longa camping vermelha", category: "Meninos", image: "/images/produtos/produto-51.jpg", variants: [{"price": 50.0, "sizes": "4"}] },
  { id: "produto-52", name: "Camiseta bege", category: "Meninos", image: "/images/produtos/produto-52.jpg", variants: [{"price": 130.0, "sizes": "4"}] },
  { id: "produto-53", name: "Camiseta marinho básica", category: "Meninos", image: "/images/produtos/produto-53.jpg", variants: [{"price": 45.0, "sizes": "4/6/8/12"}] },
  { id: "produto-54", name: "Polo branca", category: "Meninos", image: "/images/produtos/produto-54.jpg", variants: [{"price": 50.0, "sizes": "4/6/8/14"}] },
  { id: "produto-55", name: "Camiseta manga longa herói verde", category: "Meninos", image: "/images/produtos/produto-55.jpg", variants: [{"price": 42.0, "sizes": "4/6/8"}] },
  { id: "produto-56", name: "Bermuda moletom preta", category: "Meninos", image: "/images/produtos/produto-56.jpg", variants: [{"price": 50.0, "sizes": "4/6/8"}] },
  { id: "produto-57", name: "Camiseta laranja estampada", category: "Meninos", image: "/images/produtos/produto-57.jpg", variants: [{"price": 40.0, "sizes": "4/6/8"}] },
  { id: "produto-58", name: "Camiseta manga longa marinho", category: "Meninos", image: "/images/produtos/produto-58.jpg", variants: [{"price": 50.0, "sizes": "6"}] },
  { id: "produto-59", name: "Camiseta manga longa branca", category: "Meninos", image: "/images/produtos/produto-59.jpg", variants: [{"price": 50.0, "sizes": "6"}] },
  { id: "produto-60", name: "Camiseta branca básica", category: "Meninos", image: "/images/produtos/produto-60.jpg", variants: [{"price": 40.0, "sizes": "6/8/12/14"}] },
  { id: "produto-61", name: "Camiseta preta básica", category: "Meninos", image: "/images/produtos/produto-61.jpg", variants: [{"price": 47.0, "sizes": "6/8/12"}] },
  { id: "produto-62", name: "Camiseta amarela estampada", category: "Meninos", image: "/images/produtos/produto-62.jpg", variants: [{"price": 93.0, "sizes": "8"}] },
  { id: "produto-63", name: "Camiseta henley azul", category: "Meninos", image: "/images/produtos/produto-63.jpg", variants: [{"price": 200.0, "sizes": "14/12"}] },
];
