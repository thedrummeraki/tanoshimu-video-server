var fs = require('fs');
var logging = require('./logging');
var config = require('../tanoshimu-config');
var tokenChecker = require('./token-checker');
var express = require('express');
var path = require('path');
var app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(tokenChecker);

app.get('/videos', function(req, res) {
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
  var path = video ? config.defaultVideoPath : config.defaultImagePath;

  // Check and set the default format (jpg for images, mp4 for videos)
  // This format will be used for the finding the image/video file and
  // used for the response header. For subtitles, web vtt is going to
  // be the default format.
  if (subtitle) {
    // ignore the format for subtitles.
    if (format) {
      logging.warn('Requested subtitles. Ignoring format ' + format + ' in favour of WebVTT.');
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
      logging.error(e);
      success = false;
    }

    if (success) {
      // If the parsing was successful, then make the filename.
      show = show.toLowerCase();
      if (!config.defaultPath.endsWith('/')) {
        show = "/".concat(show);
      }
      path = config.defaultPath.concat(show).concat("/ep").concat(episode);
      path = path.concat(".").concat(format);
    }
  } else if (show_icon) {
    // If the show icon has been requested, then make the filename
    // accordingly.
    under = query.under || "icons";
    path = config.defaultPath.concat(under).concat("/").concat(show_icon).concat(".").concat(format);
  }

  // Show the path for debugging
  logging.log(path);

  // If the file does not exist, get the default image/video filename.
  if (!fs.existsSync(path)) {
    path = video ? config.defaultVideoPath : config.defaultImagePath;
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

  logging.http_status(httpStatus, "for file ".concat(path));

  // Send the actual file while piping it to the response object.
  file.pipe(res);
});

module.exports = app;
