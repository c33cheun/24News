var _ = require('underscore'),
    config = require('cloud/config/config'),
    Article = require('cloud/models/article');

var ArticleHandler = (function() {
  
  // Get updated headlines
  function getUpdatedHeadlines(req, res) {
    var q = new Parse.Query(Article);

    q.descending('newsDate');
    q.limit(config.HEADLINE_LIMIT);

    q.find().then(function(result) {
      if (result) {
        res.success(result);
      } else {
        res.error('No results found.');
      }
      // var responseObject = [];

      // _.forEach(result, function(article) {
      //   responseObject.push({
      //     'objectId': article.id,
      //     'title': article.get('title'),
      //     'url': article.get('sourceId')
      //   });
      // });

      // res.success(responseObject);
    }, function(error) {
      res.error(error);
    });
  }

  // Returns an entire article
  function getArticle(req, res) {
    var article = new Article();

    article.id = req.params.articleId;

    article.fetch().then(function(result) {
      article = result;
      res.success(article);
    }, function(error) {
      res.error(error);
    });
  }

  return {
    getUpdatedHeadlines: getUpdatedHeadlines,
    getArticle: getArticle
  };
})();

// Does not check for duplicates yet!
function retrieveNikkeiArticles(keyword) {
  var promise = new Parse.Promise();

  Parse.Cloud.httpRequest({
    url: config.NIKKEI.BASEURL + 'xsearch',
    params: {
      keyword: keyword,
      date_from: '2014-10-01 00:00',
      date_to: '2014-10-31 00:00',
      fields: 'body index_images'
    },
    headers: {
      'X-Nikkei-Application-Id': config.NIKKEI.APP_ID
    },
    success: function(httpResponse) {
      var promises = [];
      var content = JSON.parse(httpResponse.text);
      var i;

      for (i = 0; i < content.hits.length; i++) {
        var article = new Article();
        var images = [];
        var locationHack = {
          'ロサンゼルス': 'Los Angeles',
          'ロンドン': 'London',
          '中国': 'Beijing', // Just use Beijing to rep China
          '東京': 'Tokyo',
          'ナイジェリア': 'Abuja', //'Nigeria',
          'スーダン': 'Khartoum', //'Sudan'
          'ダラス': 'Dallas'

        };

        if (content.hits[i].index_images.length != 0) {
          _.forEach(content.hits[i].index_images, function(image) {
            images.push(image.image_path);
          });

          promises.push(article.save({
            title: content.hits[i].title,
            category: content.hits[i].uid,
            body: content.hits[i].body,
            source: 'Nikkei',
            sourceId: content.hits[i].kiji_id,
            display_time: content.hits[i].display_time,
            newsDate: new Date(Date.parse(content.hits[i].display_time)),
            keyword: keyword,
            location: locationHack[keyword],
            imageUrls: images
          }));
        }
        
      }

      Parse.Promise.when(promises).then(function(result) {
        promise.resolve({
          'status': 'success'
        });
      }, function(error) {
        promise.reject(error);
      });
    },
    error: function(httpResponse) {
      console.error(httpResponse);
      console.error(httpResponse.status);
      promise.reject({
        'status': 'error'
      });
    }
  });

  return promise;
}

Parse.Cloud.define('test', function(request, response) {
  var locationKeywords = ['ロサンゼルス', 'ロンドン', '中国', '東京'];
  //var locationKeywords = ['ナイジェリア', 'スーダン', 'ダラス'];
  var promises = [];

  _.forEach(locationKeywords, function(location) {
    promises.push(retrieveNikkeiArticles(location));
  });
  
  Parse.Promise.when(promises).then(function(result) {
    response.success(result);
  }, function(error) {
    response.error(error);
  });
});

module.exports = ArticleHandler;