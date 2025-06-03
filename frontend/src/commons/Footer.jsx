import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer-yellow-black py-3 fixed-bottom ">
      <div className="container d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
        <span className="small text-muted">
          © {new Date().getFullYear()} Gestor de pisos turísticos
        </span>
        <div className="d-flex flex-column flex-md-row gap-2 gap-md-3">
          <Link to="/terminos" className="btn btn-link text-muted me-3">
            Términos y condiciones
          </Link>
          <Link to="/privacidad" className="btn btn-link text-muted me-3">
            Política de privacidad
          </Link>
          <Link to="/aviso" className="btn btn-link text-muted">
            Aviso legal
          </Link>
        </div>
      </div>
    </footer>
  );
}