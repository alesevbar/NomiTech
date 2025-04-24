import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import HistorialSalarioChart from '../components/HistorialSalarioChart';
import '../components/FichaEmpleado.css';

const FichaEmpleado = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [empleado, setEmpleado] = useState(null);
    const [edit, setEdit] = useState(false);
    const [nuevaClave, setNuevaClave] = useState('');
    const API = import.meta.env.VITE_API_URL || 'http://localhost:4000/graphql';

    useEffect(() => {
        const fetchEmpleado = async () => {
            const res = await fetch(API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: `
            query ObtenerEmpleados {
              obtenerEmpleados {
                id
                nombre
                tipo
                salarioBase
                pagoPorHora
                vacaciones
                extras
              }
            }
          `
                })
            });
            const { data } = await res.json();
            setEmpleado(data.obtenerEmpleados.find(e => e.id === id));
            setEmpleado({
                ...found,
                extras: found.extras || {}
            });
        };
        fetchEmpleado();
    }, [id]);

    const handleSubmit = async e => {
        e.preventDefault();
        const input = {
            nombre: empleado.nombre,
            tipo: empleado.tipo,
            vacaciones: empleado.vacaciones,
            ...(empleado.tipo === 'asalariado'
                ? { salarioBase: empleado.salarioBase }
                : { pagoPorHora: empleado.pagoPorHora }
            ),
            extras: empleado.extras || {}
        };

        const mutation = `
      mutation ActualizarEmpleado(
        $id: ID!,
        $nombre: String!,
        $tipo: String!,
        $salarioBase: Float,
        $pagoPorHora: Float,
        $vacaciones: Int!,
        $extras: JSON
      ) {
        actualizarEmpleado(
          id: $id,
          nombre: $nombre,
          tipo: $tipo,
          salarioBase: $salarioBase,
          pagoPorHora: $pagoPorHora,
          vacaciones: $vacaciones,
          extras: $extras
        ) {
          id
          nombre
          tipo
          salarioBase
          pagoPorHora
          vacaciones
          extras
        }
      }
    `;
        const res = await fetch(API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: mutation,
                variables: {
                    id,
                    nombre: input.nombre,
                    tipo: input.tipo,
                    salarioBase: input.salarioBase,
                    pagoPorHora: input.pagoPorHora,
                    vacaciones: input.vacaciones,
                    extras: input.extras
                }
            })
        });
        const { data, errors } = await res.json();
        if (errors) {
            console.error(errors);
            return alert('❌ Error al guardar');
        }
        setEmpleado(data.actualizarEmpleado);
        setEdit(false);
        alert('✅ Cambios guardados');
    };

    const [showModal, setShowModal] = useState(false);
    const abrirModalExtra = () => setShowModal(true);

    const cerrarModalExtra = () => {
        setNuevaClave('');
        setShowModal(false);
    };

    const confirmarModalExtra = () => {
        const clave = nuevaClave.trim();
        if (clave) {
            setEmpleado({
                ...empleado,
                extras: {
                    ...empleado.extras,
                    [clave]: ''
                }
            });
        }
        cerrarModalExtra();
    };

    const handleDelete = async () => {
        if (window.confirm(`¿Estás seguro de que quieres eliminar a ${empleado.nombre}?`)) {
            const mutation = `
                mutation {
                    eliminarEmpleado(id: "${id}")
                }
            `;

            await fetch(API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: mutation })
            });

            alert("🗑️ Empleado eliminado correctamente");
            navigate('/');
        }
    };


    if (!empleado) return <p>Cargando ficha...</p>;

    return (
        <div className="ficha-container">
            <button onClick={() => navigate('/')} className="btn-back">
                ⬅ Volver
            </button>

            <div className="ficha-header-row">
                <h2 className="ficha-header">📄 Ficha de {empleado.nombre}</h2>
                {!edit && (
                    <div className="header-btns">
                        <button onClick={() => setEdit(true)} className="btn-edit">
                            ✏️ Editar
                        </button>
                        <button onClick={handleDelete} className="btn-delete">
                            🗑️ Eliminar
                        </button>
                    </div>
                )}
            </div>

            <div className="ficha-content">
                <div className="ficha-left">
                    {!edit ? (
                        <>
                            <p><strong>Nombre Completo:</strong> {empleado.nombre}</p>
                            <p>
                                <strong>Tipo de Contrato:</strong>{' '}
                                {empleado.tipo === 'asalariado' ? 'Nómina' : 'Por horas'}
                            </p>

                            <p>
                                <strong>Salario Mensual:</strong>{' '}
                                {empleado.tipo === 'asalariado'
                                    ? `${empleado.salarioBase} €`
                                    : `${empleado.pagoPorHora} €/h`}
                            </p>
                            <p>
                                <strong>Vacaciones:</strong> {empleado.vacaciones} días
                            </p>

                            {empleado.extras && Object.keys(empleado.extras).length > 0 && (
                                <>
                                    <h4>🔧 Campos extra</h4>
                                    {Object.entries(empleado.extras).map(([clave, valor]) => (
                                        <p key={clave}>
                                            <strong>{clave}:</strong> {valor}
                                        </p>
                                    ))}
                                </>
                            )}
                        </>
                    ) : (
                        <>
                            <form onSubmit={handleSubmit} className="form-edit">
                                <label>Nombre Completo:</label>
                                <input
                                    className="input-field"
                                    value={empleado.nombre}
                                    onChange={e => setEmpleado({ ...empleado, nombre: e.target.value })}
                                    required
                                />

                                <label>Tipo de Contrato:</label>
                                <select
                                    className="input-field"
                                    value={empleado.tipo}
                                    onChange={e => setEmpleado({ ...empleado, tipo: e.target.value })}
                                >
                                    <option value="asalariado">Nómina</option>
                                    <option value="por_horas">Por horas</option>
                                </select>

                                {empleado.tipo === 'asalariado' ? (
                                    <>
                                        <label>Salario Mensual:</label>
                                        <input
                                            type="number"
                                            className="input-field"
                                            value={empleado.salarioBase}
                                            onChange={e =>
                                                setEmpleado({ ...empleado, salarioBase: parseFloat(e.target.value) })
                                            }
                                            required
                                        />
                                    </>
                                ) : (
                                    <>
                                        <label>Pago por Hora:</label>
                                        <input
                                            type="number"
                                            className="input-field"
                                            value={empleado.pagoPorHora}
                                            onChange={e =>
                                                setEmpleado({ ...empleado, pagoPorHora: parseFloat(e.target.value) })
                                            }
                                            required
                                        />
                                    </>
                                )}

                                <label>Vacaciones (días):</label>
                                <input
                                    type="number"
                                    className="input-field"
                                    value={empleado.vacaciones}
                                    onChange={e =>
                                        setEmpleado({ ...empleado, vacaciones: parseInt(e.target.value, 10) })
                                    }
                                    required
                                />

                                {Object.entries(empleado.extras || {}).map(([key, value]) => (
                                    <div key={key} className="extra-field">
                                        <label className="extra-label">{key}:</label>
                                        <div className="extra-value-row">
                                            <input
                                                className="input-field"
                                                value={value}
                                                onChange={e =>
                                                    setEmpleado({
                                                        ...empleado,
                                                        extras: { ...empleado.extras, [key]: e.target.value }
                                                    })
                                                }
                                            />
                                            <button
                                                type="button"
                                                className="btn-remove-extra"
                                                onClick={() => {
                                                    const { [key]: _, ...rest } = empleado.extras;
                                                    setEmpleado({ ...empleado, extras: rest });
                                                }}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                <button type="button" className="btn-add-extra" onClick={abrirModalExtra}>
                                    ➕ Añadir campo extra
                                </button>

                                <button type="submit" className="btn-save">
                                    💾 Guardar cambios
                                </button>
                            </form>

                            {showModal && (
                                <div className="modal-overlay" onClick={cerrarModalExtra}>
                                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                                        <h3 className="modal-title">Nuevo campo extra</h3>
                                        <input
                                            type="text"
                                            className="input-field modal-input"
                                            placeholder="Ej. Departamento"
                                            value={nuevaClave}
                                            onChange={e => setNuevaClave(e.target.value)}
                                        />
                                        <div className="modal-actions">
                                            <button
                                                className="btn-modal btn-modal-secondary"
                                                onClick={cerrarModalExtra}
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                className="btn-modal btn-modal-primary"
                                                onClick={confirmarModalExtra}
                                            >
                                                Aceptar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div className="ficha-right">
                    <HistorialSalarioChart empleadoId={empleado.id} />
                </div>
            </div>
        </div>
    );


};

export default FichaEmpleado;
