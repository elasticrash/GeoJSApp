var express = require('express');
var request = require('request');

var app = express();
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.use('/', function(req, res) {
    var url = "http://144.76.39.165:8082/geoserver/ELPHO" + req.url;
    req.pipe(request(url)).pipe(res);
});

app.listen(process.env.PORT || 8002);