import { Instagram, MapPin, Truck } from "lucide-react";
import { KynKidsLogo } from "@/data/brand";
import { INSTAGRAM_URL } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-cta">
        <div>
          <span className="eyebrow">KYN KIDS NO INSTAGRAM</span>
          <strong>Novidades, looks e reposições primeiro por lá.</strong>
        </div>
        <a
          className="button-pill button-pill-yellow"
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noreferrer"
        >
          <Instagram size={17} /> Seguir @kynkidsmoda
        </a>
      </div>
      <div className="footer-main">
        <div className="footer-brand-col">
          <a
            href="/#inicio"
            className="brand-mark footer-brand logo-link"
            aria-label="KYN KIDS - início"
          >
            <KynKidsLogo className="kyn-logo-footer" />
          </a>
          <p>
            Moda infanto-juvenil para acompanhar
            <br />
            cada fase com conforto e personalidade.
          </p>
        </div>
        <div>
          <h4>Loja</h4>
          <a href="/#colecao">Todas as peças</a>
          <a href="/#categorias">Categorias</a>
          <a href="/#sobre">A KYN KIDS</a>
        </div>
        <div>
          <h4>Compras</h4>
          <p>
            <Truck size={15} /> Enviamos para todo o Brasil
          </p>
          <p>Tamanhos do 1 ao 18</p>
          <p>Estoque atualizado a cada pedido</p>
        </div>
        <div>
          <h4>Contato</h4>
          <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer">
            <Instagram size={15} /> @kynkidsmoda
          </a>
          <p>
            <MapPin size={15} /> Caxias do Sul · RS
          </p>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} KYN KIDS. Todos os direitos reservados.</span>
        <span>Feito para vestir boas memórias.</span>
      </div>
    </footer>
  );
}
