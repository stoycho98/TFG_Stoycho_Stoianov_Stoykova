export default function AvisoLegal() {
  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '65vh' }}>
      <div className="card card-yellow-black border-0 shadow-lg p-4" style={{ background: '#181825', maxWidth: 600, width: '100%' }}>
        <div className="d-flex align-items-center mb-3">
          <i className="bi bi-shield-lock-fill me-2" style={{ color: '#e5c86b', fontSize: 28 }}></i>
          <h2 className="mb-0" style={{ color: '#e5c86b', fontWeight: 700 }}>
            Aviso Legal
          </h2>
        </div>
        <p style={{ color: '#fff6da' }}>
          Este sitio web, <strong>Gestor de pisos turísticos</strong>, pertenece a <span style={{ color: '#e5c86b' }}> Stoycho Stoianov Stoykova </span>, 
          con domicilio en <span style={{ color: '#e5c86b' }}> La Rioja</span>.
        </p>
        <ul style={{ color: '#fff6da' }}>
          <li>La información contenida en este sitio es solo informativa.</li>
          <li>El titular no se responsabiliza de los daños que puedan derivarse del uso de la información publicada.</li>
          <li>
            Los contenidos y derechos de propiedad intelectual de esta web pertenecen a sus autores o titulares y no pueden ser utilizados sin autorización.
          </li>
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
