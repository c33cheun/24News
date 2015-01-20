var config = require('cloud/config/config');

var Article = Parse.Object.extend('Article', {
  // Instance methods

  // NO translation from Nikkei format, this is a todo
  saveNikkeiArticle: function(nikkeiArticle) {

    // Hardcode these for now
    // Use Maps API to get lat/long later
    var locationPoint = new Parse.GeoPoint({
      latitude: 40.0,
      longitude: -30.0
    });

    this.save({
      title: nikkeiArticle.title,
      category: nikkeiArticle.uid,
      body: nikkeiArticle.body,
      source: 'Nikkei',
      sourceId: nikkeiArticle.kiji_id,
      location: locationPoint
    });
  }
}, {
  // Class methods
});

function getUpdatedNikkeiArticles(keyword){
  var Article = Parse.Object.extend('Article');

  Parse.Cloud.httpRequest({
    url: 'http://dac2.snnm.net:80/api/xsearch',
    params: {
      'keyword': keyword,
      'fields':'body index_images',
      'date_from': '2014-03-01 00:00',
      'date_to': '2014-03-08 00:00',
    },
    headers: {
      'X-Nikkei-Application-Id': config.NIKKEI.APP_ID
    },
    success: function(httpResponse) {
      var content = JSON.parse(httpResponse.text);
      var i;
    
      for(i = 0; i < 5; i++){
        var article = new Article();

        article.save({
          title: content.hits[i].title,
          category: content.hits[i].uid,
          body: content.hits[i].body,
          source: 'Nikkei',
          sourceId: content.hits[i].kiji_id,
          display_time: content.hits[i].display_time
        });
      }
    },
    error: function(httpResponse) {
      console.error('Request failed with response code ' + httpResponse.status);
      response.error();
    }
  });
}

Parse.Cloud.define('testDateParse', function(req, res) {
  var endDate = new Date();
});

Parse.Cloud.define('testOld', function(req, res) {
  Parse.Cloud.httpRequest({
    url: config.NIKKEI.BASEURL + 'xsearch',
    params: {
      keyword: 'Tokyo',
      date_from: '2014-03-01 00:00',
      date_to: '2014-03-08 00:00',
      fields: 'body index_images'
    },
    headers: {
      'X-Nikkei-Application-Id': config.NIKKEI.APP_ID
    },
    success: function(httpResponse) {
      console.log('Success');
      console.log(httpResponse);
      console.log(httpResponse);
      res.success(httpResponse);
    },
    error: function(httpResponse) {
      console.error('Request failed with response code ' + httpResponse.status);
      res.error(httpResponse);
    }
  });
});


function RetrieveCountryData(country_name, country_id){
	
   var ArticleObject = Parse.Object.extend("ArticleObject");

   Parse.Cloud.httpRequest({
   url: 'http://dac2.snnm.net:80/api/xsearch',
   params: {
      'keyword':country_name,
      'fields':'body index_images'
   },
   headers: {
     'X-Nikkei-Application-Id': '35774cdfd163468a8e6e1c59c5649e4d',
     'Content-Type': 'application/json;charset=utf-8'
    },
    success: function(httpResponse) {
		console.log("-------------" + httpResponse.text + "-----------");
		var content =　JSON.parse(httpResponse.text);
		var i;
		
		for(i=0; i<5; i=i+1){
			var obj= new ArticleObject();
			obj.set("display_time", content.hits[i].display_time);
			obj.set("body", content.hits[i].body);
			obj.set("title", content.hits[i].title);
			obj.set("country", country_id);
			obj.save();
		}
		console.log("succceed" + country_name );
    },
    error: function(httpResponse) {
      console.error('Request failed with response code ' + httpResponse.status);
      response.error();
    }
  });
}


Parse.Cloud.define("regist_country_data",function(request,response){

 RetrieveCountryData("ロサンゼルス", "LosAngeles");
 RetrieveCountryData("ロンドン", "London");
 RetrieveCountryData("中国", "chinese");
 RetrieveCountryData("東京", "tokyo");

});



module.exports = Article;
