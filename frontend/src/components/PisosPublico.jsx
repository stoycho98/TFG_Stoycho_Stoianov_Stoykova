import { useState, useEffect } from 'react';
import axios from 'axios';
import BuscadorPisos from './BuscadorPisos';

export default function PisosPublico() {
  const [listaPisos, setListaPisos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    axios.get('/pisos')
      .then(res => setListaPisos(res.data))
      .catch(() => setListaPisos([]))
      .finally(() => setCargando(false));
  }, []);

  return (
    <BuscadorPisos
      pisos={listaPisos}
      loading={cargando}
      renderCard={piso => <PisoCardPublico piso={piso} />}
    />
  );
}

function PisoCardPublico({ piso }) {
  const [imagenes, setImagenes] = useState([]);
  const [imgActiva, setImgActiva] = useState(0);
  const [resenas, setResenas] = useState([]);
  const [cargandoResenas, setCargandoResenas] = useState(true);

  useEffect(() => {
    axios.get(`/pisos/${piso.id}/imagenes`)
      .then(res => { setImagenes(res.data); setImgActiva(0); })
      .catch(() => setImagenes([]));

    axios.get(`/resenas/piso/${piso.id}`)
      .then(res => setResenas(res.data))
      .catch(() => setResenas([]))
      .finally(() => setCargandoResenas(false));
  }, [piso.id]);

  const puntuacionMedia = resenas.length
    ? (resenas.reduce((sum, r) => sum + r.puntuacion, 0) / resenas.length).toFixed(1)
    : null;

  const construirUrlImagen = url =>
    /^https?:\/\//.test(url)
      ? url
      : `${axios.defaults.baseURL}/${url.replace(/^\/+/, '')}`;

  return (
    <div className="card h-100 shadow-sm">
      {imagenes.length > 0 ? (
        <img
          src={construirUrlImagen(imagenes[imgActiva].url_imagen)}
          className="card-img-top"
          alt={piso.titulo}
          style={{ objectFit: 'cover', height: '180px' }}
        />
      ) : (
        <div
          className="card-img-top d-flex align-items-center justify-content-center bg-secondary text-white"
          style={{ height: '180px' }}
        >
          Sin imagen
        </div>
      )}

      {imagenes.length > 1 && (
        <div className="d-flex flex-wrap justify-content-center gap-1 p-2">
          {imagenes.map((img, idx) => (
            <img
              key={img.id}
              src={construirUrlImagen(img.url_imagen)}
              alt={`Vista ${idx + 1}`}
              onClick={() => setImgActiva(idx)}
              className={`img-thumbnail ${idx === imgActiva ? 'border-warning' : ''}`}
              style={{ width: '60px', height: '60px', objectFit: 'cover', cursor: 'pointer' }}
            />
          ))}
        </div>
      )}

      <div className="card-body d-flex flex-column">
        <h5 className="card-title">{piso.titulo}</h5>
        {piso.descripcion && <p className="card-text">{piso.descripcion}</p>}
        <p className="mb-1">
          <strong>Dirección:</strong> {piso.direccion}, {piso.municipio}, {piso.provincia}, {piso.comunidad}
        </p>
        <p className="mb-1"><strong>Precio noche:</strong> {piso.precio} €</p>
        <p className="mb-3">
          {cargandoResenas
            ? 'Cargando reseñas…'
            : puntuacionMedia
              ? <span>⭐ {puntuacionMedia} ({resenas.length})</span>
              : <span className="text-muted">Sin reseñas</span>
          }
        </p>
      </div>
    </div>
  );
}
