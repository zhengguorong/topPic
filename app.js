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
  var page = req.params.page||1;
  var docs=Post.find().limit(10);
  Post.find().limit(10).exec(function (err, docs) {
    res.render('home', {docs: docs});
  })

});


// 启动爬虫
crawler.start();

var server = app.listen(config.port, function () {
  console.log('app is listening ' + server.address().port);
});
