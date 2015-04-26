var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PostSchema = new Schema({
  url: String,
  title: String,
  img: String,
  author: String
});

PostSchema.index({create_at: -1});

var Post = mongoose.model('Post', PostSchema);

exports.Post = Post;
