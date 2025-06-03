import { useState, useEffect } from 'react';
import axios from 'axios';

export default function FormularioPago() {
  const [listaPagos, setListaPagos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mensajeError, setMensajeError] = useState('');

  const cargarPagos = async () => {
    setCargando(true);
    try {
      const { data } = await axios.get('/pagos');
      setListaPagos(data);
    } catch (err) {
      console.error('Error al cargar pagos:', err);
      setMensajeError('No se pudieron cargar tus pagos');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPagos();
  }, []);

  if (cargando) return <p className="text-center">Cargando pagos…</p>;
  if (mensajeError) return <div className="alert alert-danger text-center">{mensajeError}</div>;

  return (
    <div className="container py-4">
      <h2 className="mb-4 text-center text-warning">Mis Pagos</h2>
      <div className="row justify-content-center">
        {listaPagos.length === 0
          ? <p className="text-center">No tienes reservas pendientes de pago.</p>
          : listaPagos.map(item => (
            <div className="col-12 col-md-8 col-lg-6 mb-4" key={item.reserva_id}>
              <PagoItem item={item} onActualizar={cargarPagos} />
            </div>
          ))
        }
      </div>
    </div>
  );
}

function PagoItem({ item, onActualizar }) {
  const [imagenes, setImagenes] = useState([]);
  const [imgActiva, setImgActiva] = useState(0);
  const [pagado, setPagado] = useState(item.estado_pago === 'completado');
  const [metodo, setMetodo] = useState(item.metodo_pago || 'tarjeta');
  const [mensajePago, setMensajePago] = useState('');
  const [mensajeCancelacion, setMensajeCancelacion] = useState('');
  const [ocupado, setOcupado] = useState(false);

  useEffect(() => {
    axios.get(`/pisos/${item.id_piso}/imagenes`)
      .then(res => {
        setImagenes(res.data);
        setImgActiva(0);
      })
      .catch(err => console.error('Error cargando imágenes:', err));
  }, [item.id_piso]);

  const construirUrlImagen = urlIm => {
    if (/^https?:\/\//.test(urlIm)) return urlIm;
    const base = axios.defaults.baseURL || '';
    return `${base}/${urlIm.replace(/^\/+/, '')}`;
  };

  const manejarCancelar = async () => {
    if (!window.confirm('¿Seguro que quieres cancelar esta reserva?')) return;
    setOcupado(true);
    try {
      await axios.delete(`/reservas/${item.reserva_id}`);
      setMensajeCancelacion('✅ Reserva cancelada');
      onActualizar();
    } catch {
      setMensajeCancelacion('❌ No se pudo cancelar');
    } finally {
      setOcupado(false);
    }
  };

  const manejarPago = async e => {
    e.preventDefault();
    setMensajePago('');
    setOcupado(true);
    try {
      await axios.post('/pagos', {
        id_reserva: item.reserva_id,
        metodo_pago: metodo
      });
      setMensajePago('✅ Pago registrado');
      setPagado(true);
      onActualizar();
    } catch {
      setMensajePago('❌ Error al registrar el pago');
    } finally {
      setOcupado(false);
    }
  };

  const renderizarEstado = est => {
    if (est === 'confirmada') return <span className="text-success">confirmada</span>;
    if (est === 'pendiente') return <span className="text-warning">pendiente</span>;
    if (est === 'cancelada') return <span className="text-danger">cancelada</span>;
    return est;
  };

  return (
    <div className="form-yellow-black rounded p-4 mb-4 shadow-sm">
      <h5 className="text-warning text-center">
        {item.titulo}
      </h5>

      {imagenes.length > 0 && (
        <>
          <img
            src={construirUrlImagen(imagenes[imgActiva].url_imagen)}
            alt={`Piso ${item.id_piso}`}
            className="d-block mx-auto mb-2"
            style={{ maxHeight: '200px', objectFit: 'cover' }}
          />
          {imagenes.length > 1 && (
            <div className="d-flex justify-content-center gap-1 mb-3">
              {imagenes.map((img, idx) => (
                <img
                  key={img.id}
                  src={construirUrlImagen(img.url_imagen)}
                  alt={`Foto ${idx + 1}`}
                  onClick={() => setImgActiva(idx)}
                  className={`img-thumbnail ${idx === imgActiva ? 'border-warning' : ''}`}
                  style={{ width: '50px', height: '50px', objectFit: 'cover', cursor: 'pointer' }}
                />
              ))}
            </div>
          )}
        </>
      )}

      <p className="text-warning text-center">
        📅 {new Date(item.fecha_entrada).toLocaleDateString()} → {new Date(item.fecha_salida).toLocaleDateString()}
      </p>
      <p className="text-warning text-center">💰 Total: {item.precio_total.toFixed(2)} €</p>
      <p className="text-warning text-center">
        📌 Estado reserva: {renderizarEstado(item.estado_reserva)}
      </p>
      <p className="text-warning text-center">
        💳 Estado pago: {pagado
          ? <span className="text-success">✅ Pagado</span>
          : <span className="text-warning">❌ Sin pago</span>
        }
      </p>

      {mensajeCancelacion && <div className="alert alert-success text-center">{mensajeCancelacion}</div>}
      {mensajePago && <div className={`alert ${mensajePago.startsWith('❌') ? 'alert-danger' : 'alert-success'} text-center`}>{mensajePago}</div>}

      {!pagado && item.estado_reserva !== 'cancelada' && (
        <>
          <form onSubmit={manejarPago} className="mt-3">
            <div className="mb-3">
              <label className="form-label">Método de pago</label>
              <select
                className="form-select"
                value={metodo}
                onChange={e => setMetodo(e.target.value)}
                disabled={ocupado}
              >
                <option value="tarjeta">Tarjeta</option>
                <option value="paypal">PayPal</option>
                <option value="transferencia">Transferencia</option>
                <option value="otro">Otro</option>
              </select>
            </div>
            <button type="submit" className="btn btn-yellow w-100" disabled={ocupado}>
              {ocupado ? 'Procesando…' : 'Registrar pago'}
            </button>
          </form>
          <br />
          <button
            className="btn btn-yellow w-100"
            onClick={manejarCancelar}
            disabled={ocupado}
          >
            ❌ Cancelar reserva
          </button>
        </>
      )}
    </div>
  );
}