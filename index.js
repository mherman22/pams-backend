require('dotenv').config();

const express = require('express');
const ParseServer = require('parse-server').ParseServer;
const ParseDashboard = require('parse-dashboard');
const path = require('path');
const args = process.argv || [];
const test = args.some(arg => arg.includes('jasmine'));

const options = {allowInsecureHTTP: false};

//Parse Dashboard settings
const dashboard = new ParseDashboard({
  "apps": [
    {
      "serverURL": process.env.SERVER_URL,
      "appId": process.env.APP_ID,
      "masterKey": process.env.MASTER_KEY,
      "appName": process.env.APP_NAME    }
  ]
}, options)

if (!process.env.MONGODB_URI) {
  console.log('MONGODB_URI not specified, falling back to localhost.');
}else {
  console.log('mongo database has connected successfully!');
}
const config = {
  databaseURI: process.env.MONGODB_URI,
  cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
  appId: process.env.APP_ID,
  masterKey: process.env.MASTER_KEY, //Add your master key here. Keep it secret!
  serverURL: process.env.SERVER_URL, // Don't forget to change to https if needed
  liveQuery: {
    classNames: ['Posts', 'Comments'], // List of classes to support for query subscriptions
  },
};

const app = express();

//make dashboard available at /reapp-dashboard
app.use('/reapp-dashboard',dashboard);

// Serve static assets from the /public folder
app.use('/public', express.static(path.join(__dirname, '/public')));

// Serve the Parse API on the /parse URL prefix
const mountPath = process.env.PARSE_MOUNT || '/parse';
if (!test) {
  const api = new ParseServer(config);
  app.use(mountPath, api);
}

// Parse Server plays nicely with the rest of your web routes
app.get('/', function (req, res) {
//   res.status(200).send('Real Estate Management');
  res.sendFile(path.join(__dirname, '/public/test.html'));
});

const port = process.env.PORT || 4040;
if (!test) {
  const httpServer = require('http').createServer(app);
  httpServer.listen(port, function () {
    console.log('REAPP parse-server and parse-dashboard is running on port http://localhost:' + port + '');
  });
  // This will enable the Live Query real-time server
  ParseServer.createLiveQueryServer(httpServer);
}

module.exports = {
  app,
  config,
};
