var superagent = require('superagent');
var async = require('async');
var _ = require('lodash');
var cheerio = require('cheerio');
var model = require('./model');
var Post = model.Post;
var eventproxy = require('eventproxy');
var config = require('./config');

var q=async.queue(function(task,callback){
    console.log("task=="+task);
    var postUrl = task;
    var ep = new eventproxy();
    ep.fail(callback);

    // 如果帖子已经抓取过就不再抓取
    Post.findOne({url: postUrl}, ep.done(function (post) {
        if (!post) {
            console.log("进来次数")
            ep.emit('fetch_author');
        }

    }));
    ep.all('fetch_author', function () {
        superagent.get(postUrl).end(ep.done(function (res) {
            if (res.status !== 200) {
                return;
            }
            console.log("postUrl=="+postUrl);
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

        }))
        });
    },1);

function fetchPics() {
    var ep = new eventproxy();
    ep.fail(function (err) {
        console.error(err);
    });
  superagent.get('http://www.topit.me/?p=1')
    .set('User-Agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/38.0.2125.111 Safari/537.36')
    //.set('Cookie', config.douban_cookie)
    .end(ep.done(function (res) {
          var $ = cheerio.load(res.text);
          $('.catalog .e.m a').each(function(idx,element){
              var $element=$(element);
              var href=$element.attr("href");
              q.push(href,ep.done(function () {}));
          })
      }));

}

exports.start = function () {
  fetchPics();

  // 每分钟运行一次
  //setInterval(fetchPics, 60 * 1000);
};
