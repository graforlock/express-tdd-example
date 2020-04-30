const express = require('express');
const bodyParser = require('body-parser');

const Article = require('./models/article');

const app = express();

app.use(bodyParser.json());

app.post('/articles', async (req, res) => {
  const article = req.body;

  try {
    const { _id } = await Article(article).save();

    res.status(201).json({ _id });
  } catch (error) {
    console.error(error.message);
    res.status(400).json({ message: error.message });
  }
});

app.get('/articles', async (req, res) => {
  const pageSize = parseInt(req.query.pageSize) || 10;
  const pageNumber = parseInt(req.query.pageNumber) || 1;

  const articles = await Article.find()
    .skip(pageSize * (pageNumber - 1))
    .limit(pageSize)
    .sort({ createdAt: -1 });

  res.send(articles);
});

app.all('*', (_, res) => {
  res.status(404).json({ message: 'Not Found.' });
});

app.use((err, _, res) => {
  err.statusCode = err.statusCode || 500;

  res.status(err.statusCode).json({ message: err.message });
});

const server = app.listen(3000, () => { console.log('Listening on port 3000'); });

module.exports = server;
