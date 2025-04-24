import React, { useState } from 'react';
import { Routes, Route, useNavigate, Link } from 'react-router-dom';  // <-- Importa Link
import EmpleadoList from './components/EmpleadoList';
import NuevoEmpleado from './components/NuevoEmpleado';
import FichaEmpleado from './pages/FichaEmpleado';
import MediaSalarioChart from './pages/MediaSalarioChart';
import logo from './assets/logo.png';

import './App.css';

export default function App() {
  const [refresh, setRefresh] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="app-wrapper">
      <div className="logo-container">
        <Link to="/">
          <img src={logo} alt="NomiTech Logo" className="logo-img" />
        </Link>
      </div>


      <Routes>
        <Route
          path="/"
          element={
            <>
              <EmpleadoList refresh={refresh} />
            </>
          }
        />
        <Route
          path="/nuevo"
          element={
            <div className="form-view">
              <button className="btn-volver" onClick={() => navigate('/')}>
                ⬅ Volver
              </button>
              <NuevoEmpleado
                onCreado={() => {
                  setRefresh(!refresh);
                  navigate('/');
                }}
              />
            </div>
          }
        />
        <Route path="/empleado/:id" element={<FichaEmpleado />} />
        <Route
          path="/estadisticas"
          element={<MediaSalarioChart />}
        />
      </Routes>
    </div>
  );
}
