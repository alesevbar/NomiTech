const cors = require('cors');

const corsOptions = {
    origin: 'https://nomitech-frontend.onrender.com',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    optionsSuccessStatus: 200,
    credentials: false
};

const corsMiddleware = cors(corsOptions);
const corsOptionsHandler = cors(corsOptions);

module.exports = { corsMiddleware, corsOptionsHandler };
