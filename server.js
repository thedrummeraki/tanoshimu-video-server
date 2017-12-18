const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

const defaultVideoPath = "./assets/anime-404-not-found.mp4";
const defaultImagePath = "./assets/anime-404-not-found.jpg";

var defaultPath = process.env.TANOSHIMU_PATH;
if (!defaultPath) {
  console.warn("Environment variable TANOSHIMU_PATH not set...");
  defaultPath = "/videos";
}
if (!defaultPath.endsWith("/")) {
  defaultPath = defaultPath.concat("/");
}
console.log("Serving tanoshimu files at: %s", defaultPath);


app.use(express.static(path.join(__dirname, 'public')));

app.get('/videos', function(req, res) {
  // Get the query parameters if any
  var query = req.query;

  // Get the query params values
  var video = query.video || 'false';
  var show = query.show;
  var episode = query.episode;
  var format = query.format;
  var show_icon = query.show_icon;

  // Check if a video is requested and set the default path accordingly
  video = video == "true";
  var path = video ? defaultVideoPath : defaultImagePath;

  // Check and set the default format (jpg for images, mp4 for videos)
  // This format will be used for the finding the image/video file and
  // used for the response header.
  format = !format ? ((video ? "mp4" : "jpg")) : format;
  
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
      console.error(e);
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
  console.log(path);

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
  if (!video) {
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

  // Set the response as HTTP 200 (even if the video/image was not found).
  // In the event that the image or a video was not found, a default file will
  // be returned. Since a valid resource is returned either, a status of 200
  // must be sent back, otherwise the client will most likely be confused.
  res.writeHead(200, head);

  // Send the actual file while piping it to the response object.
  fs.createReadStream(path).pipe(res);
});

/**
  This corresponds to the "404" error section of any node.js application. Here,
  we want to send back an image as the "404" error. As explained above, a status
  of 200 must be sent back to the client in order to ensure that something is
  returned and that the client can properly handle and even render the received
  image.
*/
app.use(function(req, res, next) {

  const path = defaultImagePath;
  const stat = fs.statSync(path);
  const fileSize = stat.size;
    
  const head = {'Content-Length': fileSize, 'Content-Type': 'image/jpg'};
  res.writeHead(200, head);
  fs.createReadStream(path).pipe(res);
});

const port = process.env.PORT || 3000;

app.listen(port, function () {
  if (!process.env.PORT) {
    console.warn("You can set the environment variable PORT to start the app on a specific port!");
  }
  console.log('Listening on port %s!', port);
});

function log(log_function, message) {
  var log_function_name = log_function.toString();
  log_function_name = log_function_name.substr('function '.length);
  log_function_name = log_function_name.substr(0, log_function_name.indexOf('('));
  log_function("[%s]: %s", log_function_name, message);
}


