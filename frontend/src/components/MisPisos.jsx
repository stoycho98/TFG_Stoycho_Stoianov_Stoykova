import { useEffect, useState } from 'react';
import axios from 'axios';

export default function MisPisos({ pisos: pisosProp }) {
  const [listaPisos, setListaPisos] = useState(pisosProp);
  const [imagenesPorPiso, setImagenesPorPiso] = useState({});
  const [ingresosPorPiso, setIngresosPorPiso] = useState({});
  const [cargando, setCargando] = useState(true);

  const [pisoActivo, setPisoActivo] = useState(null);
  const [mostrarPopup, setMostrarPopup] = useState(false);

  const [archivo, setArchivo] = useState(null);
  const [subtitulo, setSubtitulo] = useState('');
  const [mensaje, setMensaje] = useState('');

  const API_BASE = axios.defaults.baseURL;

  useEffect(() => {
    setListaPisos(pisosProp);
  }, [pisosProp]);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const imagenesEntries = await Promise.all(
          listaPisos.map(async piso => {
            const { data } = await axios.get(`/pisos/${piso.id}/imagenes`);
            return [piso.id, data];
          })
        );
        setImagenesPorPiso(Object.fromEntries(imagenesEntries));

        const { data: ingresos } = await axios.get('/pagos/anfitrion/ingresos');
        const mapaIngresos = {};
        ingresos.forEach(row => {
          mapaIngresos[row.id_piso] = row.total_ganado;
        });
        setIngresosPorPiso(mapaIngresos);
      } catch (err) {
        console.error('Error al cargar datos:', err);
      } finally {
        setCargando(false);
      }
    };
    if (listaPisos.length) cargarDatos();
    else setCargando(false);
  }, [listaPisos]);

  const eliminarImagen = async (pisoId, imgId) => {
    try {
      await axios.delete(`/pisos/${pisoId}/imagenes/${imgId}`);
      setImagenesPorPiso(prev => ({
        ...prev,
        [pisoId]: prev[pisoId].filter(img => img.id !== imgId)
      }));
    } catch {
      alert('❌ No se pudo eliminar la imagen');
    }
  };

  const eliminarPiso = async (id) => {
    if (!window.confirm('¿Estás seguro de que quieres borrar este piso? Esta acción no se puede deshacer.')) return;
    try {
      await axios.delete(`/pisos/${id}`);
      setListaPisos(prev => prev.filter(piso => piso.id !== id));
      setMensaje('✅ Piso eliminado correctamente.');
    } catch (err) {
      setMensaje('❌ No se pudo eliminar el piso.');
    }
  };

  const abrirPopup = (pisoId) => {
    setPisoActivo(pisoId);
    setArchivo(null);
    setSubtitulo('');
    setMensaje('');
    setMostrarPopup(true);
  };

  const cerrarPopup = () => {
    setMostrarPopup(false);
    setPisoActivo(null);
    setArchivo(null);
    setSubtitulo('');
    setMensaje('');
  };

  const manejarEnvioImagen = async (e) => {
    e.preventDefault();
    setMensaje('');
    if (!archivo) {
      setMensaje('❌ Selecciona un archivo de imagen.');
      return;
    }
    const formData = new FormData();
    formData.append('imagen', archivo);
    formData.append('subtitulo', subtitulo);

    try {
      await axios.post(
        `/pisos/${pisoActivo}/imagenes`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      setMensaje('✅ Imagen subida correctamente.');
      setArchivo(null);
      setSubtitulo('');
      const { data } = await axios.get(`/pisos/${pisoActivo}/imagenes`);
      setImagenesPorPiso(prev => ({ ...prev, [pisoActivo]: data }));
      setTimeout(() => cerrarPopup(), 1200);
    } catch (err) {
      console.error('Error al subir imagen:', err);
      setMensaje('❌ Error al subir la imagen.');
    }
  };

  if (cargando) return <p>Cargando datos...</p>;

  return (
    <div className="container py-5">
      <h3 className="mb-4 text-warning">📂 Mis pisos publicados</h3>
      {listaPisos.length === 0 ? (
        <p className="text-center">No has publicado ningún piso aún.</p>
      ) : (
        <div className="row g-4">
          {listaPisos.map(piso => (
            <div key={piso.id} className="col-md-6">
              <div className="form-yellow-black rounded p-3 shadow-sm h-100">
                <div className="d-flex justify-content-between align-items-start">
                  <h5 className="text-warning">{piso.titulo}</h5>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    title="Eliminar piso"
                    onClick={() => eliminarPiso(piso.id)}
                  >
                    🗑️ Borrar piso
                  </button>
                </div>

                <p>
                  <strong>Ingresos:</strong> €{(ingresosPorPiso[piso.id] || 0).toFixed(2)}
                </p>
                <p>
                  {piso.direccion}, {piso.municipio}, {piso.provincia}, {piso.comunidad}
                  <br />
                  💶 {piso.precio} €/noche
                  <br />
                  🧍 Máx. huéspedes: {piso.maximo_huespedes}
                </p>
                <div className="d-flex flex-wrap gap-2 mb-3">
                  {(imagenesPorPiso[piso.id] || []).map(img => {
                    const src = img.url_imagen.startsWith('http')
                      ? img.url_imagen
                      : `${API_BASE}${img.url_imagen}`;
                    return (
                      <div key={img.id} className="position-relative">
                        <img
                          src={src}
                          alt={img.subtitulo || 'Imagen'}
                          className="img-fluid rounded"
                          style={{ maxWidth: '150px', height: 'auto' }}
                        />
                        {img.subtitulo && <p className="small mb-1">{img.subtitulo}</p>}
                        <button
                          onClick={() => eliminarImagen(piso.id, img.id)}
                          className="btn btn-sm btn-danger position-absolute top-0 end-0"
                          style={{ transform: 'translate(50%,-50%)' }}
                        >
                          🗑️
                        </button>
                      </div>
                    );
                  })}
                </div>
                <button
                  className="btn btn-yellow w-100"
                  onClick={() => abrirPopup(piso.id)}
                >
                  Subir imágenes
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {mensaje && (
        <div className={`alert mt-3 ${mensaje.includes('✅') ? 'alert-success' : 'alert-danger'}`} role="alert">
          {mensaje}
        </div>
      )}
      {mostrarPopup && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div className="modal fade show d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Subir imagen</h5>
                  <button type="button" className="btn-close" onClick={cerrarPopup} />
                </div>
                <form onSubmit={manejarEnvioImagen} className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="imagen-input" className="form-label">Imagen (archivo)</label>
                    <input
                      type="file"
                      id="imagen-input"
                      className="form-control"
                      accept="image/*"
                      onChange={e => setArchivo(e.target.files[0])}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="subtitulo-input" className="form-label">Subtítulo (opcional)</label>
                    <input
                      type="text"
                      id="subtitulo-input"
                      className="form-control"
                      placeholder="Ej: Vista al jardín"
                      value={subtitulo}
                      onChange={e => setSubtitulo(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="btn btn-yellow w-100">Subir imagen</button>
                  {mensaje && (
                    <div className={`alert mt-3 ${mensaje.includes('✅') ? 'alert-success' : 'alert-danger'}`} role="alert">
                      {mensaje}
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
