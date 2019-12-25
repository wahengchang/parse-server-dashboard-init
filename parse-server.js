const express = require('express');
const {default: ParseServer, ParseGraphQLServer} = require('parse-server');
const ParseDashboard = require('parse-dashboard');
const serverConfig = require('./configs/server')
const app = express();

const HOST_URL = process.env.HOST_URL || 'localhost'
Parse.initialize(process.env.APP_ID,null,process.env.MASTER_KEY);

const parseServer = new ParseServer({ ...serverConfig });
const parseServerApi = parseServer.app;

const {
  mountGraphQL,
  mountPlayground,
  graphQLPath = '/graphql',
  playgroundPath = '/playground',
} = serverConfig;
if (mountGraphQL === true || mountPlayground === true) {
  const parseGraphQLServer = new ParseGraphQLServer(parseServer, {
    graphQLPath,
    playgroundPath,
  });

  if (mountGraphQL) {
    parseGraphQLServer.applyGraphQL(app);
  }

  if (mountPlayground && process.env.ENV !== 'prod') {
    parseGraphQLServer.applyPlayground(app);
  }
}


// Serve the Parse API on the /parse URL prefix
app.use('/dashboard', new ParseDashboard(require('./configs/dashboard'),{ allowInsecureHTTP: true }));
app.use('/apis/boxs', require('./apis/boxs'))
app.use('/parse', parseServerApi); //  <-- Moved here

app.listen(1337, function() {
  console.log(`parse-server-example running on port: http://${HOST_URL}:1337.`);
});