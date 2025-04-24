const { GraphQLDateTime } = require('graphql-iso-date');
const GraphQLJSON = require('graphql-type-json');
const Empleado = require('../models/Empleado');
const HorasTrabajadas = require('../models/HorasTrabajadas');
const Vacaciones = require('../models/Vacaciones');

const resolvers = {
    JSON: GraphQLJSON,
    Date: GraphQLDateTime,
    Query: {
        obtenerEmpleados: async () => await Empleado.find(),
        calcularPago: async (_, { id }) => {
            const empleado = await Empleado.findById(id);
            if (!empleado) throw new Error('Empleado no encontrado');
            if (empleado.tipo === 'asalariado') return empleado.salarioBase;
            const horas = await HorasTrabajadas.find({ empleadoId: id });
            return horas.reduce((total, h) => total + h.horas * empleado.pagoPorHora, 0);
        },
        verHistorial: async (_, { id }) => {
            const empleado = await Empleado.findById(id);
            return empleado?.historialLaboral || [];
        }
    },
    Mutation: {
        crearEmpleado: async (_, { input }) => {

            if (input.tipo === 'asalariado' && input.pagoPorHora != null) {
                throw new Error("Un asalariado no puede tener pagoPorHora.");
            }

            if (input.tipo === 'por_horas' && input.salarioBase != null) {
                throw new Error("Un empleado por horas no puede tener salarioBase.");
            }



            const nuevoEmpleado = new Empleado({
                ...input,
                extras: input.extras || {},
                historialLaboral: [
                    {
                        desde: new Date(),
                        hasta: null,
                        tipo: input.tipo,
                        salarioBase: input.tipo === 'asalariado' ? input.salarioBase : null,
                        pagoPorHora: input.tipo === 'por_horas' ? input.pagoPorHora : null,
                    }
                ]
            });

            return await nuevoEmpleado.save();
        },
        actualizarEmpleado: async (_, { id, extras, ...updates }) => {
            const empleado = await Empleado.findById(id);

            if (extras && typeof extras === 'object') {
                empleado.extras = extras;
            }

            if (!empleado) throw new Error('Empleado no encontrado');

            if (updates.tipo === 'asalariado' && (updates.pagoPorHora !== undefined && updates.pagoPorHora !== null)) {
                throw new Error("Un asalariado no puede tener pagoPorHora.");
            }
            if (updates.tipo === 'por_horas' && (updates.salarioBase !== undefined && updates.salarioBase !== null)) {
                throw new Error("Un empleado por horas no puede tener salarioBase.");
            }


            const cambioSalario =
                (updates.salarioBase !== undefined && updates.salarioBase !== empleado.salarioBase) ||
                (updates.pagoPorHora !== undefined && updates.pagoPorHora !== empleado.pagoPorHora) ||
                (updates.tipo && updates.tipo !== empleado.tipo);

            if (cambioSalario) {
                const ahora = new Date();
                if (empleado.historialLaboral.length > 0) {
                    empleado.historialLaboral[empleado.historialLaboral.length - 1].hasta = ahora;
                }
                empleado.historialLaboral.push({
                    desde: ahora,
                    hasta: null,
                    tipo: updates.tipo || empleado.tipo,
                    salarioBase: updates.salarioBase ?? empleado.salarioBase,
                    pagoPorHora: updates.pagoPorHora ?? empleado.pagoPorHora
                });
            }

            if (updates.tipo === 'asalariado') delete updates.pagoPorHora;
            if (updates.tipo === 'por_horas') delete updates.salarioBase;

            Object.assign(empleado, updates);


            return await empleado.save();
        },
        eliminarEmpleado: async (_, { id }) => {
            await Empleado.findByIdAndDelete(id);
            return 'Empleado eliminado correctamente.';
        }
    },
    Empleado: {
        id: empleado => empleado._id.toString()
    }
};

module.exports = resolvers;
