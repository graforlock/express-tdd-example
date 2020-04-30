const supertest = require('supertest');

const connection = require('./db/connection');
const server = require('./server');

const Article = require('./models/article');

describe('Routes', () => {
  afterAll(async () => {
    await server.close();
    await connection.close();
  });

  afterEach(async () => {
    await connection.dropDatabase();
  });

  it('should exist as a module', () => {
    expect(server).not.toBeUndefined();
  });

  describe('Not Found', () => {
    it('should return 404', async () => {
      const response = await supertest(server).get('/non-existent');

      expect(response.status).toEqual(404);
    });
  });

  describe('POST /articles', () => {
    let articleToInsert;

    beforeEach(() => {
      articleToInsert = {
        title: 'My Title',
        content: 'My Content',
        author: 'Me'
      };
    });

    it('should successfuly insert an article and retrieve it', async () => {
      const response = await supertest(server).post('/articles')
        .send(articleToInsert);

      expect(response.status).toEqual(201);
      expect(response.body).toEqual(expect.objectContaining({
        _id: expect.any(String)
      }));

      const articuleFound = await Article.findOne({ _id: response.body._id });

      expect(articuleFound.title).toEqual(articleToInsert.title);
    });

    it('should return a 400 with an incomplete article payload', async () => {
      articleToInsert.title = undefined;
      const response = await supertest(server).post('/articles')
        .send(articleToInsert);

      expect(response.status).toEqual(400);
      expect(response.body.message).toEqual('Article validation failed: title: Path `title` is required.');
    });
  });

  describe('GET /articles', () => {
    let insertedArticles;

    beforeEach(async () => {
      for (let i = 0; i < 50; i++) {
        await Article({
          title: `My Title ${i}`,
          content: 'My Content',
          author: 'Me'
        }).save();
      }
      insertedArticles = await Article.find();
    });

    it('should get 10 articles on page 1 by default', async () => {
      const response = await supertest(server).get('/articles');

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(10);
    });

    it('should get 20 articles on page 1 by default', async () => {
      const response = await supertest(server).get('/articles?pageSize=20');

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(20);
    });

    it('should get two different articles on page 1 and page 2', async () => {
      const { body: articleOne } = await supertest(server).get('/articles?pageSize=1&pageNumber=1');
      const { body: articleTwo } = await supertest(server).get('/articles?pageSize=1&pageNumber=2');

      const expectedOne = insertedArticles[49]._id;
      const expectedTwo = insertedArticles[48]._id;

      expect(articleOne[0]._id).toEqual(expectedOne.toString());
      expect(articleTwo[0]._id).toEqual(expectedTwo.toString());
    });

    it('should get correct ids for 15 articles on page 2', async () => {
      const { body } = await supertest(server).get('/articles?pageSize=15&pageNumber=2');

      const expected = insertedArticles
        .reverse()
        .slice(15, 30)
        .map(({ _id }) => _id.toString());

      expect(body.map(({ _id }) => _id.toString())).toEqual(expected);
    });
  });
});
