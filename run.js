NODE_ENV="production";
var express = require("express");
var expressStaticGzip = require("express-static-gzip");
var app = express();

app.get('*.js', function(req, res, next) {
  req.url = req.url + '.gz';
  res.set('Content-Encoding', 'gzip');
  res.set('Content-Type', 'text/javascript');
  next();
});
// app.listen(8000);
