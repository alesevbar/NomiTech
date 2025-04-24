const mongoose = require('mongoose');

const VacacionesSchema = new mongoose.Schema({
  empleadoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Empleado' },
  fechaInicio: Date,
  fechaFin: Date
});

module.exports = mongoose.model('Vacaciones', VacacionesSchema);
