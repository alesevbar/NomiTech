import React, { useState } from 'react';
import './NuevoEmpleado.css';

const NuevoEmpleado = ({ onCreado }) => {
    const [nombre, setNombre] = useState('');
    const [tipo, setTipo] = useState('asalariado');
    const [salarioBase, setSalarioBase] = useState('');
    const [pagoPorHora, setPagoPorHora] = useState('');
    const [vacaciones, setVacaciones] = useState('');
    const [extras, setExtras] = useState([]);
    const [errores, setErrores] = useState({});
    const API = import.meta.env.VITE_API_URL

    const añadirExtra = () => setExtras([...extras, { clave: '', valor: '' }]);
    const actualizarExtra = (i, c, v) =>
        setExtras(extras.map((ex, idx) => idx === i ? { ...ex, [c]: v } : ex));
    const eliminarExtra = i =>
        setExtras(extras.filter((_, idx) => idx !== i));

    const handleSubmit = async (e) => {
        e.preventDefault();
        const nuevos = {};

        // — Validaciones —
        // Nombre y apellidos
        const partes = nombre.trim().split(/\s+/);
        if (!nombre.trim()) {
            nuevos.nombre = "Este campo es obligatorio";
        } else if (partes.length < 2) {
            nuevos.nombre = "Debe incluir al menos nombre y apellido.";
        } else if (!partes.every(p => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+$/.test(p))) {
            nuevos.nombre = "Solo letras en nombre y apellido.";
        }

        // Salario base / pago por hora
        if (tipo === 'asalariado') {
            if (!salarioBase) {
                nuevos.salarioBase = "Este campo es obligatorio";
            } else {
                const n = parseFloat(salarioBase.replace(',', '.'));
                if (isNaN(n) || n < 0) {
                    nuevos.salarioBase = "El salario base debe ser un número positivo.";
                }
            }
        } else {
            if (!pagoPorHora) {
                nuevos.pagoPorHora = "Este campo es obligatorio";
            } else {
                const n = parseFloat(pagoPorHora.replace(',', '.'));
                if (isNaN(n) || n < 0) {
                    nuevos.pagoPorHora = "El pago por hora debe ser un número positivo.";
                }
            }
        }

        // Vacaciones
        if (!vacaciones) {
            nuevos.vacaciones = "Este campo es obligatorio";
        } else {
            const v = parseInt(vacaciones, 10);
            if (isNaN(v) || v < 0 || v > 60) {
                nuevos.vacaciones = "Las vacaciones deben ser un número entero entre 0 y 60.";
            }
        }

        if (Object.keys(nuevos).length) {
            setErrores(nuevos);
            return;
        }
        setErrores({});

        const input = {
            nombre,
            tipo,
            vacaciones: parseInt(vacaciones, 10),
            ...(tipo === 'asalariado'
                ? { salarioBase: parseFloat(salarioBase.replace(',', '.')) }
                : { pagoPorHora: parseFloat(pagoPorHora.replace(',', '.')) }
            ),
            extras: extras.reduce((acc, { clave, valor }) => {
                if (clave.trim()) acc[clave.trim()] = valor;
                return acc;
            }, {})

        };

        const mutation = `
    mutation CrearEmpleado($input: EmpleadoInput!) {
      crearEmpleado(input: $input) {
        id
        nombre
        extras
      }
    }
  `;

        try {
            console.log('URL llamada:', `${API}/graphql`);
            const bodyData = JSON.stringify({
                query: mutation,
                variables: { input, extras: input.extras }
            });
            console.log('Body enviado:', bodyData);

            const res = await fetch(`${API}/graphql`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: bodyData
            });

            const { data, errors } = await res.json();

            if (errors) {
                console.error(errors);
                alert('❌ Error creando empleado');
                return;
            }

            alert('✅ Empleado creado con éxito');
            onCreado?.();
            setNombre('');
            setTipo('asalariado');
            setSalarioBase('');
            setPagoPorHora('');
            setVacaciones('');
            setExtras([]);
        } catch (err) {
            console.error(err);
            alert('❌ Error de red al crear empleado');
        }
    };


    return (
        <div className="nuevo-empleado-container">
            <h3 className="heading">➕ Nuevo Empleado</h3>
            <form noValidate onSubmit={handleSubmit} className="form-nuevo">
                <div className="form-group">
                    <label className="input-label">Nombre y Apellidos:</label>
                    <input
                        type="text"
                        className={`input-field ${errores.nombre ? 'input-error' : ''}`}
                        placeholder="Nombre y Apellidos"
                        value={nombre}
                        onChange={e => setNombre(e.target.value)}
                    />
                    {errores.nombre && <p className="error-msg">{errores.nombre}</p>}
                </div>

                <div className="form-group">
                    <label className="input-label">Tipo de contrato:</label>
                    <select
                        className="input-field"
                        value={tipo}
                        onChange={e => setTipo(e.target.value)}
                    >
                        <option value="asalariado">Asalariado</option>
                        <option value="por_horas">Por horas</option>
                    </select>
                </div>

                <div className="form-group">
                    <label className="input-label">
                        {tipo === 'asalariado' ? 'Salario Base:' : 'Pago por Hora:'}
                    </label>
                    <input
                        type="text"
                        inputMode="decimal"
                        pattern="[0-9]+([,\.][0-9]{1,2})?"
                        className={`input-field ${tipo === 'asalariado'
                            ? (errores.salarioBase ? 'input-error' : '')
                            : (errores.pagoPorHora ? 'input-error' : '')
                            }`}
                        placeholder="547,45 EUR"
                        value={tipo === 'asalariado' ? salarioBase : pagoPorHora}
                        onChange={e => {
                            const v = e.target.value;
                            tipo === 'asalariado'
                                ? setSalarioBase(v)
                                : setPagoPorHora(v);
                        }}
                    />

                    {tipo === 'asalariado' && errores.salarioBase && (
                        <p className="error-msg">{errores.salarioBase}</p>
                    )}
                    {tipo !== 'asalariado' && errores.pagoPorHora && (
                        <p className="error-msg">{errores.pagoPorHora}</p>
                    )}
                </div>

                <div className="form-group">
                    <label className="input-label">Vacaciones (días):</label>
                    <input
                        type="number"
                        className={`input-field ${errores.vacaciones ? 'input-error' : ''}`}
                        placeholder="Vacaciones (días)"
                        value={vacaciones}
                        onChange={e => setVacaciones(e.target.value)}
                    />
                    {errores.vacaciones && <p className="error-msg">{errores.vacaciones}</p>}
                </div>

                <div className="extras-section">
                    <h4 className="subheading">🔧 Extras</h4>
                    {extras.map((ex, i) => (
                        <div key={i} className="extra-pair">
                            <input
                                type="text"
                                className="input-field extra-input"
                                placeholder="Ej: País"
                                value={ex.clave}
                                onChange={e => actualizarExtra(i, 'clave', e.target.value)}
                            />
                            <input
                                type="text"
                                className="input-field extra-input"
                                placeholder="Ej: España"
                                value={ex.valor}
                                onChange={e => actualizarExtra(i, 'valor', e.target.value)}
                            />
                            <button
                                type="button"
                                className="btn-remove"
                                onClick={() => eliminarExtra(i)}
                            >
                                ×
                            </button>
                        </div>
                    ))}
                    <button type="button" className="btn-add" onClick={añadirExtra}>
                        ➕ Añadir extra
                    </button>
                </div>

                <button type="submit" className="btn-create">Crear</button>
            </form>
        </div>
    );
};

export default NuevoEmpleado;
