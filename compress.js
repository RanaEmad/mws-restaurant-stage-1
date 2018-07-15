var zlib = require('zlib');
var fs = require('fs');

var gzip = zlib.createGzip();
var r = fs.createReadStream('./js/main.min.js');
var w = fs.createWriteStream('./main.js.gz');
r.pipe(gzip).pipe(w);

// var gzipStatic = require('connect-gzip-static');
// var oneDay = 86400000;
//
// connect()
//   .use(gzipStatic(__dirname + '/'))
//
// connect()
//   .use(gzipStatic(__dirname + '/', { maxAge: oneDay }))



// var gulp= require("gulp");
// var browserSync= require("browser-sync");
//
// gulp.task('serve', function () {
//     browserSync({
//         server: "./_site",
//         files: [ './_site/public/js/*.js']
//     }, function (err, bs) {
//         bs.addMiddleware("*", require('connect-gzip-static')('./_site'), {
//             override: true
//         });
//     });
// });
