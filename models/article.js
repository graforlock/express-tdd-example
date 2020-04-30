const mongoose = require('mongoose');

const ArticleSchema = mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: String, required: true }
}, { timestamps: { createdAt: true, updatedAt: true } });

const Article = mongoose.model('Article', ArticleSchema);

module.exports = Article;
