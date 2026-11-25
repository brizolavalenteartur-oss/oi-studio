import { Instagram, MapPin } from "lucide-react";
import { KynKidsLogo } from "@/data/brand";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div>
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
          <h4>Explore</h4>
          <a href="/#colecao">Coleção</a>
          <a href="/#categorias">Categorias</a>
        </div>
        <div>
          <h4>Atendimento</h4>
          <p>
            <MapPin size={15} /> Caxias do Sul · RS
          </p>
          <a href="https://www.instagram.com/kynkidsmoda/" target="_blank" rel="noreferrer">
            <Instagram size={15} /> Instagram
          </a>
          <p>Enviamos para todo o Brasil.</p>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} KYN KIDS. Todos os direitos reservados.</span>
        <span>Feito para vestir boas memórias.</span>
      </div>
    </footer>
  );
}
