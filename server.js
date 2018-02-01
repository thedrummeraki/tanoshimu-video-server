this.express = require('express');
var fs = require('fs');
var path = require('path');
this.app = this.express();

const defaultVideoPath = "./assets/anime-404-not-found.mp4";
const defaultImagePath = "./assets/anime-404-not-found.jpg";
const defaultSubtitlesFormat = 'vtt';

var regularPath = process.env.ENABLE_REGULAR_PATH == 'true';
var defaultPath = process.env.TANOSHIMU_PATH;
if (!defaultPath) {
  warn("Environment variable TANOSHIMU_PATH not set...");
  defaultPath = "/videos";
}
if (!defaultPath.endsWith("/")) {
  defaultPath = defaultPath.concat("/");
}
log("Serving tanoshimu files at: " + defaultPath);
if (regularPath || true) {
  log("Using regular set of paths...");
  this.app.use('/videos', this.express.static(path.join(__dirname, 'public')));
} else {
  this.app.use(this.express.static(path.join(__dirname, 'public')));
}

/**
  The route for all videos. It includes formats for images too because
  Tanoshimu requires both videos and images. Will return the actual
  requested resource (if found) in image/video format. If the image was
  not found, a 404 image will be returned. If the video was not found,
  a 404 anime video will be returned.

  Subtitles will also be supported.
*/
this.app.get('/get/videos', function(req, res) {
  // Get the query parameters if any
  var query = req.query;

  // Get the query params values
  var video = query.video || 'false';
  var show = query.show || query.shows;
  var episode = query.episode || query.episode_number;
  var format = query.format;
  var show_icon = query.show_icon;
  var subtitle = query.subtitle || query.subtitles || 'false';
  var solid = query.solid || 'false';

  // Check if a video is requested and set the default path accordingly
  video = video == "true";
  solid = solid == "true";
  subtitle = subtitle == 'true';
  var path = video ? defaultVideoPath : defaultImagePath;

  // Check and set the default format (jpg for images, mp4 for videos)
  // This format will be used for the finding the image/video file and
  // used for the response header. For subtitles, web vtt is going to
  // be the default format.
  if (subtitle) {
    // ignore the format for subtitles.
    if (format) {
      warn('Requested subtitles. Ignoring format ' + format + ' in favour of WebVTT.');
    }
    format = defaultSubtitlesFormat;
  } else {
    format = !format ? ((video ? "mp4" : "jpg")) : format;
  }
  
  // If an episode within a show has been requested
  if (show && episode) {
    var success = true;
    try {
      // Try to get the episode number
      episode = parseInt(episode, 10);
      if (episode < 10) {
         episode = "0" + episode;
      }
    } catch (e) {
      // If parsing was not successful
      error(e);
      success = false;
    }

    if (success) {
      // If the parsing was successful, then make the filename.
      show = show.toLowerCase();
      path = defaultPath.concat(show).concat("/ep").concat(episode);
      path = path.concat(".").concat(format);
    }
  } else if (show_icon) {
    // If the show icon has been requested, then make the filename
    // accordingly.
    under = query.under || "icons";
    path = defaultPath.concat(under).concat("/").concat(show_icon).concat(".").concat(format);
  }

  // Show the path for debugging
  log(path);

  // If the file does not exist, get the default image/video filename.
  if (!fs.existsSync(path)) {
    path = video ? defaultVideoPath : defaultImagePath;
    format = video ? "mp4" : "jpeg";
  }

  // Resolve the file
  const stat = fs.statSync(path);

  // Get the file size
  const fileSize = stat.size;

  // Determine the content type to return the server response
  var contentType;
  if (subtitle) {
    contentType = "text/plain";
  } else if (!video) {
    // If an image is requested
    contentType = "image/";

    if (format == "jpg" || format == "jpeg") {
      // Get the appropriate JPEG format
      contentType = contentType + "jpeg";
    } else {
       contentType = contentType + format;
    }
  } else {
    // If a video is requested
    contentType = "video/" + format;
  }

  // Build the response head object
  const head = {
    'Content-Length': fileSize,
    'Content-Type': contentType
  };

  // Check if a range is specified
  const rangeRequested = !solid && req.headers.range;
  var file;

  if (rangeRequested) {
    // Get the requested range
    const range = req.headers.range;

    // Format the range into parts to get the start and end from the video
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize-1;
    const chunkSize = (end-start) + 1;

    // Set the response header accordingly
    head['Content-Range'] = `bytes ${start}-${end}/${fileSize}`;
    head['Accept-Ranges'] = 'bytes';

    // Get the file in chunks
    file = fs.createReadStream(path, {start, end});
  } else {
    // No range request here, so get the file as a whole.
    file = fs.createReadStream(path);
  }

  // The HTTP status will be 206 if a range was requested, 200 otherwise. See
  // below for more info.
  const httpStatus = rangeRequested ? 206 : 200;

  // Set the response as HTTP 200/206 (even if the video/image was not found).
  // In the event that the image or a video was not found, a default file will
  // be returned. Since a valid resource is returned either, a status of 200
  // must be sent back, otherwise the client will most likely be confused.
  res.writeHead(httpStatus, head);

  http_status(httpStatus, "for file ".concat(path));

  // Send the actual file while piping it to the response object.
  file.pipe(res);
});

/**
  This corresponds to the "404" error section of any node.js application. Here,
  we want to send back an image as the "404" error. As explained above, a status
  of 200 must be sent back to the client in order to ensure that something is
  returned and that the client can properly handle and even render the received
  image.
*/
this.app.use(function(req, res, next) {
  error("404: " + req.url + " not found");
  const path = defaultImagePath;
  const stat = fs.statSync(path);
  const fileSize = stat.size;
    
  const head = {'Content-Length': fileSize, 'Content-Type': 'image/jpg'};
  res.writeHead(200, head);
  http_status("404");
  fs.createReadStream(path).pipe(res);
});

const port = process.env.PORT || 3000;

//app.listen(port, function () {
//  if (!process.env.PORT) {
//    warn("You can set the environment variable PORT to start the app on a specific port!");
//  }
//  log('Listening on port ' + port + "!");
//});

var https = require('https');
var http = require('http');
const sslPath = '/etc/letsencrypt/live/tanoshimu.akinyele.ca/';
var sslOptions = {
    key: fs.readFileSync(sslPath + 'privkey.pem'),
    cert: fs.readFileSync(sslPath + 'fullchain.pem')
};

this.server = https.createServer(sslOptions, this.app);
this.app.get('*', function(req, res) {  
    res.redirect('https://' + req.headers.host + req.url);
});
this.server.listen(443);
log('Listening on https port!');

var http = require('http');
http.createServer(function (req, res) {
    res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
    res.end();
}).listen(80);


function log(message) {
  var func = console.log;
  debug("INFO", func, message);
}

function warn(message) {
  var func = console.log;
  debug("WARNING", func, message);
}

function error(message) {
  var func = console.error;
  debug("ERROR", func, message);
}

function fatal(message) {
  var func = console.error;
  debug("FaTaL!", func, message);
}

function http_status(code, message) {
  var func = console.warn;
  var http_message = "Returned code " + code;
  if (message !== undefined) {
     http_message = http_message.concat(" - ").concat(message);
  }
  debug("HTTP", func, http_message);
}

function debug(key, log_function, message) {
  log_function("[%s]: %s", key, message);
}


