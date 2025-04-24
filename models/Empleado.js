const mongoose = require('mongoose');

const historialLaboralSchema = new mongoose.Schema({
  desde: Date,
  hasta: Date,
  tipo: { type: String, enum: ["asalariado", "por_horas"] },
  salarioBase: Number,
  pagoPorHora: Number
}, { timestamps: true });

const EmpleadoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    validate: {
      validator: v => /^[A-Za-zÁÉÍÓÚáéíóúÜüÑñ]+\s[A-Za-zÁÉÍÓÚáéíóúÜüÑñ]+/.test(v),
      message: "Debe tener nombre y apellido."
    }
  },
  tipo: { type: String, enum: ["asalariado", "por_horas"], required: true },
  salarioBase: { type: Number, default: null },
  pagoPorHora: { type: Number, default: null },
  vacaciones: { type: Number, min: 0, max: 60, required: true },
  historialLaboral: [historialLaboralSchema],
  extras: { type: mongoose.Schema.Types.Mixed, default: {} }
});

module.exports = mongoose.model('Empleado', EmpleadoSchema);
