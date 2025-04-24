const mongoose = require('mongoose');

const HorasTrabajadasSchema = new mongoose.Schema({
  empleadoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Empleado' },
  fecha: Date,
  horas: Number
});

module.exports = mongoose.model('HorasTrabajadas', HorasTrabajadasSchema);
