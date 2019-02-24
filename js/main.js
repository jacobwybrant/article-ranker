$(document).ready(function() {
  let currentArticle = 1;
  let maxArticles = 5; // Could be got via request
  let articlesJson = new Array(maxArticles);
  let articlesVisted = new Array(maxArticles).fill(false);
  let lastArticle = false;

  articleCall(currentArticle); // loads first article

  $("#nextArticle").click(function() {

    if(currentArticle < maxArticles) {
      articleCall(++currentArticle);

      if(currentArticle == maxArticles) {
        lastArticle = true;
        rankArticles();
      }
    } else {
      alert("No more articles found.");
    }
  });

  $("#previousArticle").click(function() {

    if(currentArticle > 1) {
      articleCall(--currentArticle);
    } else {
      alert("No previous article.");
    }
  });

  function rankArticles()
  {
    html = "<h2>Rank the Articles</h2> <p> Drag the articles to rank them: </p> <ul id=\"rankList\">";

    for(var i = 1; i < maxArticles + 1; i++) {
      html += "<li id=\"" + i.toString() + "\"class=\"ui-state-default\">" + "Article " + i.toString() + "</li>";
    }

    html += "</ul> <button type=\"button\" id=\"submitArticles\">Submit Ranking</button>";

    $("#rankArticles").hide().html(html).fadeIn('slow');

    $("#rankList").sortable();
    $("#rankList").disableSelection();

    $("#submitArticles").click(function() {
      let order = new Array(maxArticles);
      $("#rankArticles ul li").each(function(key, value){
        order.push($(this).attr('id').toString());
      });

      fakePost("/handleRanking.php", { "articleRanking" : order } , function(data, status) {
        if(status == "success") {
          $("#rankArticles").hide().html("<p>Thank you for submiting your ranking.</p>").fadeIn('slow');
        } else {
          alert("Ranking was not submitted, please try again.");
        }
      });
    });
  }

  function createList(articleNumber)
  {
    if(articlesVisted[articleNumber - 1] == false) {
      $("#articleList").append($("<li id=\"article" + currentArticle.toString() + "\"> Article " + currentArticle.toString()+ "</li>").hide().fadeIn("slow"));

  	  $("#article" + currentArticle.toString() + "").click(function() {
          let number = articleNumber;
          articleCall(number);
  	  });
    }
  }

  function articleCall(articleNumber){

    if(articlesJson[articleNumber - 1] == null) {
      $.get("https://raw.githubusercontent.com/bbc/news-coding-test-dataset/master/data/article-" + articleNumber.toString() + ".json",
        function(data, status) {
          articlesJson[articleNumber - 1] = JSON.parse(data); // cache json
          if(articleNumber == currentArticle && (articleNumber + 1) < maxArticles) {  // only want to load the html if this is the current article not pre-loading the next article
            loadArticle(articlesJson[articleNumber - 1]);
            articleCall(articleNumber + 1); // load next article after the current one has loaded
        }
    });
  } else {
      loadArticle(articlesJson[articleNumber - 1]);
  }

  if(articleNumber == currentArticle) {
    createList(articleNumber);
    articlesVisted[currentArticle - 1] = true;
    }
  }

  function loadArticle(articleJson)
  {
    let html = "";
    $("#articleTitle").text(articleJson["title"]);

    $.each(articleJson.body, function(key, value){
      html += generateHtml(value["type"], value["model"]);
    });

    $("#articleBody").hide().html(html).fadeIn('slow');
  }

  function generateHtml(type, attr) {
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

async function fakePost(url, data, completion) {
  await wait1Second(); // simulates the time to post request
  completion({ success : true }, "success"); // simulates a succesful $.post method
}

function wait1Second() {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, 1000);
  });
}
