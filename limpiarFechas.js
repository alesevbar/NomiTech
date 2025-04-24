const mongoose = require('mongoose');
const Empleado = require('./models/Empleado');

mongoose.connect('mongodb://localhost:27017/sistema_nomina', { useNewUrlParser: true, useUnifiedTopology: true });

async function limpiarFechas() {
    const empleados = await Empleado.find();

    for (const empleado of empleados) {
        let modificado = false;

        empleado.historialLaboral.forEach(hist => {
            if (typeof hist.desde === 'number' && hist.desde > 999999999999) {
                hist.desde = new Date(hist.desde);
                modificado = true;
            }
            if (typeof hist.hasta === 'number' && hist.hasta !== null && hist.hasta > 999999999999) {
                hist.hasta = new Date(hist.hasta);
                modificado = true;
            }
            if (!hist.updatedAt || typeof hist.updatedAt === 'number') {
                hist.updatedAt = new Date();
                modificado = true;
            }
        });

        if (modificado) {
            await empleado.save();
            console.log(`Empleado ${empleado._id} actualizado.`);
        }
    }

    console.log('Fechas limpiadas!');
    mongoose.disconnect();
}

limpiarFechas();
