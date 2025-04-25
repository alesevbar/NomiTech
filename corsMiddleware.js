const cors = require('cors');

const corsOptions = {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    optionsSuccessStatus: 200,
    credentials: false
};

const corsMiddleware = cors(corsOptions);
const corsOptionsHandler = cors(corsOptions);

module.exports = { corsMiddleware, corsOptionsHandler };
