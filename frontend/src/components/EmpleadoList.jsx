import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './EmpleadoList.css';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

const ITEMS_POR_PAGINA = 8;

const EmpleadoList = ({ refresh }) => {
    const [empleados, setEmpleados] = useState([]);
    const [pagina, setPagina] = useState(1);
    const [busqueda, setBusqueda] = useState('');
    const [filtroTipo, setFiltroTipo] = useState('');
    const [rangoSalario, setRangoSalario] = useState([0, 20000]);
    const [rangoPorHora, setRangoPorHora] = useState([0, 100]);
    const [rangoVacaciones, setRangoVacaciones] = useState([0, 60]);
    const navigate = useNavigate();

    useEffect(() => {

        const fetchEmpleados = async () => {
            const res = await fetch('http://localhost:4000/graphql', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: `
            query {
              obtenerEmpleados {
                id
                nombre
                tipo
                salarioBase
                pagoPorHora
                vacaciones
              }
            }
          `
                })
            });
            const { data } = await res.json();
            console.log("Empleados recibidos:", data.obtenerEmpleados);
            setEmpleados(data.obtenerEmpleados || []);
            setPagina(1);
        };
        fetchEmpleados();
    }, [refresh]);

    const eliminarEmpleado = async (id) => {
        if (!window.confirm('¿Eliminar este empleado?')) return;
        await fetch('http://localhost:4000/graphql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: `mutation { eliminarEmpleado(id: "${id}") }`
            })
        });
        setEmpleados(prev => prev.filter(e => e.id !== id));
    };

    const filtrados = empleados.filter(emp => {
        const coincideNombre = emp.nombre.toLowerCase().includes(busqueda.toLowerCase());
        const coincideTipo = filtroTipo ? emp.tipo === filtroTipo : true;

        let okSalario = true;
        if (filtroTipo === 'asalariado') {
            okSalario = emp.salarioBase >= rangoSalario[0] && emp.salarioBase <= rangoSalario[1];
        } else if (filtroTipo === 'por_horas') {
            okSalario = emp.pagoPorHora >= rangoPorHora[0] && emp.pagoPorHora <= rangoPorHora[1];
        }

        const okVacaciones = emp.vacaciones >= rangoVacaciones[0]
            && emp.vacaciones <= rangoVacaciones[1];

        return coincideNombre && coincideTipo && okSalario && okVacaciones;
    });

    const totalPaginas = Math.ceil(filtrados.length / ITEMS_POR_PAGINA);
    const inicio = (pagina - 1) * ITEMS_POR_PAGINA;
    const slice = filtrados.slice(inicio, inicio + ITEMS_POR_PAGINA);

    return (
        <div className="empleado-list-container">
            <div className="list-header">
                <h2>👥 Lista de Empleados</h2>
                <button className="btn-nuevo" onClick={() => navigate('/nuevo')}>
                    ➕ Crear Nuevo Empleado
                </button>
                <button
                    className="btn-nuevo"
                    onClick={() => navigate('/estadisticas')}
                >
                    📊 Ver media salario mensual empleados
                </button>
            </div>

            <div className="empleado-list-main">
                <div className="filtros-panel">
                    <h3>Filtros</h3>

                    <div className="filtros">
                        <input
                            type="text"
                            placeholder="Buscar por nombre…"
                            value={busqueda}
                            onChange={e => { setBusqueda(e.target.value); setPagina(1); }}
                        />
                        <select
                            value={filtroTipo}
                            onChange={e => { setFiltroTipo(e.target.value); setPagina(1); }}
                        >
                            <option value="">Todos los tipos de contrato</option>
                            <option value="asalariado">Empleado en nómina</option>
                            <option value="por_horas">Empleado por horas</option>
                        </select>
                    </div>

                    <div className="filtros-rango">
                        {filtroTipo === 'asalariado' && (
                            <>
                                <label>💰 Salario (€): {rangoSalario[0]}€ – {rangoSalario[1]}€</label>
                                <Slider
                                    range
                                    min={0}
                                    max={20000}
                                    step={100}
                                    value={rangoSalario}
                                    onChange={vals => { setRangoSalario(vals); setPagina(1); }}
                                />
                            </>
                        )}

                        {filtroTipo === 'por_horas' && (
                            <>
                                <label>⏱ Pago por hora (€): {rangoPorHora[0]}€ – {rangoPorHora[1]}€</label>
                                <Slider
                                    range
                                    min={0}
                                    max={100}
                                    step={0.5}
                                    value={rangoPorHora}
                                    onChange={vals => { setRangoPorHora(vals); setPagina(1); }}
                                />
                            </>
                        )}

                        <label>🌴 Vacaciones (días): {rangoVacaciones[0]} – {rangoVacaciones[1]}</label>
                        <Slider
                            range
                            min={0}
                            max={60}
                            step={1}
                            value={rangoVacaciones}
                            onChange={vals => { setRangoVacaciones(vals); setPagina(1); }}
                        />
                    </div>
                </div>

                <div className="empleado-list-content">
                    <ul className="empleado-list">
                        {slice.map(emp => (
                            <li key={emp.id}>
                                <span
                                    onClick={() => navigate(`/empleado/${emp.id}`)}
                                    style={{ flex: 1, cursor: 'pointer' }}
                                >
                                    {emp.nombre}
                                </span>
                                <button
                                    onClick={() => eliminarEmpleado(emp.id)}
                                    className="btn-eliminar-inline"
                                >
                                    🗑️
                                </button>
                            </li>
                        ))}
                        {slice.length === 0 && (
                            <li style={{ color: '#777', cursor: 'default' }}>
                                No hay empleados con ese criterio.
                            </li>
                        )}
                    </ul>

                    {totalPaginas > 1 && (
                        <div className="paginacion">
                            <button
                                onClick={() => setPagina(pagina - 1)}
                                disabled={pagina === 1}
                            >
                                Anterior
                            </button>
                            <span className="info-pagina">
                                Página {pagina} de {totalPaginas}
                            </span>
                            <button
                                onClick={() => setPagina(pagina + 1)}
                                disabled={pagina === totalPaginas}
                            >
                                Siguiente
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EmpleadoList;
