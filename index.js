require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const { ApolloServer } = require('apollo-server-express');
const {
  ApolloServerPluginLandingPageGraphQLPlayground
} = require('apollo-server-core');

const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers');

const app = express();

/* ───────────── 0. CORS para preflight de /graphql ───────────── */
app.options('*', cors());

/* ───────────── 1. Middleware global ───────────── */

app.use(cors());
app.use(express.json());

/* ───────────── 2. Logger de peticiones /graphql ───────────── */
app.use('/graphql', (req, _res, next) => {
  console.log('📩 ', req.method, req.originalUrl);
  if (req.body) console.dir(req.body, { depth: null });
  next();
});

/* ───────────── 3. Servir estáticos (opcional) ───────────── */
app.use(express.static(path.join(__dirname, 'public')));

/* ───────────── 4. Conexión MongoDB ───────────── */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Conectado a MongoDB'))
  .catch(err => console.error('❌ Error conectando a MongoDB:', err));

/* ───────────── 5. Apollo Server ───────────── */
async function startServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    introspection: true,
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
    formatError: (err) => {
      console.error('🚨 GraphQL error:', err.message);
      return err;
    }
  });

  await server.start();
  server.applyMiddleware({ app, path: '/graphql' });

  const port = process.env.PORT || 4000;
  app.listen(port, () =>
    console.log(`🚀 Servidor en http://localhost:${port}${server.graphqlPath}`)
  );
}

startServer();
