export default function PoliticaPrivacidad() {
    return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '65vh' }}>
      <div className="card card-yellow-black border-0 shadow-lg p-4" style={{ background: '#181825', maxWidth: 600, width: '100%' }}>
                <div className="d-flex align-items-center mb-3">
                    <i className="bi bi-shield-lock me-2" style={{ color: '#e5c86b', fontSize: 28 }}></i>
                    <h2 className="mb-0" style={{ color: '#e5c86b', fontWeight: 700 }}>
                        Política de Privacidad
                    </h2>
                </div>
                <p style={{ color: '#fff6da' }}>
                    En <strong>Gestor de pisos turísticos</strong> nos comprometemos a proteger tu privacidad. Esta política describe cómo recopilamos, usamos y protegemos tu información personal:
                </p>
                <ul style={{ color: '#fff6da' }}>
                    <li>Solo solicitamos los datos imprescindibles para el funcionamiento del servicio (nombre, correo electrónico, contraseña cifrada, etc.).</li>
                    <li>Tus datos no se comparten con terceros salvo obligación legal o para la prestación del propio servicio.</li>
                    <li>Puedes ejercer tus derechos de acceso, rectificación o cancelación en el correo de abajo</li>
                    <li>Usamos cookies técnicas para mejorar la experiencia de usuario.</li>
                    <li>Esta política puede actualizarse. Consulta esta página para conocer los cambios.</li>
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