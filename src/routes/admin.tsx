import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/data/products";
import { AdminStock } from "@/components/store/AdminStock";
import { LogOut, RefreshCw, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/admin")({ component: AdminPage });

type Order = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  zip_code: string;
  address_line: string;
  address_number: string;
  complement: string | null;
  neighborhood: string;
  city: string;
  state: string;
  delivery_method: string;
  payment_method: string;
  subtotal: number;
  total: number;
  payment_status: string;
  fulfillment_status: string;
  shipping_status: string;
  created_at: string;
  store_order_items: {
    product_name: string;
    size_label: string;
    color: string;
    quantity: number;
    unit_price: number;
    line_total: number;
  }[];
};

function AdminPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sessionEmail, setSessionEmail] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const [connectingShipping, setConnectingShipping] = useState(false);
  const [shippingMessage, setShippingMessage] = useState("");
  const [tab, setTab] = useState<"orders" | "stock">("orders");

  const loadOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        setSessionEmail("");
        setReady(true);
        return;
      }
      const { data: adminRow, error: adminError } = await supabase
        .from("store_admins")
        .select("email")
        .eq("user_id", userData.user.id)
        .maybeSingle();
      if (adminError || !adminRow)
        throw new Error(
          "Este usuário não tem permissão de administrador. Cadastre-o em store_admins no Supabase.",
        );
      setSessionEmail(userData.user.email ?? adminRow.email);
      const { data, error: ordersError } = await supabase
        .from("store_orders")
        .select("*, store_order_items(*)")
        .order("created_at", { ascending: false });
      if (ordersError) throw ordersError;
      setOrders((data ?? []) as Order[]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível carregar os pedidos.");
    } finally {
      setLoading(false);
      setReady(true);
    }
  };

  useEffect(() => {
    void loadOrders();
  }, []);
  useEffect(() => {
    const result = new URLSearchParams(window.location.search).get("melhor_envio");
    if (result === "connected")
      setShippingMessage(
        "Conta do Melhor Envio conectada. Os tokens foram recebidos e salvos no servidor.",
      );
    if (result === "error")
      setShippingMessage(
        "Não foi possível conectar. Confira as configurações do servidor e tente novamente.",
      );
    if (result) window.history.replaceState({}, "", window.location.pathname);
  }, []);

  const signIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setError("E-mail ou senha inválidos.");
      setLoading(false);
      return;
    }
    await loadOrders();
  };
  const connectMelhorEnvio = async () => {
    setConnectingShipping(true);
    setShippingMessage("");
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      if (!accessToken) throw new Error("Sua sessão expirou. Entre novamente no painel.");
      const response = await fetch("/api/melhor-envio/authorize", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const payload = (await response.json().catch(() => ({}))) as {
        authorizationUrl?: string;
        error?: string;
      };
      if (!response.ok || !payload.authorizationUrl) {
        throw new Error(payload.error || "Não foi possível iniciar a conexão.");
      }
      window.location.assign(payload.authorizationUrl);
    } catch (cause) {
      setShippingMessage(cause instanceof Error ? cause.message : "Falha ao iniciar a conexão.");
      setConnectingShipping(false);
    }
  };
  const signOut = async () => {
    await supabase.auth.signOut();
    setSessionEmail("");
    setOrders([]);
  };
  const updateStatus = async (id: string, status: string) => {
    if (
      status === "cancelled" &&
      !window.confirm("Cancelar este pedido? As peças voltam para o estoque.")
    )
      return;
    const { error: updateError } = await supabase
      .from("store_orders")
      .update({ fulfillment_status: status })
      .eq("id", id);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    await loadOrders();
  };

  return (
    <main className="admin-page">
      <header className="admin-header">
        <Link to="/" className="admin-brand">
          KYN KIDS <span>· ADMINISTRAÇÃO</span>
        </Link>
        {sessionEmail && (
          <button onClick={signOut}>
            <LogOut size={16} /> Sair
          </button>
        )}
      </header>
      {!sessionEmail ? (
        <form className="admin-login" onSubmit={signIn}>
          <ShieldCheck size={34} />
          <h1>Painel da loja</h1>
          <p>Acesso restrito à administração da KYN KIDS.</p>
          <label>
            E-mail
            <input
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label>
            Senha
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          {error && <p className="admin-error">{error}</p>}
          <button className="button-primary" disabled={loading}>
            {loading ? "Entrando..." : "Entrar no painel"}
          </button>
          <Link to="/">Voltar à loja</Link>
        </form>
      ) : (
        <section className="admin-content">
          <div className="admin-title">
            <div>
              <span className="eyebrow">ÁREA RESTRITA · {sessionEmail}</span>
              <h1>{tab === "orders" ? "Pedidos recebidos" : "Estoque e preços"}</h1>
              <p>
                {tab === "orders"
                  ? "Endereços, itens, pagamento e andamento de cada compra."
                  : "Quantidade por tamanho e cor. Cada pedido baixa o estoque; cancelar devolve."}
              </p>
            </div>
            <div className="admin-title-actions">
              <button onClick={() => void connectMelhorEnvio()} disabled={connectingShipping}>
                {connectingShipping ? "Conectando..." : "Conectar Melhor Envio"}
              </button>
              <button onClick={() => void loadOrders()}>
                <RefreshCw size={16} /> Atualizar
              </button>
            </div>
          </div>
          <div className="admin-tabs" role="tablist">
            <button
              role="tab"
              aria-selected={tab === "orders"}
              className={tab === "orders" ? "active" : ""}
              onClick={() => setTab("orders")}
            >
              Pedidos
            </button>
            <button
              role="tab"
              aria-selected={tab === "stock"}
              className={tab === "stock" ? "active" : ""}
              onClick={() => setTab("stock")}
            >
              Estoque
            </button>
          </div>
          {shippingMessage && (
            <p className="admin-shipping-message" role="status">
              {shippingMessage}
            </p>
          )}
          {tab === "stock" ? (
            <AdminStock />
          ) : (
            <>
              {error && <p className="admin-error">{error}</p>}
              {loading ? (
                <p>Carregando pedidos...</p>
              ) : orders.length === 0 ? (
                <div className="admin-empty">Nenhum pedido recebido ainda.</div>
              ) : (
                <div className="admin-orders">
                  {orders.map((order) => (
                    <article className="admin-order" key={order.id}>
                      <header>
                        <div>
                          <strong>{order.order_number}</strong>
                          <small>{new Date(order.created_at).toLocaleString("pt-BR")}</small>
                        </div>
                        <b>{formatPrice(Number(order.total))}</b>
                      </header>
                      <div className="admin-order-grid">
                        <div>
                          <h3>Cliente</h3>
                          <p>{order.customer_name}</p>
                          <p>{order.customer_email}</p>
                          <p>{order.customer_phone}</p>
                        </div>
                        <div>
                          <h3>Entrega</h3>
                          <p>
                            {order.address_line}, {order.address_number} {order.complement ?? ""}
                          </p>
                          <p>
                            {order.neighborhood} · {order.city}/{order.state}
                          </p>
                          <p>CEP {order.zip_code}</p>
                          <p>
                            {order.delivery_method === "malinha"
                              ? "Malinha grátis"
                              : "Envio · frete pendente"}
                          </p>
                        </div>
                        <div>
                          <h3>Pagamento</h3>
                          <p>
                            {order.payment_method === "pix"
                              ? "Pix"
                              : order.payment_method === "credit"
                                ? "Cartão de crédito"
                                : "Cartão de débito"}
                          </p>
                          <p>
                            Status:{" "}
                            {order.payment_status === "pending"
                              ? "Aguardando pagamento"
                              : order.payment_status}
                          </p>
                          <p>Subtotal: {formatPrice(Number(order.subtotal))}</p>
                        </div>
                      </div>
                      <div className="admin-items">
                        <h3>Produtos</h3>
                        {order.store_order_items?.map((item, i) => (
                          <p key={i}>
                            {item.quantity}× {item.product_name} · tam. {item.size_label}
                            {item.color ? ` ${item.color}` : ""} —{" "}
                            {formatPrice(Number(item.line_total))}
                          </p>
                        ))}
                      </div>
                      <footer>
                        <label>
                          Andamento do pedido
                          <select
                            value={order.fulfillment_status}
                            onChange={(e) => void updateStatus(order.id, e.target.value)}
                          >
                            <option value="received">Recebido</option>
                            <option value="preparing">Separando produtos</option>
                            <option value="shipped">Enviado</option>
                            <option value="delivered">Entregue</option>
                            <option value="cancelled">Cancelado</option>
                          </select>
                        </label>
                        <span>
                          Frete:{" "}
                          {order.shipping_status === "quote_pending"
                            ? "A calcular"
                            : order.shipping_status}
                        </span>
                      </footer>
                    </article>
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      )}
    </main>
  );
}
