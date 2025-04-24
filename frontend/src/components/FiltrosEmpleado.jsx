import React from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

const FiltrosEmpleado = ({ busqueda, setBusqueda, filtroTipo, setFiltroTipo, rangoSalario, setRangoSalario, rangoVacaciones, setRangoVacaciones }) => {
    return (
        <div className="filtros-panel">
            <h3>Filtros</h3>

            <div className="filtros">
                <input
                    type="text"
                    placeholder="Buscar por nombre…"
                    value={busqueda}
                    onChange={e => setBusqueda(e.target.value)}
                />
                <select
                    value={filtroTipo}
                    onChange={e => setFiltroTipo(e.target.value)}
                >
                    <option value="">Todos los tipos</option>
                    <option value="asalariado">Asalariado</option>
                    <option value="por_horas">Por horas</option>
                </select>
            </div>

            <div className="filtros-rango">
                <label>💰 Salario (€): {rangoSalario[0]}€ – {rangoSalario[1]}€</label>
                <Slider
                    range
                    min={0}
                    max={10000}
                    step={100}
                    value={rangoSalario}
                    onChange={setRangoSalario}
                />

                <label>🌴 Vacaciones: {rangoVacaciones[0]} – {rangoVacaciones[1]} días</label>
                <Slider
                    range
                    min={0}
                    max={60}
                    step={1}
                    value={rangoVacaciones}
                    onChange={setRangoVacaciones}
                />
            </div>
        </div>
    );
};

export default FiltrosEmpleado;
