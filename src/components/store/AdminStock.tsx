import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/data/products";
import { Plus, Save } from "lucide-react";

type VariantRow = {
  product_id: string;
  variant_index: number;
  product_name: string;
  size_label: string;
  color: string;
  unit_price: number;
  stock: number;
  active: boolean;
};

type ProductRow = {
  id: string;
  name: string;
  category: string;
  image_url: string;
  active: boolean;
  position: number;
  store_catalog_variants: VariantRow[];
};

type Draft = { unit_price: string; stock: string; active: boolean };

const keyOf = (v: Pick<VariantRow, "product_id" | "variant_index">) =>
  `${v.product_id}#${v.variant_index}`;

export function AdminStock() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [filter, setFilter] = useState("");
  const [onlyLow, setOnlyLow] = useState(false);
  const [savingKey, setSavingKey] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    const { data, error: loadError } = await supabase
      .from("store_products")
      .select("id, name, category, image_url, active, position, store_catalog_variants(*)")
      .order("position");
    if (loadError) setError(loadError.message);
    const rows = (data ?? []) as ProductRow[];
    rows.forEach((row) =>
      row.store_catalog_variants.sort((a, b) => a.variant_index - b.variant_index),
    );
    setProducts(rows);
    setDrafts({});
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  const visible = useMemo(() => {
    const term = filter.trim().toLowerCase();
    return products.filter((product) => {
      if (term && !`${product.name} ${product.id} ${product.category}`.toLowerCase().includes(term))
        return false;
      if (onlyLow && !product.store_catalog_variants.some((v) => v.active && v.stock <= 0))
        return false;
      return true;
    });
  }, [products, filter, onlyLow]);

  const totals = useMemo(() => {
    const variants = products.flatMap((p) =>
      p.store_catalog_variants.filter((v) => v.active && p.active),
    );
    return {
      pieces: variants.reduce((sum, v) => sum + v.stock, 0),
      soldOut: variants.filter((v) => v.stock <= 0).length,
      value: variants.reduce((sum, v) => sum + v.stock * Number(v.unit_price), 0),
    };
  }, [products]);

  const draftOf = (v: VariantRow): Draft =>
    drafts[keyOf(v)] ?? {
      unit_price: String(Number(v.unit_price).toFixed(2)),
      stock: String(v.stock),
      active: v.active,
    };

  const setDraft = (v: VariantRow, patch: Partial<Draft>) =>
    setDrafts((current) => ({ ...current, [keyOf(v)]: { ...draftOf(v), ...patch } }));

  const saveVariant = async (v: VariantRow) => {
    const draft = draftOf(v);
    const price = Number(draft.unit_price.replace(",", "."));
    const stock = Number(draft.stock);
    if (!Number.isFinite(price) || price < 0) {
      setError("Preço inválido.");
      return;
    }
    if (!Number.isInteger(stock) || stock < 0) {
      setError("Estoque deve ser um número inteiro maior ou igual a zero.");
      return;
    }
    setSavingKey(keyOf(v));
    setError("");
    const { error: saveError } = await supabase
      .from("store_catalog_variants")
      .update({ unit_price: price, stock, active: draft.active })
      .eq("product_id", v.product_id)
      .eq("variant_index", v.variant_index);
    setSavingKey("");
    if (saveError) {
      setError(saveError.message);
      return;
    }
    setNotice(`Salvo: ${v.product_name} tam. ${v.size_label}${v.color ? ` ${v.color}` : ""}.`);
    setProducts((current) =>
      current.map((p) =>
        p.id !== v.product_id
          ? p
          : {
              ...p,
              store_catalog_variants: p.store_catalog_variants.map((row) =>
                keyOf(row) === keyOf(v)
                  ? { ...row, unit_price: price, stock, active: draft.active }
                  : row,
              ),
            },
      ),
    );
    setDrafts((current) => {
      const next = { ...current };
      delete next[keyOf(v)];
      return next;
    });
  };

  const toggleProduct = async (product: ProductRow) => {
    const { error: saveError } = await supabase
      .from("store_products")
      .update({ active: !product.active })
      .eq("id", product.id);
    if (saveError) {
      setError(saveError.message);
      return;
    }
    setProducts((current) =>
      current.map((p) => (p.id === product.id ? { ...p, active: !p.active } : p)),
    );
  };

  const addVariant = async (product: ProductRow) => {
    const size = window.prompt(`Novo tamanho para "${product.name}" (ex.: 4, 10, M):`)?.trim();
    if (!size) return;
    const color = window.prompt("Cor (deixe vazio se for a cor padrão da foto):")?.trim() ?? "";
    const reference = product.store_catalog_variants.at(-1);
    const nextIndex =
      Math.max(-1, ...product.store_catalog_variants.map((v) => v.variant_index)) + 1;
    const { error: insertError } = await supabase.from("store_catalog_variants").insert({
      product_id: product.id,
      variant_index: nextIndex,
      product_name: product.name,
      size_label: size,
      color,
      unit_price: reference ? Number(reference.unit_price) : 0,
      stock: 0,
      active: true,
    });
    if (insertError) {
      setError(insertError.message);
      return;
    }
    setNotice(
      `Tamanho ${size} criado com estoque 0 — informe a quantidade e o preço e clique em salvar.`,
    );
    await load();
  };

  if (loading) return <p>Carregando estoque...</p>;

  return (
    <section className="admin-stock">
      <div className="admin-stock-summary">
        <div>
          <b>{totals.pieces}</b>
          <small>peças em estoque</small>
        </div>
        <div>
          <b>{totals.soldOut}</b>
          <small>tamanhos esgotados</small>
        </div>
        <div>
          <b>{formatPrice(totals.value)}</b>
          <small>em mercadoria (preço de venda)</small>
        </div>
      </div>
      <div className="admin-stock-tools">
        <input
          type="search"
          placeholder="Buscar peça..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          aria-label="Buscar peça"
        />
        <label>
          <input type="checkbox" checked={onlyLow} onChange={(e) => setOnlyLow(e.target.checked)} />{" "}
          Só peças com tamanho esgotado
        </label>
      </div>
      {error && (
        <p className="admin-error" role="alert">
          {error}
        </p>
      )}
      {notice && (
        <p className="admin-shipping-message" role="status">
          {notice}
        </p>
      )}
      <div className="admin-stock-list">
        {visible.map((product) => (
          <article
            key={product.id}
            className={product.active ? "admin-stock-product" : "admin-stock-product inactive"}
          >
            <header>
              <img src={product.image_url} alt="" />
              <div>
                <strong>{product.name}</strong>
                <small>
                  {product.category} · {product.id}
                </small>
              </div>
              <label className="admin-stock-toggle">
                <input
                  type="checkbox"
                  checked={product.active}
                  onChange={() => void toggleProduct(product)}
                />{" "}
                Na vitrine
              </label>
            </header>
            <table>
              <thead>
                <tr>
                  <th>Tamanho</th>
                  <th>Cor</th>
                  <th>Preço (R$)</th>
                  <th>Estoque</th>
                  <th>Ativo</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {product.store_catalog_variants.map((v) => {
                  const draft = draftOf(v);
                  const dirty = !!drafts[keyOf(v)];
                  return (
                    <tr key={keyOf(v)} className={v.stock <= 0 && v.active ? "out" : undefined}>
                      <td>{v.size_label}</td>
                      <td>{v.color || "—"}</td>
                      <td>
                        <input
                          inputMode="decimal"
                          value={draft.unit_price}
                          onChange={(e) => setDraft(v, { unit_price: e.target.value })}
                          aria-label={`Preço tamanho ${v.size_label}`}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min={0}
                          step={1}
                          value={draft.stock}
                          onChange={(e) => setDraft(v, { stock: e.target.value })}
                          aria-label={`Estoque tamanho ${v.size_label}`}
                        />
                      </td>
                      <td>
                        <input
                          type="checkbox"
                          checked={draft.active}
                          onChange={(e) => setDraft(v, { active: e.target.checked })}
                          aria-label={`Tamanho ${v.size_label} ativo`}
                        />
                      </td>
                      <td>
                        <button
                          type="button"
                          disabled={!dirty || savingKey === keyOf(v)}
                          onClick={() => void saveVariant(v)}
                        >
                          <Save size={14} /> {savingKey === keyOf(v) ? "Salvando" : "Salvar"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <button
              type="button"
              className="admin-stock-add"
              onClick={() => void addVariant(product)}
            >
              <Plus size={14} /> Adicionar tamanho/cor
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
