const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

const defaultVideoPath = "./assets/anime-404-not-found.mp4";
const defaultImagePath = "./assets/anime-404-not-found.jpg";

app.use(express.static(path.join(__dirname, 'public')));

app.get('/videos', function(req, res) {
  var query = req.query;

  console.log(query);

  var video = query.video || 'false';
  var show = query.show;
  var episode = query.episode;
  var path = defaultImagePath;
  var format = query.format;
  var show_icon = query.show_icon;

  video = video == "true";
  if (video) {
     path = defaultVideoPath;
  }

  format = !format ? ((video ? "mp4" : "jpg")) : format;
  
  if (show && episode) {
    var success = true;
    try {
      episode = parseInt(episode, 10);
      if (episode < 10) {
         episode = "0" + episode;
      }
    } catch (e) {
      console.error(e);
      success = false;
    }

    if (success) {
      show = show.toLowerCase();
      path = "/videos/".concat(show).concat("/ep").concat(episode);
      path = path.concat(".").concat(format);
    }
  } else if (show_icon) {
     under = query.under || "icons";
     path = "/videos/".concat(under).concat("/").concat(show_icon).concat(".").concat(format);
  }

  console.log(path);

  if (!fs.existsSync(path)) {
    path = video ? defaultVideoPath : defaultImagePath;
  }

  const stat = fs.statSync(path);
  const fileSize = stat.size;
  
  var contentType;
  if (!video) {
     contentType = "image/";
     if (format == "jpg" || format == "jpeg") {
        contentType = contentType + "jpeg";
     } else {
        contentType = contentType + format;
     }
  } else {
     contentType = "video/" + format;
  }

  const head = {
    'Content-Length': fileSize,
    'Content-Type': contentType
  };

  console.log(head);
  res.writeHead(200, head);
  fs.createReadStream(path).pipe(res);
});

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
  console.log('Listening on port %s!', port);
})
