require('dotenv').config();
const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const mongoose = require('mongoose');
const path = require('path');
const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers');
const { ApolloServerPluginLandingPageGraphQLPlayground } = require('apollo-server-core');

const app = express();

/* ───── Estáticos opcionales ───── */
app.use(express.static(path.join(__dirname, 'public')));

/* ───── MongoDB ───── */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Conectado a MongoDB'))
  .catch(err => console.error('❌ Error conectando a MongoDB:', err));

/* ───── Apollo  ───── */
async function startServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    introspection: true,
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground()]
  });

  await server.start();


  server.applyMiddleware({
    app,
    path: '/graphql',
    cors: {
      origin: 'https://nomitech-frontend.onrender.com',
      methods: ['GET', 'POST', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }
  });

  const port = process.env.PORT || 4000;
  app.listen(port, () =>
    console.log(`🚀 Servidor en http://localhost:${port}${server.graphqlPath}`)
  );
}

startServer();
