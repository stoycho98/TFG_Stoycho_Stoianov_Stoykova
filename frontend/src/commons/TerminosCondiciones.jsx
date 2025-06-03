export default function TerminosCondiciones() {
  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '65vh' }}>
      <div className="card card-yellow-black border-0 shadow-lg p-4" style={{ background: '#181825', maxWidth: 600, width: '100%' }}>
        <div className="d-flex align-items-center mb-3">
          <i className="bi bi-file-earmark-text me-2" style={{ color: '#e5c86b', fontSize: 28 }}></i>
          <h2 className="mb-0" style={{ color: '#e5c86b', fontWeight: 700 }}>
            Términos y Condiciones de Uso
          </h2>
        </div>
        <p style={{ color: '#fff6da' }}>
          Bienvenido a <strong>Gestor de pisos turísticos</strong>. Al acceder o utilizar nuestro sitio web y servicios, aceptas cumplir con los siguientes términos y condiciones:
        </p>
        <ul style={{ color: '#fff6da' }}>
          <li>El uso de la plataforma es únicamente para mayores de edad o personas autorizadas.</li>
          <li>Los usuarios se comprometen a proporcionar información verídica y actualizada.</li>
          <li>Está prohibido publicar contenido falso, ofensivo o que infrinja derechos de terceros.</li>
          <li>Gestor de pisos turísticos no se responsabiliza por la veracidad de la información publicada por los usuarios.</li>
          <li>Nos reservamos el derecho de suspender cuentas que infrinjan estas normas.</li>
          <li>Estos términos pueden ser modificados en cualquier momento. Las nuevas condiciones se publicarán en esta página.</li>
        </ul>
        <p style={{ color: '#fff6da' }}>
          Si tienes alguna duda, puedes contactarnos en{' '}
          <a href="mailto:superadmin@admin.com" style={{ color: '#e5c86b', textDecoration: 'underline' }}>
            superadmin@admin.com
          </a>.
        </p>
      </div>
    </div>
  );
}
