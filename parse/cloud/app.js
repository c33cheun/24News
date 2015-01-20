var ArticleHandler = require('cloud/controllers/article');

/*
 * getUpdatedHeadlines
 *
 * Returns the ten most recent headlines
 *
 * Expected input (in request.params):
 *   nil            : Type, none
 */
Parse.Cloud.define('getUpdatedHeadlines', function(request, response) {
  ArticleHandler.getUpdatedHeadlines(request, response);
});

/*
 * getArtcile
 *
 * Returns an entire article.
 *
 * Expected input (in request.params):
 *   articleId      : String, the objectId of the item
 */
Parse.Cloud.define('getArticle', function(request, response) {
  ArticleHandler.getArticle(request, response);
});