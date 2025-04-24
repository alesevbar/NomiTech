require('dotenv').config();
const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers');
const {
  ApolloServerPluginLandingPageGraphQLPlayground
} = require('apollo-server-core');

const app = express();

/* ─── 1. CORS global (origins abiertos para depurar) ─── */
app.use(cors({ origin: 'https://nomitech-frontend.onrender.com' }));
app.use(express.json());

/* ─── 2. Logger: muestra método, url y body ─── */
app.use('/graphql', (req, res, next) => {
  console.log('📩  ', req.method, req.originalUrl);
  if (req.body) console.dir(req.body, { depth: null });
  next();
});

/* ─── Estáticos opcionales ─── */
app.use(express.static(path.join(__dirname, 'public')));

/* ─── MongoDB ─── */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Conectado a MongoDB'))
  .catch(err => console.error('❌ Error conectando a MongoDB:', err));

/* ─── Apollo ─── */
async function startServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    introspection: true,
    formatError: (err) => {
      console.error('🚨 GraphQL error:', err.message);
      return err;
    },
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
