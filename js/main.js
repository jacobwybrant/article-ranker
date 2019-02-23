$(document).ready(function() {
  let currentArticle = 1;
  let maxArticles = 5; // Could be got via request
  let articlesJson = new Array(maxArticles);
  let lastArticle = false;


  articleCall(currentArticle); // loads first article

  $("#nextArticle").click(function() {

    console.log(currentArticle);

    if(currentArticle < 5) {
      articleCall(++currentArticle);

      if(currentArticle == 5) {
        lastArticle = true;
        rankArticles();
      }
    } else {
      alert("No more articles found.");
    }

    console.log(currentArticle);

  });

  $("#previousArticle").click(function() {

    console.log(currentArticle);

    if(currentArticle > 0) {
      articleCall(--currentArticle);
    } else {
      alert("No previous article.");
    }

    console.log(currentArticle);

  });

  function rankArticles()
  {
    html = "<h2>Rank the Articles</h2> <p> Drag the articles to rank them: </p> <ul id=\"rankList\">";

    for(var i = 1; i < maxArticles + 1; i++) {
      html += "<li id=\"" + i.toString() + "\"class=\"ui-state-default\">" + "Article " + i.toString() + "</li>";
    }

    html += "</ul> <button type=\"button\" id=\"submitArticles\">Submit Ranking</button>";

    $("#rankArticles").html(html);

    $("#rankList").sortable();
    $("#rankList").disableSelection();

    $("#submitArticles").click(function() {
      let order = new Array(maxArticles);
      $("#rankArticles ul li").each(function(key, value){
        order.push($(this).attr('id').toString());
      });

      $.post("/url", { "articleRanking" : order } , function(data, status) {
        $("#rankArticles").html("<p>Thank you for submiting your ranking.</p>");
      }).fail(function() {
        alert("Ranking could not be submitted (Currently no server)");
      });
    });
  }

  /*function createList(articleNumber)
  {
    console.log("In create list");
    if(articlesVisted[articleNumber - 1] == false) {
      $("#articleList").append("<ul id=\"article" + currentArticle.toString() + "\"> Article " + currentArticle.toString()+ "</ul>");

  	  $("#article" + currentArticle.toString() + "").click(function() {
  		    articleCall(currentArticle);
  	  });
    }
  }*/

  function articleCall(articleNumber){

    if(articlesJson[articleNumber - 1] == null) {
      $.ajax( {
        async: true,
        url: "https://raw.githubusercontent.com/bbc/news-coding-test-dataset/master/data/article-" + articleNumber.toString() + ".json",
        success: function(data, status) {
        articlesJson[articleNumber - 1] = JSON.parse(data);
        loadArticle(articlesJson[articleNumber - 1]);
      }
    });
  } else {
      loadArticle(articlesJson[articleNumber - 1]);
  }




      /*createList(articleNumber);
      articlesVisted[currentArticle - 1] = true;
      console.log(articlesVisted);*/

  }

  function loadArticle(articleJson)
  {
    let html = "";
    $("#articleTitle").text(articleJson["title"]);

    $.each(articleJson.body, function(key, value){
      html += generateHtml(value["type"], value["model"]);
    });

    $("#articleBody").html(html);
  }

  function generateHtml(type, attr)
  {
    switch (type) {
      case "paragraph":
        return "<p>" + attr["text"]+ "</p>";
      case "heading":
        return "<h3>" + attr["text"]+ "</h3>";
      case "list":
        if(attr["type"] == "unordered")
          return "<ul>" + generateList(attr["items"]) + "</ul>";
        return "<h2>" + attr["text"]+ "</h2>";
      case "image":
        return "<img src=\"" + attr["url"] + "\" alt=\"" + attr["altText"] + "\" height=\"" + attr["height"] + "\" width=\"" + attr["width"] +"\"></img>";
      default:
        return "<p>Invaild json</p>";
    }
  }

  function generateList(items) {
    let html = "";

    $.each(items, function(key, value){
      html += "<li>" + value + "</li>";
    });

    return html;
  }
});
