# NomiTech

**NomiTech** es una aplicación para gestionar las nóminas de tus emplead y el historial salarial de empleados en pequeñas y medianas empresas. Permite crear, editar y visualizar empleados, ver su historial de salario o pago por hora.

## Índice

- [Descripción](#descripción)  
- [Tecnologías Utilizadas](#tecnologías-utilizadas)  
- [Instalación](#instalación)   
- [Ejecutar el proyecto](#ejecutar-el-proyecto)  

---

## Descripción

Este sistema de nómina centraliza la gestión de empleados, su tipo (asalariado o por horas), su salario base o pago por hora, y mantiene un historial temporal de cambios salariales. Además, expone una API GraphQL para consultar y mutar datos de manera eficiente.

---

## Tecnologías Utilizadas

- **Frontend**  
  - React 18 + Vite  
  - React Router v6  
  - Chart.js (para evolución salarial)  

- **Backend**  
  - Node.js 18  
  - Express  
  - Apollo Server (GraphQL)  
  - Mongoose (MongoDB ODM)  

- **Base de Datos**  
  - MongoDB (local o Atlas)  

- **Extras**  
  - `graphql-iso-date` y `graphql-type-json` (scalars personalizados)  
  - VSCode + ESLint + Prettier  

---

## Instalación

### Requisitos previos

Asegúrate de tener instalados los siguientes componentes:
- Node.js y npm
- Python 3
- MongoDB 

### Pasos de instalación

1. **Clonar el repositorio**
   ```sh
   git clone https://github.com/tu-usuario/NomiTech.git
   cd NomiTech
   ```
2. **Crear y activar entorno virtual**
    ```sh
    python -m venv venv
    venv/Scripts/activate
    Scripts/activate
    ```

3. **Instalar dependencias del backend y frontend**
   ```sh
   npm install
   cd frontend
   npm install
   ```

## Ejecutar el proyecto
   ```sh
   # Backend
   node index.js
   ```
   ```sh
   # Frontend
   cd frontend
   npm run dev
   ```
