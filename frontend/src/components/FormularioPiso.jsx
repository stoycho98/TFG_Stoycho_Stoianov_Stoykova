import { useState, useEffect } from 'react';
import axios from 'axios';

export default function FormularioPiso({ usuario, onPisoCreado }) {
  const [valorTitulo, setValorTitulo] = useState('');
  const [valorDireccion, setValorDireccion] = useState('');
  const [idComunidad, setIdComunidad] = useState('');
  const [idProvincia, setIdProvincia] = useState('');
  const [idMunicipio, setIdMunicipio] = useState('');
  const [valorPrecio, setValorPrecio] = useState('');
  const [valorMaximoHuespedes, setValorMaximoHuespedes] = useState('');
  const [mensaje, setMensaje] = useState('');

  const [listaComunidades, setListaComunidades] = useState([]);
  const [listaProvincias, setListaProvincias] = useState([]);
  const [listaMunicipios, setListaMunicipios] = useState([]);

  useEffect(() => {
    axios.get('/pisos/comunidades')
      .then(res => setListaComunidades(res.data))
      .catch(err => console.error('Error al cargar comunidades:', err));
  }, []);

  useEffect(() => {
    setListaProvincias([]);
    setIdProvincia('');
    setListaMunicipios([]);
    setIdMunicipio('');
    if (!idComunidad) return;

    axios.get(`/pisos/comunidades/${idComunidad}/provincias`)
      .then(res => setListaProvincias(res.data))
      .catch(err => console.error('Error al cargar provincias:', err));
  }, [idComunidad]);

  useEffect(() => {
    setListaMunicipios([]);
    setIdMunicipio('');
    if (!idProvincia) return;

    axios.get(`/pisos/provincias/${idProvincia}/municipios`)
      .then(res => setListaMunicipios(res.data))
      .catch(err => console.error('Error al cargar municipios:', err));
  }, [idProvincia]);

  const manejarEnvioPiso = async (e) => {
    e.preventDefault();
    setMensaje('');

    try {
      await axios.post('/pisos', {
        id_anfitrion: usuario.id,
        titulo: valorTitulo,
        descripcion: '',
        direccion: valorDireccion,
        provincia_id: idProvincia,
        municipio_id: idMunicipio,
        precio: Number(valorPrecio),
        maximo_huespedes: Number(valorMaximoHuespedes),
      });

      setMensaje('✅ Piso creado con éxito');
      onPisoCreado();

      setValorTitulo('');
      setValorDireccion('');
      setIdComunidad('');
      setIdProvincia('');
      setIdMunicipio('');
      setValorPrecio('');
      setValorMaximoHuespedes('');
    } catch (error) {
      console.error('Error al crear piso:', error);
      const msg = error.response?.data?.error || 'Error al crear piso. Inténtalo de nuevo.';
      setMensaje('❌ ' + msg);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center py-5">
      <div className="w-100" style={{ maxWidth: '500px' }}>
        <h2 className="mb-4 text-center text-warning">Crear nuevo piso</h2>

        <form onSubmit={manejarEnvioPiso} className="form-yellow-black rounded p-4 shadow-sm">
          <div className="mb-3">
            <label htmlFor="titulo" className="form-label">Título</label>
            <input
              type="text"
              id="titulo"
              className="form-control"
              placeholder="Ej. Ático céntrico con vistas"
              value={valorTitulo}
              onChange={e => setValorTitulo(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="direccion" className="form-label">Dirección</label>
            <input
              type="text"
              id="direccion"
              className="form-control"
              placeholder="Calle Falsa 123"
              value={valorDireccion}
              onChange={e => setValorDireccion(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="comunidadId" className="form-label">Comunidad Autónoma</label>
            <select
              id="comunidadId"
              className="form-select"
              value={idComunidad}
              onChange={e => setIdComunidad(e.target.value)}
              required
            >
              <option value="">-- Selecciona comunidad --</option>
              {listaComunidades.map(c => (
                <option key={c.comunidad_id} value={c.comunidad_id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label htmlFor="provinciaId" className="form-label">Provincia</label>
            <select
              id="provinciaId"
              className="form-select"
              value={idProvincia}
              onChange={e => setIdProvincia(e.target.value)}
              disabled={!listaProvincias.length}
              required
            >
              <option value="">-- Selecciona provincia --</option>
              {listaProvincias.map(p => (
                <option key={p.provincia_id} value={p.provincia_id}>
                  {p.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label htmlFor="municipioId" className="form-label">Municipio</label>
            <select
              id="municipioId"
              className="form-select"
              value={idMunicipio}
              onChange={e => setIdMunicipio(e.target.value)}
              disabled={!listaMunicipios.length}
              required
            >
              <option value="">-- Selecciona municipio --</option>
              {listaMunicipios.map(m => (
                <option key={m.municipio_id} value={m.municipio_id}>
                  {m.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label htmlFor="precio" className="form-label">Precio por noche (€)</label>
            <input
              type="number"
              id="precio"
              className="form-control"
              placeholder="50.00"
              step="0.01"
              value={valorPrecio}
              onChange={e => setValorPrecio(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="maximoHuespedes" className="form-label">Máximo de huéspedes</label>
            <input
              type="number"
              id="maximoHuespedes"
              className="form-control"
              placeholder="4"
              min="1"
              value={valorMaximoHuespedes}
              onChange={e => setValorMaximoHuespedes(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-yellow w-100">Crear Piso</button>
        </form>

        {mensaje && (
          <div className={`alert mt-3 ${mensaje.includes('✅') ? 'alert-success' : 'alert-danger'}`} role="alert">
            {mensaje}
          </div>
        )}
      </div>
    </div>
  );
}
