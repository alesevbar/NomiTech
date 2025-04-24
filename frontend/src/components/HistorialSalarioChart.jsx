import React, { useEffect, useState, useRef } from 'react';
import Chart from 'chart.js/auto';
import './HistorialSalarioChart.css';

const HistorialSalarioChart = ({ empleadoId }) => {
    const [sinDatos, setSinDatos] = useState(false);
    const [tipoEmpleado, setTipoEmpleado] = useState('asalariado');
    const canvasRef = useRef(null);
    const chartRef = useRef(null);

    useEffect(() => {
        if (!empleadoId) return;

        const obtenerHistorial = async () => {
            const res = await fetch('http://localhost:4000/graphql', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: `
            query {
              obtenerEmpleados { id tipo }
              verHistorial(id: "${empleadoId}") {
                desde
                salarioBase
                pagoPorHora
                updatedAt
              }
            }
          `
                })
            });
            const { data } = await res.json();
            console.log("Data recibida:", data);
            const tipo = data.obtenerEmpleados.find(e => e.id === empleadoId)?.tipo || 'asalariado';
            setTipoEmpleado(tipo);
            const key = tipo === 'asalariado' ? 'salarioBase' : 'pagoPorHora';
            const historial = (data.verHistorial || []).filter(h => h[key] != null);

            if (historial.length === 0) {
                setSinDatos(true);
                return;
            }
            setSinDatos(false);

            const labels = historial.map(({ updatedAt }) => {
                const d = new Date(updatedAt);
                if (isNaN(d)) return '—';
                const dd = String(d.getDate()).padStart(2, '0');
                const mm = String(d.getMonth() + 1).padStart(2, '0');
                const yyyy = d.getFullYear();
                const hh = String(d.getHours()).padStart(2, '0');
                const min = String(d.getMinutes()).padStart(2, '0');
                return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
            });


            const datapoints = historial.map(h => h[key]);

            if (chartRef.current) chartRef.current.destroy();
            const ctx = canvasRef.current.getContext('2d');
            chartRef.current = new Chart(ctx, {
                type: 'line',
                data: {
                    labels,
                    datasets: [{
                        label: tipo === 'asalariado' ? 'Salario Base' : 'Pago por Hora',
                        data: datapoints,
                        borderColor: '#4CAF50',
                        backgroundColor: 'rgba(76,175,80,0.2)',
                        pointRadius: 4,
                        pointBackgroundColor: '#388E3C',
                        borderWidth: 3,
                        tension: 0.3,
                        fill: true
                    }]
                },
                options: {
                    maintainAspectRatio: false,
                    layout: { padding: 20 },
                    plugins: {
                        legend: {
                            labels: {
                                color: '#333',
                                font: { size: 14 }
                            }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0,0,0,0.7)',
                            titleColor: '#fff',
                            bodyColor: '#fff',
                            padding: 8,
                            cornerRadius: 4
                        }
                    },
                    scales: {

                        y: {
                            grid: { color: '#eee' },
                            ticks: {
                                color: '#555',
                                font: { size: 12 },
                                callback: value => value.toLocaleString()
                            }
                        }
                    }
                }
            });
        };

        obtenerHistorial();
    }, [empleadoId]);

    return (
        <div className="historial-chart-container">
            <h3>
                📈 {tipoEmpleado === 'asalariado'
                    ? 'Evolución Salarial'
                    : 'Evolución del Pago por Hora'}
            </h3>
            {sinDatos ? (
                <p className="no-data">
                    Este empleado aún no tiene historial registrado.
                </p>
            ) : (
                <div className="chart-wrapper">
                    <canvas ref={canvasRef} />
                </div>
            )}
        </div>
    );
};

export default HistorialSalarioChart;
