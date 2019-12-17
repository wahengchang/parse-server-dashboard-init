var express = require('express');
var ParseServer = require('parse-server').ParseServer;
var app = express();

var api = new ParseServer({
  databaseURI: process.env.DATABASE_URI,
  cloud: `${__dirname}/cloud/main.js`, // Absolute path to your Cloud Code
  appId: process.env.APP_ID,
  masterKey: process.env.MASTER_KEY, // Keep this key secret!
  fileKey: 'optionalFileKey',
  serverURL: 'http://localhost:1337/parse' // Don't forget to change to https if needed
});

// Serve the Parse API on the /parse URL prefix
app.use('/parse', api);

app.listen(1337, function() {
  console.log('parse-server-example running on port: http://localhost:1337.');
});