import { useState, useEffect } from 'react';
import axios from 'axios';

export default function PanelSuperadmin() {
    const [listaUsuarios, setListaUsuarios] = useState([]);
    const [listaRoles, setListaRoles] = useState([]);
    const [mensajeError, setMensajeError] = useState('');

    useEffect(() => {
        axios.get('/roles')
            .then(res => setListaRoles(res.data))
            .catch(() => setMensajeError('Error cargando roles'));

        axios.get('/usuarios')
            .then(res => setListaUsuarios(res.data))
            .catch(() => setMensajeError('Error cargando usuarios'));
    }, []);

    const cambiarCampo = (id, campo, valor) => {
        setListaUsuarios(usuarios =>
            usuarios.map(u => u.id === id ? { ...u, [campo]: valor } : u)
        );
    };

    const guardarUsuario = async (usuario) => {
        try {
            await axios.put(`/usuarios/${usuario.id}`, {
                id_rol: usuario.id_rol,
                estado: usuario.estado
            });
        } catch (err) {
            alert('Falló al guardar cambios.');
        }
    };

    return (
        <div className="container py-5">
            <h2 className="text-center text-warning mb-4">Panel Superadmin</h2>
            {mensajeError && (
                <div className="alert alert-danger text-center">{mensajeError}</div>
            )}
            <div className="table-responsive">
                <table className="table table-striped table-bordered">
                    <thead className="table-dark">
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Email</th>
                            <th>Rol</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {listaUsuarios.map(u => (
                            <tr key={u.id}>
                                <td>{u.id}</td>
                                <td>{u.nombre}</td>
                                <td>{u.correo_electronico}</td>
                                <td>
                                    <select
                                        className="form-select form-select-sm"
                                        value={u.id_rol}
                                        onChange={e => cambiarCampo(u.id, 'id_rol', Number(e.target.value))}
                                    >
                                        {listaRoles.map(r => (
                                            <option key={r.id} value={r.id}>
                                                {r.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                                <td>
                                    <select
                                        className="form-select form-select-sm"
                                        value={u.estado}
                                        onChange={e => cambiarCampo(u.id, 'estado', Number(e.target.value))}
                                    >
                                        <option value={1}>Activo</option>
                                        <option value={0}>Inactivo</option>
                                    </select>
                                </td>
                                <td>
                                    <button
                                        className="btn btn-outline-secondary w-100"
                                        onClick={() => guardarUsuario(u)}
                                    >
                                        Guardar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
