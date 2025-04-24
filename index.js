require('dotenv').config();
const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers');
const {
  ApolloServerPluginLandingPageGraphQLPlayground
} = require('apollo-server-core');

const app = express();

/* ──────────  Habilitar CORS para todo  ────────── */
app.use(
  cors({
    origin: 'https://nomitech-frontend.onrender.com',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

/* ──────────  Servir estáticos (opcional)  ────────── */
app.use(express.static(path.join(__dirname, 'public')));

/* ──────────  Conexión MongoDB  ────────── */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Conectado a MongoDB'))
  .catch(err => console.error('❌ Error conectando a MongoDB:', err));

/* ──────────  Apollo Server  ────────── */
async function startServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    introspection: true,
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground()]
  });

  await server.start();
  server.applyMiddleware({ app, path: '/graphql' });

  const port = process.env.PORT || 4000;
  app.listen(port, () =>
    console.log(`🚀 Servidor en http://localhost:${port}${server.graphqlPath}`)
  );
}

startServer();
