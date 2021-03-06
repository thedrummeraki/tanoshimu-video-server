var express = require('express');
var path = require('path');
var logging = require('./logging');
var config = require('../tanoshimu-config');
var tokenChecker = require('./token-checker');
var app = express();

app.use(tokenChecker);
app.use('/videos', express.static(config.defaultPath));
logging.log('All files are statically served on ' + config.defaultPath);

module.exports = app;
