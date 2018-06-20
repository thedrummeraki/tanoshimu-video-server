var logging = {};

logging.log = function(message) {
  var func = console.log;
  logging.debug("INFO", func, message);
}

logging.warn = function(message) {
  var func = console.log;
  logging.debug("WARNING", func, message);
}

logging.error = function(message) {
  var func = console.error;
  logging.debug("ERROR", func, message);
}

logging.fatal = function(message) {
  var func = console.error;
  logging.debug("FaTaL!", func, message);
}

logging.http_status = function(code, message) {
  var func = console.warn;
  var http_message = "Returned code " + code;
  if (message !== undefined) {
     http_message = http_message.concat(" - ").concat(message);
  }
  logging.debug("HTTP", func, http_message);
}

logging.debug = function(key, log_function, message) {
  log_function("[%s]: %s", key, message);
}

module.exports = logging;
