import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice, variantLabel } from "@/data/products";
import type { CartLine } from "@/lib/cart";
import { isValidCpf, lookupCep, maskCep, maskCpf, maskPhone, onlyDigits } from "@/lib/br";
import { ArrowLeft, CheckCircle2, LoaderCircle, X } from "lucide-react";

type Props = {
  items: CartLine[];
  onClose: () => void;
  onSuccess: () => void;
  /** Chamado quando o banco recusa o pedido por falta de estoque, para recarregar o catálogo. */
  onStockError?: () => void;
};

type CustomerForm = {
  name: string;
  email: string;
  phone: string;
  cpf: string;
  zip_code: string;
  address_line: string;
  address_number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
};

const initialCustomer: CustomerForm = {
  name: "",
  email: "",
  phone: "",
  cpf: "",
  zip_code: "",
  address_line: "",
  address_number: "",
  complement: "",
  neighborhood: "",
  city: "",
  state: "",
};

type CepStatus = "idle" | "loading" | "found" | "not-found";

export function CheckoutModal({ items, onClose, onSuccess, onStockError }: Props) {
  const [customer, setCustomer] = useState<CustomerForm>(initialCustomer);
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "credit" | "debit">("pix");
  const [deliveryMethod, setDeliveryMethod] = useState<"shipping">("shipping");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const total = items.reduce((sum, item) => sum + item.variant.price * item.quantity, 0);

  const [cepStatus, setCepStatus] = useState<CepStatus>("idle");
  const numberRef = useRef<HTMLInputElement>(null);
  const cpfInvalid =
    customer.cpf.length > 0 && onlyDigits(customer.cpf).length === 11 && !isValidCpf(customer.cpf);

  const update = (field: keyof CustomerForm, value: string) => {
    setCustomer((current) => ({ ...current, [field]: value }));
  };

  // Ao completar o CEP, busca rua, bairro, cidade e UF no ViaCEP.
  const cepDigits = onlyDigits(customer.zip_code);
  useEffect(() => {
    if (cepDigits.length !== 8) {
      setCepStatus("idle");
      return;
    }
    const controller = new AbortController();
    setCepStatus("loading");
    void lookupCep(cepDigits, controller.signal).then((address) => {
      if (controller.signal.aborted) return;
      if (!address) {
        setCepStatus("not-found");
        return;
      }
      setCustomer((current) => ({
        ...current,
        address_line: address.street || current.address_line,
        neighborhood: address.neighborhood || current.neighborhood,
        city: address.city,
        state: address.state,
      }));
      setCepStatus("found");
      numberRef.current?.focus();
    });
    return () => controller.abort();
  }, [cepDigits]);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (!isValidCpf(customer.cpf)) {
      setError("Confira o CPF: os números não conferem.");
      return;
    }
    if (onlyDigits(customer.phone).length < 10) {
      setError("Informe o telefone com DDD.");
      return;
    }
    setLoading(true);
    try {
      const { data, error: submitError } = await supabase.rpc("submit_store_order", {
        p_customer: customer,
        p_items: items.map((item) => ({
          product_id: item.product.id,
          variant_index: item.variant.index,
          quantity: item.quantity,
        })),
        p_payment_method: paymentMethod,
        p_delivery_method: deliveryMethod,
      });
      if (submitError) throw submitError;
      const result = data as { order_number?: string } | null;
      if (!result?.order_number)
        throw new Error("O pedido foi enviado, mas não recebemos o número de confirmação.");
      setOrderNumber(result.order_number);
      onSuccess();
    } catch (cause) {
      console.error("KYN KIDS checkout:", cause);
      const message =
        cause && typeof cause === "object" && "message" in cause ? String(cause.message) : "";
      if (/estoque insuficiente|indisponível/i.test(message)) {
        setError(
          `${message}. Atualizamos a sacola com o estoque atual — ajuste os itens e tente de novo.`,
        );
        onStockError?.();
      } else {
        setError(message || "Não foi possível enviar o pedido. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-backdrop" role="presentation" onClick={onClose}>
      <section
        className="checkout-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="checkout-heading">
          <div>
            <span className="eyebrow">KYN KIDS · FINALIZAÇÃO</span>
            <h2 id="checkout-title">{orderNumber ? "Pedido recebido" : "Seus dados e entrega"}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Fechar">
            <X size={21} />
          </button>
        </header>
        {orderNumber ? (
          <div className="checkout-success">
            <CheckCircle2 size={48} />
            <h3>Pedido registrado!</h3>
            <p>
              Seu número de pedido é <strong>{orderNumber}</strong>.
            </p>
            <p>
              O pedido foi enviado para a loja. O pagamento ainda está pendente e o frete será
              calculado antes da confirmação final.
            </p>
            <button className="button-primary full-button" type="button" onClick={onClose}>
              Voltar à loja
            </button>
          </div>
        ) : (
          <form className="checkout-form" onSubmit={submit}>
            <div className="checkout-section-title">
              <span>01</span>
              <h3>Quem está comprando?</h3>
            </div>
            <div className="checkout-fields">
              <label>
                Nome completo
                <input
                  required
                  autoComplete="name"
                  value={customer.name}
                  onChange={(e) => update("name", e.target.value)}
                />
              </label>
              <label>
                E-mail
                <input
                  required
                  type="email"
                  autoComplete="email"
                  value={customer.email}
                  onChange={(e) => update("email", e.target.value)}
                />
              </label>
              <label>
                WhatsApp / telefone
                <input
                  required
                  type="tel"
                  autoComplete="tel"
                  inputMode="numeric"
                  placeholder="(54) 99999-9999"
                  value={customer.phone}
                  onChange={(e) => update("phone", maskPhone(e.target.value))}
                />
              </label>
              <label>
                CPF
                <input
                  required
                  inputMode="numeric"
                  placeholder="000.000.000-00"
                  aria-invalid={cpfInvalid}
                  aria-describedby="cpf-help"
                  value={customer.cpf}
                  onChange={(e) => update("cpf", maskCpf(e.target.value))}
                />
                <small id="cpf-help" className={cpfInvalid ? "field-hint error" : "field-hint"}>
                  {cpfInvalid
                    ? "CPF inválido — confira os números."
                    : "Necessário para a etiqueta de envio e a nota fiscal."}
                </small>
              </label>
            </div>
            <div className="checkout-section-title">
              <span>02</span>
              <h3>Endereço de entrega</h3>
            </div>
            <div className="checkout-fields checkout-address">
              <label>
                CEP
                <input
                  required
                  autoComplete="postal-code"
                  inputMode="numeric"
                  maxLength={9}
                  placeholder="00000-000"
                  aria-describedby="cep-help"
                  value={customer.zip_code}
                  onChange={(e) => update("zip_code", maskCep(e.target.value))}
                />
                <small
                  id="cep-help"
                  className={cepStatus === "not-found" ? "field-hint error" : "field-hint"}
                  aria-live="polite"
                >
                  {cepStatus === "loading" && "Buscando endereço..."}
                  {cepStatus === "found" && "Endereço preenchido. Confira e informe o número."}
                  {cepStatus === "not-found" &&
                    "CEP não encontrado — preencha o endereço manualmente."}
                  {cepStatus === "idle" && (
                    <a
                      href="https://buscacepinter.correios.com.br/"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Não sei meu CEP
                    </a>
                  )}
                </small>
              </label>
              <label>
                Estado (UF)
                <input
                  required
                  maxLength={2}
                  autoComplete="address-level1"
                  value={customer.state}
                  onChange={(e) =>
                    update("state", e.target.value.replace(/[^a-z]/gi, "").toUpperCase())
                  }
                />
              </label>
              <label className="field-wide">
                Rua / avenida
                <input
                  required
                  autoComplete="street-address"
                  value={customer.address_line}
                  onChange={(e) => update("address_line", e.target.value)}
                />
              </label>
              <label>
                Número
                <input
                  required
                  ref={numberRef}
                  value={customer.address_number}
                  onChange={(e) => update("address_number", e.target.value)}
                />
              </label>
              <label>
                Complemento
                <input
                  value={customer.complement}
                  onChange={(e) => update("complement", e.target.value)}
                />
              </label>
              <label>
                Bairro
                <input
                  required
                  autoComplete="address-level3"
                  value={customer.neighborhood}
                  onChange={(e) => update("neighborhood", e.target.value)}
                />
              </label>
              <label>
                Cidade
                <input
                  required
                  autoComplete="address-level2"
                  value={customer.city}
                  onChange={(e) => update("city", e.target.value)}
                />
              </label>
            </div>
            <div className="checkout-section-title">
              <span>03</span>
              <h3>Como deseja receber?</h3>
            </div>
            <div className="checkout-choice-list">
              <label>
                <input
                  type="radio"
                  name="delivery"
                  checked={deliveryMethod === "shipping"}
                  onChange={() => setDeliveryMethod("shipping")}
                />
                <span>
                  <b>Envio para meu endereço</b>
                  <small>O valor do frete será calculado e informado antes da confirmação.</small>
                </span>
              </label>
            </div>
            <div className="checkout-section-title">
              <span>04</span>
              <h3>Forma de pagamento</h3>
            </div>
            <div className="checkout-payment-grid">
              {(
                [
                  ["pix", "Pix"],
                  ["credit", "Cartão de crédito"],
                  ["debit", "Cartão de débito"],
                ] as const
              ).map(([value, label]) => (
                <label
                  key={value}
                  className={
                    paymentMethod === value ? "checkout-payment selected" : "checkout-payment"
                  }
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === value}
                    onChange={() => setPaymentMethod(value)}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
            <ul className="checkout-summary">
              {items.map((item) => (
                <li key={`${item.product.id}-${item.variant.index}`}>
                  <span>
                    {item.quantity}× {item.product.name} · tam. {variantLabel(item.variant)}
                  </span>
                  <b>{formatPrice(item.variant.price * item.quantity)}</b>
                </li>
              ))}
            </ul>
            <div className="checkout-total">
              <span>Subtotal dos produtos</span>
              <strong>{formatPrice(total)}</strong>
            </div>
            <p className="checkout-disclaimer">
              O pedido será registrado sem cobrança neste momento. O frete e o pagamento serão
              confirmados pela loja antes do envio. Pix e cartões serão habilitados para cobrança
              online quando o provedor de pagamento for conectado.
            </p>
            {error && (
              <p className="checkout-error" role="alert">
                {error}
              </p>
            )}
            <div className="checkout-actions">
              <button type="button" className="checkout-back" onClick={onClose}>
                <ArrowLeft size={16} /> Voltar à sacola
              </button>
              <button type="submit" className="button-primary" disabled={loading}>
                {loading ? (
                  <>
                    <LoaderCircle className="spin" size={17} /> Enviando...
                  </>
                ) : (
                  <>Enviar pedido</>
                )}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
