import { useState, useEffect } from 'react';
import axios from 'axios';
import BuscadorPisos from './BuscadorPisos';

export default function FormularioReserva() {
  const [listaPisos, setListaPisos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [pisosPagados, setPisosPagados] = useState(new Set());

  useEffect(() => {
    axios.get('/pisos').then(res => setListaPisos(res.data)).finally(() => setCargando(false));
    axios.get('/pagos').then(res => setPisosPagados(new Set((res.data || []).map(p => p.id_piso))));
  }, []);

  return (
    <BuscadorPisos
      pisos={listaPisos}
      loading={cargando}
      renderCard={piso => <PisoReservaCard piso={piso} canReview={pisosPagados.has(piso.id)} />}
    />
  );
}

const construirUrlImagen = url =>
  /^https?:\/\//.test(url)
    ? url
    : `${axios.defaults.baseURL || 'http://localhost:5000'}/${url.replace(/^\/+/, '')}`;

function PisoReservaCard({ piso, canReview }) {
  if (!piso || !piso.id) return null;

  const [imagenes, setImagenes] = useState([]);
  const [imgActiva, setImgActiva] = useState(0);
  const [entrada, setEntrada] = useState('');
  const [salida, setSalida] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [enviando, setEnviando] = useState(false);

  const [mostrarCalendario, setMostrarCalendario] = useState(false);
  const [tmpEntrada, setTmpEntrada] = useState('');
  const [tmpSalida, setTmpSalida] = useState('');
  const [reservasConfirmadas, setReservasConfirmadas] = useState([]);
  const [cargandoReservas, setCargandoReservas] = useState(true);

  const [mostrarModal, setMostrarModal] = useState(false);
  const [resenas, setResenas] = useState([]);
  const [cargandoResenas, setCargandoResenas] = useState(true);
  const [puntuacion, setPuntuacion] = useState(5);
  const [comentario, setComentario] = useState('');
  const [mensajeResena, setMensajeResena] = useState('');

  useEffect(() => {
    axios.get(`/pisos/${piso.id}/imagenes`).then(res => setImagenes(res.data));
    axios.get(`/resenas/piso/${piso.id}`)
      .then(res => setResenas(res.data))
      .finally(() => setCargandoResenas(false));
  }, [piso.id]);

  const precioEstimado = entrada && salida
    ? (() => {
      const e = new Date(entrada), s = new Date(salida);
      const d = Math.ceil((s - e) / (1000 * 60 * 60 * 24));
      return d > 0 ? (piso.precio * d).toFixed(2) : null;
    })() : null;

  const puntuacionMedia = resenas.length
    ? (resenas.reduce((sum, r) => sum + r.puntuacion, 0) / resenas.length).toFixed(1)
    : null;

  const hoy = new Date().toISOString().split('T')[0];

  async function manejarReserva(e) {
    e.preventDefault();
    setMensaje('');
    setEnviando(true);
    if (!entrada || !salida) return setMensaje('❌ Debes elegir fechas'), setEnviando(false);
    if (entrada < hoy || salida < hoy) return setMensaje('❌ No puedes reservar en el pasado'), setEnviando(false);
    if (salida <= entrada) return setMensaje('❌ La salida debe ser posterior a la entrada'), setEnviando(false);
    try {
      await axios.post('/reservas', { id_piso: piso.id, fecha_entrada: entrada, fecha_salida: salida });
      setMensaje('✅ Reserva creada con éxito'); setEntrada(''); setSalida('');
    } catch (err) {
      setMensaje(`❌ ${err.response?.data?.error || 'Error al crear reserva'}`);
    } finally {
      setEnviando(false);
    }
  }

  async function cargarReservasConfirmadas() {
    setCargandoReservas(true);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const { data } = await axios.get(`/reservas/piso/${piso.id}/confirmadas`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReservasConfirmadas(data);
    } catch {
      setReservasConfirmadas([]);
    } finally {
      setCargandoReservas(false);
    }
  }

  const abrirCalendario = () => { setTmpEntrada(entrada); setTmpSalida(salida); setMostrarCalendario(true); cargarReservasConfirmadas(); };
  const guardarFechas = () => { setEntrada(tmpEntrada); setSalida(tmpSalida); setMostrarCalendario(false); };

  function formatearFecha(fechaIso) {
    if (!fechaIso) return '';
    const f = new Date(fechaIso);
    return `${f.getDate().toString().padStart(2, '0')}/${(f.getMonth() + 1).toString().padStart(2, '0')}/${f.getFullYear()}`;
  }

  async function manejarEnvioResena(e) {
    e.preventDefault();
    setMensajeResena('');
    try {
      await axios.post('/resenas', {
        id_piso: piso.id,
        puntuacion,
        comentario
      });
      const { data } = await axios.get(`/resenas/piso/${piso.id}`);
      setResenas(data);
      setComentario('');
      setMensajeResena('✅ Reseña enviada');
    } catch (err) {
      setMensajeResena(`❌ ${err.response?.data?.error || 'Error al enviar reseña'}`);
    }
  }

  return (
    <>
      <div className="card h-100 shadow-sm">
        {imagenes[imgActiva]?.url_imagen ? (
          <img
            src={construirUrlImagen(imagenes[imgActiva].url_imagen)}
            className="card-img-top"
            alt={piso.titulo}
            style={{ objectFit: 'cover', height: 180 }}
          />
        ) : (
          <div className="card-img-top bg-secondary text-white d-flex align-items-center justify-content-center" style={{ height: 180 }}>Sin imagen</div>
        )}
        {imagenes.length > 1 && (
          <div className="d-flex flex-wrap justify-content-center gap-1 p-2">
            {imagenes.map((img, i) => (
              <img
                key={i}
                src={construirUrlImagen(img.url_imagen)}
                onClick={() => setImgActiva(i)}
                className={`img-thumbnail ${i === imgActiva ? 'border-warning' : ''}`}
                style={{ width: 60, height: 60, objectFit: 'cover', cursor: 'pointer' }}
                alt={`Vista ${i + 1}`}
              />
            ))}
          </div>
        )}
        <div className="card-body d-flex flex-column">
          <h5 className="card-title">{piso.titulo}</h5>
          <p className="mb-1 text-muted"><strong>Ubicación:</strong> {piso.municipio}, {piso.provincia}, {piso.comunidad}</p>
          <p className="mb-1"><strong>Precio noche:</strong> {piso.precio} €</p>
          <div className="mb-2">
            <button type="button" className="btn btn-outline-secondary w-100" onClick={abrirCalendario}>Seleccionar fechas</button>
            {entrada && salida && (
              <div className="small text-muted mt-1">Entrada: <b>{entrada}</b> | Salida: <b>{salida}</b></div>
            )}
          </div>
          <form onSubmit={manejarReserva}>
            {precioEstimado && <p className="mt-2"><strong>Estimado:</strong> {precioEstimado} €</p>}
            {mensaje && <div className={`alert mt-2 ${mensaje.startsWith('✅') ? 'alert-success' : 'alert-danger'}`} role="alert">{mensaje}</div>}
            <button type="submit" className="btn btn-outline-secondary w-100" disabled={enviando}>
              {enviando ? 'Reservando…' : 'Reservar'}
            </button>
          </form>
          <hr className="my-3" />
          <h6>Reseñas</h6>
          {cargandoResenas
            ? <p>Cargando reseñas…</p>
            : puntuacionMedia
              ? <span>⭐ {puntuacionMedia} ({resenas.length})</span>
              : <p className="text-muted">Aún no hay reseñas</p>
          }
          {canReview && (
            <button className="btn btn-link p-0 mt-2" onClick={() => setMostrarModal(true)}>
              Ver y dejar reseña
            </button>
          )}
        </div>
      </div>

      {mostrarCalendario && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div className="modal fade show d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Seleccionar fechas</h5>
                  <button type="button" className="btn-close" onClick={() => setMostrarCalendario(false)} />
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-bold">Reservas confirmadas para este piso:</label>
                    {cargandoReservas ? (
                      <div>Cargando reservas…</div>
                    ) : reservasConfirmadas.length === 0 ? (
                      <div className="text-muted small">No hay reservas confirmadas.</div>
                    ) : (
                      <ul className="list-group small">
                        {reservasConfirmadas.map(r => (
                          <li className="list-group-item" key={r.id}>
                            {formatearFecha(r.fecha_entrada)} &rarr; {formatearFecha(r.fecha_salida)}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="row g-2">
                    <div className="col">
                      <label className="form-label small">Entrada</label>
                      <input type="date" className="form-control form-control-sm"
                        value={tmpEntrada} onChange={e => setTmpEntrada(e.target.value)} min={hoy} />
                    </div>
                    <div className="col">
                      <label className="form-label small">Salida</label>
                      <input type="date" className="form-control form-control-sm"
                        value={tmpSalida} onChange={e => setTmpSalida(e.target.value)} min={tmpEntrada || hoy} />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" type="button" onClick={() => setMostrarCalendario(false)}>Cancelar</button>
                  <button className="btn btn-primary" type="button" onClick={guardarFechas} disabled={!tmpEntrada || !tmpSalida}>Guardar</button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {mostrarModal && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div className="modal fade show d-block" tabIndex="-1">
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Reseñas de "{piso.titulo}"</h5>
                  <button type="button" className="btn-close" onClick={() => setMostrarModal(false)} />
                </div>
                <div className="modal-body">
                  <div className="overflow-auto mb-4" style={{ maxHeight: 300 }}>
                    {cargandoResenas
                      ? <p>Cargando reseñas…</p>
                      : resenas.map((r, i) => (
                        <div key={i} className="mb-3">
                          <strong>{r.revisor}</strong> ({new Date(r.fecha_creacion).toLocaleDateString()}):<br />
                          {'★'.repeat(r.puntuacion)}{'☆'.repeat(5 - r.puntuacion)}<br />
                          {r.comentario}
                        </div>
                      ))
                    }
                  </div>
                  {canReview && (
                    <>
                      {mensajeResena && <div className={`alert ${mensajeResena.startsWith('✅') ? 'alert-success' : 'alert-danger'}`} role="alert">{mensajeResena}</div>}
                      <form onSubmit={manejarEnvioResena}>
                        <div className="mb-3">
                          <label className="form-label">Puntuación</label>
                          <select className="form-select" value={puntuacion} onChange={e => setPuntuacion(+e.target.value)}>
                            {[5, 4, 3, 2, 1].map(n => (<option key={n} value={n}>{n} estrella{n > 1 ? 's' : ''}</option>))}
                          </select>
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Comentario</label>
                          <textarea className="form-control" rows="3" value={comentario} onChange={e => setComentario(e.target.value)} required />
                        </div>
                        <button type="submit" className="btn btn-yellow">Enviar reseña</button>
                      </form>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
