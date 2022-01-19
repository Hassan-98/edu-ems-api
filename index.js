const express = require('express');
const app = express();
const http = require("http");
const server = http.createServer(app);
const port = process.env.PORT || 5000;
const host = process.env.HOST || "http:/localhost";

// Modules
const bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
const morgan = require('morgan');
const axios = require('axios');

// Enable ENV Vars In Development
if (process.env.NODE_ENV !== 'production') require('dotenv').config();

// Database Connection
require("./src/configs/db.config");

// Setting JSON in Body Of Requests
app.use(express.json())
// FormData Body Parser
app.use(bodyParser.json({ limit: '200mb' }));
app.use(bodyParser.urlencoded({ 
  limit: '200mb',
  extended: true,
  parameterLimit: 50000 
}));
// Cookie Parser
app.use(cookieParser());
// Req & Res Compressor
app.use(compression());
// Helmet Protector
app.use(helmet());
// Set Morgan Logger
app.use(morgan('\n:method - :url :status - :response-time ms'));

app.use(async (req, res, next) => {
  const ip = Object.values(require("os").networkInterfaces())
          .flat()
          .filter((item) => !item.internal && item.family === "IPv4")
          .find(Boolean).address;

  const { data: location } = await axios.get(`http://ip-api.com/json/${ip}`);
  console.log(location);
  req.location = location;
  next();
});

// Cross-Origin Resource Sharing
var corsOptionsDelegate = function (req, callback) {
  // CORS Whitelist URLs
  const whitelist = ["https://whitelist-one.com", "https://whitelist-two.com"];
  // Whitelist localhost in development
  if (process.env.NODE_ENV !== 'production') whitelist.push("http://localhost:3000");

  var corsOptions;

  if (whitelist.indexOf(req.header('Origin')) > -1) corsOptions = { origin: true }

  else corsOptions = { origin: false }
  
  callback(null, corsOptions)
}

app.use(cors());


/*******************|  Import Routes  |*******************/ 
const authRoute = require('./src/routes/auth.route');
const usersRoute = require('./src/routes/users.route');
const clientsRoute = require('./src/routes/clients.route');
const activationsRoute = require('./src/routes/activations.route');
const logsRoute = require('./src/routes/logs.route');
const requestsRoute = require('./src/routes/requests.route');

/*******************|  Use Routes  |*******************/ 
app.use('/api/v1/auth', authRoute);
app.use('/api/v1/users', usersRoute);
app.use('/api/v1/clients', clientsRoute);
app.use('/api/v1/activations', activationsRoute);
app.use('/api/v1/logs', logsRoute);
app.use('/api/v1/requests', requestsRoute);


/*******************|  Addional Routes  |*******************/ 
app.get('/', (req, res) => {
  res.json({
    "api": "Edu. EMS Management API",
    "author": "Hassan Ali"
  });
})

/* Error handler middleware */
const errorHandlerMiddleware = require('./src/middlewares/error.handler.middleware');
app.use(errorHandlerMiddleware);

// Run the server
server.listen(port, () => {
  console.log('\x1b[32m%s\x1b[0m', `\n✅ [Server] listening at ${host}:${port}`)
});