import { useState, useEffect, useMemo } from 'react';

export default function BuscadorPisos({ pisos = [], loading = false, extra = null, renderCard }) {
  const [busqueda, setBusqueda] = useState('');
  const [comunidadSeleccionada, setComunidadSeleccionada] = useState('');
  const [provinciaSeleccionada, setProvinciaSeleccionada] = useState('');
  const [municipioSeleccionado, setMunicipioSeleccionado] = useState('');
  const [filtrados, setFiltrados] = useState(pisos);

  const comunidades = useMemo(
    () => Array.from(new Set(pisos.map(p => p.comunidad))).sort(),
    [pisos]
  );
  const provincias = useMemo(() => {
    const fuente = comunidadSeleccionada ? pisos.filter(p => p.comunidad === comunidadSeleccionada) : pisos;
    return Array.from(new Set(fuente.map(p => p.provincia))).sort();
  }, [pisos, comunidadSeleccionada]);
  const municipios = useMemo(() => {
    let fuente = pisos;
    if (comunidadSeleccionada) fuente = fuente.filter(p => p.comunidad === comunidadSeleccionada);
    if (provinciaSeleccionada) fuente = fuente.filter(p => p.provincia === provinciaSeleccionada);
    return Array.from(new Set(fuente.map(p => p.municipio))).sort();
  }, [pisos, comunidadSeleccionada, provinciaSeleccionada]);

  useEffect(() => {
    const q = busqueda.trim().toLowerCase();
    setFiltrados(
      pisos.filter(p => {
        const coincideTexto = !q ||
          [p.titulo, p.descripcion, p.provincia, p.municipio, p.comunidad]
            .some(v => (v || '').toLowerCase().includes(q));
        const coincideCom = !comunidadSeleccionada || p.comunidad === comunidadSeleccionada;
        const coincideProv = !provinciaSeleccionada || p.provincia === provinciaSeleccionada;
        const coincideMun = !municipioSeleccionado || p.municipio === municipioSeleccionado;
        return coincideTexto && coincideCom && coincideProv && coincideMun;
      })
    );
  }, [pisos, busqueda, comunidadSeleccionada, provinciaSeleccionada, municipioSeleccionado]);

  return (
    <>
      <div className="row g-2 mb-3">
        <div className="col-md-3">
          <select
            className="form-select"
            value={comunidadSeleccionada}
            onChange={e => {
              setComunidadSeleccionada(e.target.value);
              setProvinciaSeleccionada('');
              setMunicipioSeleccionado('');
            }}
          >
            <option value="">Todas las comunidades</option>
            {comunidades.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={provinciaSeleccionada}
            onChange={e => {
              setProvinciaSeleccionada(e.target.value);
              setMunicipioSeleccionado('');
            }}
            disabled={!comunidadSeleccionada}
          >
            <option value="">Todas las provincias</option>
            {provincias.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={municipioSeleccionado}
            onChange={e => setMunicipioSeleccionado(e.target.value)}
            disabled={!provinciaSeleccionada}
          >
            <option value="">Todos los municipios</option>
            {municipios.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
        <div className="col-md-3">
          <input
            type="text"
            className="form-control"
            placeholder="Buscar por título, descripción, ubicación…"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      {extra}

      <div className="row g-4">
        {loading && (
          <div className="col-12">
            <div className="alert alert-info text-center">Cargando pisos…</div>
          </div>
        )}
        {!loading && filtrados.length === 0 && (
          <div className="col-12">
            <div className="alert alert-warning text-center">
              No hay resultados.
            </div>
          </div>
        )}
        {filtrados.map(piso => (
          <div className="col-md-4" key={piso.id}>
            {renderCard(piso)}
          </div>
        ))}
      </div>
    </>
  );
}
