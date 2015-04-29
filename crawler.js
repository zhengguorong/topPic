var superagent = require('superagent');
var async = require('async');
var _ = require('lodash');
var cheerio = require('cheerio');
var model = require('./model');
var Post = model.Post;
var eventproxy = require('eventproxy');
var config = require('./config');

var q=async.queue(function(task,callback){
    var postUrl = task;

    // 如果帖子已经抓取过就不再抓取
    Post.findOne({url: postUrl}, function (post) {
        if (!post) {
            checkImg(postUrl)
        }
    });
    var checkImg=function(postUrl){
        superagent.get(postUrl)
            .set('User-Agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/38.0.2125.111 Safari/537.36')
            .set('Cookie', config.topic_cookie)
            .end(function (res) {
            if (res.status !== 200) {
                return;
            }
            var topicUrl = postUrl;
            var topicHtml = res.text;
            var $ = cheerio.load(topicHtml);
            var img = $("#content img").attr("src");
            if (img) {
                var post = new Post({
                    url: topicUrl,
                    title: $("#content .pageheader h2").text(),
                    img: $("#content img").attr("src"),
                    author: $("#content .pageheader span").text()
                });
                post.save();

            }
              callback();

        })
    }

    },2);

function fetchPics(count) {
    for(var i=1;i<count;i++){
        superagent.get('http://www.topit.me/?p='+i)
            .set('User-Agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/38.0.2125.111 Safari/537.36')
            .set('Cookie', config.topic_cookie)
            .end(function (res) {
                var $ = cheerio.load(res.text);
                $('#canvas .catalog .e.m .title a').each(function(idx,element){
                    var $element=$(element);
                    var href=$element.attr("href");
                    q.push(href,function (){console.log(href+"获取完毕")});
                })
            });
    }


}

exports.start = function () {
  fetchPics(100);

  // 每分钟运行一次
  setInterval(fetchPics, 60 * 1000);
};
