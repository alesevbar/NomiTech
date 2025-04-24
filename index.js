import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import mongoose from 'mongoose';
import { ApolloServer } from 'apollo-server-express';
import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core';

import typeDefs from './graphql/typeDefs.js';
import resolvers from './graphql/resolvers.js';

const app = express();

/* ────────────────────────────── 1. Middleware global ────────────────────────────── */
const corsOptions = {
  origin: 'https://nomitech-frontend.onrender.com',
  methods: ['POST', 'GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

/* ────────────────────────────── 2. Logger de peticiones /graphql ────────────────────────────── */
app.use('/graphql', (req, _res, next) => {
  console.log('\ud83d\udcf9 ', req.method, req.originalUrl);
  if (req.body) console.dir(req.body, { depth: null });
  next();
});

/* ────────────────────────────── 3. Servir estáticos (opcional) ────────────────────────────── */
app.use(express.static(path.join(process.cwd(), 'public')));

/* ────────────────────────────── 4. Conexión MongoDB ────────────────────────────── */
if (!process.env.MONGO_URI) {
  console.warn('\u26a0\ufe0f MONGO_URI no definida');
}

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('\u2705 Conectado a MongoDB'))
  .catch(err => console.error('\u274c Error conectando a MongoDB:', err));

/* ────────────────────────────── 5. Apollo Server ────────────────────────────── */
const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
  plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
  formatError: (err) => {
    console.error('\ud83d\udea8 GraphQL FULL error:', err);
    return err;
  }
});

const startServer = async () => {
  await server.start();
  server.applyMiddleware({ app, path: '/graphql' });

  const port = process.env.PORT || 4000;
  app.listen(port, () =>
    console.log(`\ud83d\ude80 Servidor en http://localhost:${port}${server.graphqlPath}`)
  );
};

startServer();

/* ────────────────────────────── 6. Ruta no encontrada ────────────────────────────── */
app.use((req, res) => {
  res.status(404).send('\u274c Ruta no encontrada.');
});