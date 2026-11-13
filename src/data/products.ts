export type StoreProduct = {
  id: string;
  name: string;
  category: "Meninas" | "Meninos" | "Bebês" | "Conjuntos";
  age: string;
  image: string;
  tag?: string;
  description: string;
};

export const products: StoreProduct[] = [
  { id: "look-menina", name: "Looks para meninas", category: "Meninas", age: "1 a 18 anos", image: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=900&q=85", tag: "Novidades", description: "Peças confortáveis e cheias de personalidade para todos os momentos." },
  { id: "look-menino", name: "Looks para meninos", category: "Meninos", age: "1 a 18 anos", image: "https://images.unsplash.com/photo-1503919005314-30d93d07d823?auto=format&fit=crop&w=900&q=85", description: "Estilo e liberdade para acompanhar cada descoberta." },
  { id: "bebes", name: "Moda para pequenos", category: "Bebês", age: "1 a 3 anos", image: "https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=900&q=85", tag: "Conforto", description: "Toques macios e praticidade para a rotina dos pequenos." },
  { id: "conjuntos", name: "Conjuntos especiais", category: "Conjuntos", age: "1 a 18 anos", image: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=900&q=85", description: "Combinações prontas para vestir bem sem complicação." },
  { id: "casual", name: "Dia a dia", category: "Meninos", age: "4 a 18 anos", image: "https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=900&q=85", description: "Peças versáteis para brincar, passear e aproveitar." },
  { id: "fashion", name: "Ocasiões especiais", category: "Meninas", age: "4 a 18 anos", image: "https://images.unsplash.com/photo-1522771930-78848d9293e8?auto=format&fit=crop&w=900&q=85", tag: "Escolhas da loja", description: "Produções especiais para momentos que merecem destaque." },
];
