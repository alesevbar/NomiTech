const { gql } = require('apollo-server-express');
const GraphQLJSON = require('graphql-type-json');

module.exports = gql`
  scalar JSON
  scalar Date

  type Empleado {
    _id: ID!
    id: ID
    nombre: String
    tipo: String
    salarioBase: Float
    pagoPorHora: Float
    vacaciones: Int
    historialLaboral: [HistorialLaboral]
    extras: JSON
  }

  type HistorialLaboral {
    desde: Date
    hasta: Date
    tipo: String
    salarioBase: Float
    pagoPorHora: Float
    updatedAt: Date
  }

  type Vacaciones {
    _id: ID
    empleadoId: ID
    fechaInicio: Date
    fechaFin: Date
  }

  input EmpleadoInput {
    nombre: String!
    tipo: String!
    salarioBase: Float
    pagoPorHora: Float
    vacaciones: Int!
    extras: JSON
  }

  type Query {
    empleados: [Empleado]
    obtenerEmpleados: [Empleado]
    verHistorial(id: ID!): [HistorialLaboral]
    calcularPago(id: ID!): Float
  }

  type Mutation {
    crearEmpleado(input: EmpleadoInput): Empleado
    actualizarEmpleado(id: ID!, nombre: String, tipo: String, salarioBase: Float, pagoPorHora: Float, vacaciones: Int,
      extras: JSON
    ): Empleado
    eliminarEmpleado(id: ID!): String
  }
`;
