var https = require('https');
var fs = require('fs');
var logging = require('./logging');
var config = require('../tanoshimu-config');

function tokenChecker(req, res, next) {
    console.log(req.query);
    console.log(req.url.startsWith('/error'));
    if (!req.query.token) {
        noOrInvalidToken(res);
        //res.redirect('/error?http_status=403&message=Please specify a token');
    } else {
        talkToTanoshimu('/api/check?token=' + req.query.token, res, next);
    }
}

function noOrInvalidToken(res) {
    logging.error("403: forbidden (invalid token)");
    const path = config.defaultErrorImagePath;
    const stat = fs.statSync(path);
    const fileSize = stat.size;
    
    const head = {'Content-Length': fileSize, 'Content-Type': 'image/jpg'};
    res.writeHead(200, head);
    logging.http_status("403");
    fs.createReadStream(path).pipe(res);
}

// WVqrWWRSCddcRqNQ8SDSCPUa

function talkToTanoshimu(path, res, next) {
    function callback(response, err) {
        console.log(response);
        success = response.success;
        message = response.message || "Invalid token";
        if (response.success) {
            next();
        } else {
            noOrInvalidToken(res);
        }
    }
    var options = {
        hostname: 'tanoshimu.herokuapp.com',
        path: path,
        method: 'POST'
    };
    var https_req = https.request(options, function(https_res) {
        console.log("Status: " + https_res.statusCode);
        var data = "";
        https_res.on('data', function(body) {
            data += body;
        });
        https_res.on('end', function() {
            callback(JSON.parse(data), null);
        });
    });
    https_req.on('error', function(e) {
        console.log("Problem with request: " + e.message);
        callback(null, {error: e});
    });
    https_req.end();
}

module.exports = tokenChecker;
