const SERVER_TYPES = ['regular', 'inline'];
var logging = require('./js/logging');
var fs = require('fs');
var config = require('./tanoshimu-config');

logging.log('Setting up ' + config.server_type + ' server type...');

try {
    this.app = require("./js/" + config.server_type + "-video-server");
} catch (e) {
    logging.error("The server type (set with TANOSHIMU_SERVER_TYPE) is not valid: " + config.server_type);
    logging.error(e);
    process.exit(1);
    return;
}

this.app.use(function(req, res, next) {
    logging.error("404: " + req.url + " not found");
    const path = config.defaultImagePath;
    const stat = fs.statSync(path);
    const fileSize = stat.size;

    console.log(path);
    
    const head = {'Content-Length': fileSize, 'Content-Type': 'image/jpg'};
    res.writeHead(200, head);
    logging.http_status("404");
    fs.createReadStream(path).pipe(res);
});

var http = require('http');
if (config.enable_ssl) {
    logging.log('Setting up SSL...');
    var https = require('https');
    var key, cert;
    logging.log('Reading SSL files at ' + config.tanoshimu_ssl_directory + '...');
    try {
        key = fs.readFileSync(config.tanoshimu_ssl_directory + 'privkey.pem');
        cert = fs.readFileSync(config.tanoshimu_ssl_directory + 'fullchain.pem');
    } catch (e) {
        logging.error('Missing cert or key file. See message below.');
        logging.error(e);
        process.exit(1);
        return;
    }
    logging.log('Creating SSL server...');
    this.server = https.createServer({key: key, cert: cert}, this.app);
    logging.log('Starting SSL server...');
    this.server.listen(443);
    if (config.enable_ssl_redirect) {
        logging.log('Enabling HTTP to HTTPS redirect...');
        http.createServer(function (req, res) {
            res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
            res.end();
        }).listen(config.http_port);
        logging.log('All HTTP requests will redirect to the HTTPS server!');
    }
    logging.log('Running server on HTTPS!');
} else {
    logging.warn('SSL is not enabled.');
    http.createServer(this.app).listen(config.http_port);
}    
logging.log('Running HTTP on port ' + config.http_port + '!');
logging.log('Serving files at ' + config.defaultPath);
