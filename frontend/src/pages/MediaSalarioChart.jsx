import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Chart from 'chart.js/auto';

const MediaSalarioChart = () => {
    const nominaRef = useRef(null);
    const horasRef = useRef(null);
    const chartNomina = useRef(null);
    const chartHoras = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            const res = await fetch('http://localhost:4000/graphql', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: `
                        query {
                          obtenerEmpleados {
                            tipo
                            salarioBase
                            pagoPorHora
                          }
                        }
                    `
                })
            });

            const { data } = await res.json();
            const emps = data.obtenerEmpleados || [];

            // Calcula medias
            const asalariados = emps.filter(e => e.tipo === 'asalariado' && e.salarioBase != null).map(e => e.salarioBase);
            const porHoras = emps.filter(e => e.tipo === 'por_horas' && e.pagoPorHora != null).map(e => e.pagoPorHora);

            const avgSalario = asalariados.length ? asalariados.reduce((a, b) => a + b, 0) / asalariados.length : 0;
            const avgPorHora = porHoras.length ? porHoras.reduce((a, b) => a + b, 0) / porHoras.length : 0;

            // Gráfica Asalariados
            if (chartNomina.current) chartNomina.current.destroy();
            const ctxNomina = nominaRef.current.getContext('2d');
            chartNomina.current = new Chart(ctxNomina, {
                type: 'bar',
                data: {
                    labels: ['Salario medio (nómina)'],
                    datasets: [{
                        label: '€',
                        data: [avgSalario.toFixed(2)],
                        backgroundColor: 'rgba(255,165,0,0.6)',
                        borderColor: 'orange',
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 7000
                        }
                    },
                    plugins: { legend: { display: false } }
                }
            });

            // Gráfica Por Horas
            if (chartHoras.current) chartHoras.current.destroy();
            const ctxHoras = horasRef.current.getContext('2d');
            chartHoras.current = new Chart(ctxHoras, {
                type: 'bar',
                data: {
                    labels: ['Salario medio (horas)'],
                    datasets: [{
                        label: '€',
                        data: [avgPorHora.toFixed(2)],
                        backgroundColor: 'rgba(54,162,235,0.6)',
                        borderColor: 'blue',
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 30
                        }
                    },
                    plugins: { legend: { display: false } }
                }
            });
        };

        fetchData();
        return () => {
            if (chartNomina.current) chartNomina.current.destroy();
            if (chartHoras.current) chartHoras.current.destroy();
        };
    }, []);

    return (
        <div style={{
            maxWidth: '600px',
            margin: '2rem auto',
            padding: '1rem',
            background: '#fff',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
            <button
                onClick={() => navigate(-1)}
                style={{
                    marginBottom: '1rem',
                    padding: '0.5rem 1rem',
                    fontSize: '0.9rem',
                    borderRadius: '4px',
                    border: 'none',
                    background: '#333',
                    color: '#fff',
                    cursor: 'pointer'
                }}
            >
                ⬅ Volver
            </button>

            <h3>📊 Salario Medio de Asalariados</h3>
            <canvas ref={nominaRef} />

            <h3 style={{ marginTop: '2rem' }}>📊 Salario Medio de Empleados por Hora</h3>
            <canvas ref={horasRef} />
        </div>
    );
};

export default MediaSalarioChart;
