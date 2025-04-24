require('dotenv').config();
const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers');
const { ApolloServerPluginLandingPageGraphQLPlayground } = require('apollo-server-core');

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sistema_nomina')
  .then(() => console.log('✅ Conectado a MongoDB'))
  .catch(err => console.error('❌ Error conectando a MongoDB:', err));

async function startServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground()]
  });

  await server.start();
  server.applyMiddleware({ app });

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`🚀 Servidor en http://localhost:${PORT}${server.graphqlPath}`);
  });
}

startServer();
