require('dotenv').config();
const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const mongoose = require('mongoose');
const path = require('path');
const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers');
const { ApolloServerPluginLandingPageGraphQLPlayground } = require('apollo-server-core');
const { corsMiddleware, corsOptionsHandler } = require('./corsMiddleware');

const app = express();

// ✅ CORS y OPTIONS
app.use(corsMiddleware);
app.options('*', corsOptionsHandler);

app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sistema_nomina')
  .then(() => console.log('✅ Conectado a MongoDB'))
  .catch(err => console.error('❌ Error conectando a MongoDB:', err));

async function startServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
    persistedQueries: false  // Desactiva advertencia Apollo
  });

  await server.start();
  server.applyMiddleware({ app, path: '/graphql' });

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`🚀 Servidor en http://localhost:${PORT}${server.graphqlPath}`);
  });
}

startServer();
