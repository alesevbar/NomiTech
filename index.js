require('dotenv').config();
const express = require('express');
const cors = require('cors');                     // ← falta esta
const { ApolloServer } = require('apollo-server-express');
const mongoose = require('mongoose');
const path = require('path');
const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers');
const { ApolloServerPluginLandingPageGraphQLPlayground } = require('apollo-server-core');
const { corsOptions, corsMiddleware } = require('./corsMiddleware');

const app = express();                                // ← falta esta

/* CORS */
app.use(corsMiddleware);                 // CORS normal
app.options('/graphql', cors(corsOptions)); // pre-flight /graphql

app.use(express.static(path.join(__dirname, 'public')));

/* Mongo */
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sistema_nomina')
  .then(() => console.log('✅ Conectado a MongoDB'))
  .catch(err => console.error('❌ Error conectando a MongoDB:', err));

async function startServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
    persistedQueries: false
  });

  await server.start();
  server.applyMiddleware({
    app,
    path: '/graphql',
    cors: corsOptions            // la clave
  });

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () =>
    console.log(`🚀 Servidor en http://localhost:${PORT}${server.graphqlPath}`));
}

startServer();
