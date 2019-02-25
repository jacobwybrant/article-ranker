"use strict";

$(document).ready(function () {
  var currentArticle = 1;
  var maxArticles = 5; // Could be got via request if there was a unknown amount
  var articlesJson = new Array(maxArticles); // used to cache the articles json
  var articlesVisted = new Array(maxArticles).fill(false); // keeps track of visted atircles

  articleCall(currentArticle); // loads first article

  $("#nextArticle").click(function () {
    if (currentArticle < maxArticles) { // check there are still articles left to load
      articleCall(++currentArticle); // increment the currentArticle and load it

      if (currentArticle == maxArticles) { // check if the user has reached the last article
        rankArticles(); // if they have give them the option to rate them
      }
    } else {
      alert("No more articles found.");
    }
  });
  $("#previousArticle").click(function () {
    if (currentArticle > 1) { // check the users not trying to access a article before the first one
      articleCall(--currentArticle); // decrement currentArticle and load it
    } else {
      alert("No previous article.");
    }
  });

  function rankArticles() { // generates the html and js to allow the user to rank the articles
    var html = "<h2>Rank the Articles</h2> <p> Drag the articles to rank them: </p> <ul id=\"rankList\"> <br> <p>Best article</p>";

    for (var i = 1; i < maxArticles + 1; i++) {
      html += "<li id=\"" + i.toString() + "\"class=\"ui-state-default\">" + "Article " + i.toString() + "</li>"; // add all the article in a sortable list to the html for users to rank
    }

    html += "<p>Worst article</p> <br> </ul> <button type=\"button\" id=\"submitArticles\">Submit Ranking</button>"; // button allows user to submit ranking

    $("#rankArticles").hide().html(html).fadeIn('slow');
    $("#rankList").sortable(); // jQuery UI allows a sortable list

    $("#rankList").disableSelection();
    $("#submitArticles").click(function () {
      // user has submitted ranking
      var order = new Array(maxArticles);
      $("#rankArticles ul li").each(function (key, value) { // iterate over html sortable list
        order.push($(this).attr('id').toString()); // add the article number to array
      });
      fakePost("/handleRanking.php", {
        "articleRanking": order
      }, function (data, status) { // see bottom for stubbed post method - fakePost()
        if (status == "success") {
          $("#rankArticles").hide().html("<p>Thank you for submiting your ranking.</p>").fadeIn('slow');
        } else {
          alert("Ranking was not submitted, please try again.");
        }
      });
    });
  }

  function createList(articleNumber) { // Makes the navigation list, which allows users to navigate already visted articles
    if (articlesVisted[articleNumber - 1] == false) { // check if this is the first time the article has been visted
      $("#articleList").append($("<li id=\"article" + currentArticle.toString() + "\"> Article " + currentArticle.toString() + "</li>").hide().fadeIn("slow"));

      $("#article" + currentArticle.toString() + "").click(function () {
        var number = articleNumber; // local variable used as articleNumber changes
        articleCall(number);
      });
    }
  }

  function articleCall(articleNumber) { // displays article
    if (articlesJson[articleNumber - 1] == null) { // check if the json is already cached
      $.get("https://raw.githubusercontent.com/bbc/news-coding-test-dataset/master/data/article-" + articleNumber.toString() + ".json", function (data, status) {
        articlesJson[articleNumber - 1] = JSON.parse(data); // cache json

        if (articleNumber == currentArticle && articleNumber + 1 < maxArticles) { // only want to load the html if this is the current article not pre-loading the next article
          loadArticle(articlesJson[articleNumber - 1]);
          articleCall(articleNumber + 1); // load next article after the current one has loaded
        }
      });
    } else {
      loadArticle(articlesJson[articleNumber - 1]);

      if (articlesJson[articleNumber] == null && articleNumber < maxArticles) { // only want to load the next article not all of them
        articleCall(articleNumber + 1); // load next article after the current one has loaded
      }
    }

    if (articleNumber == currentArticle) {
      createList(articleNumber); // allow user to navigate back to this article
      articlesVisted[currentArticle - 1] = true;
    }
  }

  function loadArticle(articleJson) {
    var html = "";
    $("#articleTitle").text(articleJson["title"]); // title is seprate from the body of the article

    $.each(articleJson.body, function (key, value) {
      // iterate over the articles content
      html += generateHtml(value["type"], value["model"]);
    });
    $("#articleBody").hide().html(html).fadeIn('slow'); // fade in article html
  }

  function generateHtml(type, attr) { // use the json type to generate html
    switch (type) {
      case "paragraph":
        return "<p>" + attr["text"] + "</p>";

      case "heading":
        return "<h3>" + attr["text"] + "</h3>";

      case "list":
        if (attr["type"] == "unordered") return "<ul>" + generateList(attr["items"]) + "</ul>";
      // list made generateList()

      case "image":
        return "<img src=\"" + attr["url"] + "\" alt=\"" + attr["altText"] + "\" height=\"" + attr["height"] + "\" width=\"" + attr["width"] + "\"></img>";

      default:
        return "<p>Invaild json</p>";
    }
  }

  function generateList(items) {
    var html = "";
    $.each(items, function (key, value) {
      html += "<li>" + value + "</li>"; // iterate over items creating html list
    });
    return html;
  }
});

async function fakePost(url, data, completion) {
  await wait1Second(); // simulates the time to post request

  completion({
    success: true
  }, "success"); // simulates a succesful $.post method
}

function wait1Second() {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve();
    }, 1000);
  });
}
