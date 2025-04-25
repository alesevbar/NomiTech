// index.js
require('dotenv').config();
const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const mongoose = require('mongoose');
const path = require('path');

const { corsOptions, corsMiddleware } = require('./corsMiddleware');
const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers');

const app = express();

// Aplica CORS **antes** de cualquier ruta
app.use(corsMiddleware);

// Monta estáticos si los tienes
app.use(express.static(path.join(__dirname, 'public')));

// Conecta a Mongo
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ Conectado a MongoDB'))
  .catch(err => console.error(err));

async function startServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ /* tu playground si quieres */],
    persistedQueries: false
  });
  await server.start();

  // IMPORTANTE: deshabilita CORS de Apollo porque ya lo tienes con express
  server.applyMiddleware({
    app,
    path: '/graphql',
    cors: false
  });

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () =>
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}${server.graphqlPath}`)
  );
}

startServer();
