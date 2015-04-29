var express = require('express');
var exphbs  = require('express-handlebars');
var mongoose = require('mongoose');
var crawler = require('./crawler');
var model = require('./model');
var Post = model.Post;
var config = require('./config');

mongoose.connect(config.mongodb_url);

var app = express();
var hbs = exphbs.create({
});
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

app.get('/', function (req, res, next) {
  res.redirect("/1");
});
app.get('/:page', function (req, res, next) {
  var page = req.params.page||1;
  Post.find().skip((page-1)*30).limit(30).exec(function (err, docs) {
    res.render('home', {docs: docs,nextPage:Number(page)+1});
  })

});


// 启动爬虫
//crawler.start();

var server = app.listen(config.port, function () {
  console.log('app is listening ' + server.address().port);
});
