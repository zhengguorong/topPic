var express = require('express');
var exphbs  = require('express-handlebars');
var mongoose = require('mongoose');
var async = require('async');
var request = require("request");
var path = require('path');
var crawler = require('./crawler');
var model = require('./model');
var fs = require("fs");
var http = require("http");
var Post = model.Post;
var config = require('./config');

mongoose.connect(config.mongodb_url);

var app = express();

var hbs = exphbs.create({
});

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.use(express.static(path.join(__dirname, '/public')))
app.get('/', function (req, res, next) {
  res.render("home");
});
app.get('/:page', function (req, res, next) {
  var page = req.params.page||1;
  Post.find().sort('-1').skip((page-1)*10).limit(10).exec(function (err, docs) {
    //res.render('home', {docs: docs,nextPage:Number(page)+1});
    res.jsonp({result:docs});
  })

});


// 启动爬虫
//crawler.start();

var q=async.queue(function(task,callback){
  var url=task
  download(url, "public/images", Math.floor(Math.random()*100000) + url.substr(-4,4),callback);
},2)
var fetchImg=function(){
  Post.find().exec(function(err,docs){
    for(var i=0;i<1000;i++){
      var url=docs[i].img;
      q.push(url);
    }
  })
}
//下载方法
var download = function(url, dir, filename,callback){
  request.head(url, function(err, res, body){
    console.log(res);
    try {
      request(url).pipe(fs.createWriteStream(dir + "/" + filename));
      callback&&callback()
    }
    catch (e){

    }
  });
};
fetchImg()
var server = app.listen(config.port, function () {
  console.log('app is listening ' + server.address().port);
});
