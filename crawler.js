var superagent = require('superagent');
var async = require('async');
var _ = require('lodash');
var cheerio = require('cheerio');
var model = require('./model');
var Post = model.Post;
var eventproxy = require('eventproxy');
var config = require('./config');

function fetchPics() {
  var topicUrls=[];
  superagent.get('http://www.topit.me/?p=1')
    .set('User-Agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/38.0.2125.111 Safari/537.36')
    //.set('Cookie', config.douban_cookie)
    .end(function (res) {
        var $ = cheerio.load(res.text);
        $('.catalog .e.m a').each(function(idx,element){
          var $element=$(element);
          var href=$element.attr("href");
          topicUrls.push(href);
        })

        var ep = new eventproxy();
        ep.after('topic_html',topicUrls.length,function(topics){
          topics=topics.map(function(topicPair){
            var topicUrl=topicPair[0];
            var topicHtml=topicPair[1];
            var $=cheerio.load(topicHtml);
            var img=$("#content img").attr("src");
            if(img){
              var post=new Post({
                url:topicUrl,
                title:$("#content .pageheader h2").text(),
                img:$("#content img").attr("src"),
                author:$("#content .pageheader span").text()
              });
              post.save();
            }
          })
        })
        topicUrls.forEach(function(topicUrl){
          superagent.get(topicUrl).end(function(err,res){
            ep.emit('topic_html',[topicUrl,res.text]);
          })
        })

    });

}

exports.start = function () {
  fetchPics();

  // 每分钟运行一次
  //setInterval(fetchPics, 60 * 1000);
};
