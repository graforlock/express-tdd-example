const connection = require('../db/connection');
const Article = require('./article');

describe('Article', () => {
  afterAll(async () => {
    await connection.close();
  });

  afterEach(async () => {
    await connection.dropDatabase();
  });

  it('should exist as a module', () => {
    expect(Article).not.toBeUndefined();
  });

  describe('insert', () => {
    let articleToInsert;

    beforeEach(() => {
      articleToInsert = {
        title: 'A title',
        content: 'Content',
        author: 'Joe'
      };
    });

    it('should insert a new article', async () => {
      const insertedArticle = await new Article(articleToInsert).save();

      expect(insertedArticle.isNew).toBe(false);
      expect(insertedArticle).toEqual(
        expect.objectContaining({
          title: expect.any(String),
          content: expect.any(String),
          author: expect.any(String),
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date)
        })
      );
    });
  });
});
