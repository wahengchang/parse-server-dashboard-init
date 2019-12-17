const express = require('express');
const ParseServer = require('parse-server').ParseServer;
const ParseDashboard = require('parse-dashboard');
const app = express();

const HOST_URL = process.env.HOST_URL || 'localhost'

// Serve the Parse API on the /parse URL prefix
app.use('/parse', new ParseServer(require('./configs/server')));
app.use('/dashboard', new ParseDashboard(require('./configs/dashboard'),{ allowInsecureHTTP: true }));
app.use('/apis/boxs', require('./apis/boxs'))

app.listen(1337, function() {
  console.log(`parse-server-example running on port: http://${HOST_URL}:1337.`);
});