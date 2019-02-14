$(document).ready(function(){
  var currentArticle = 1;

  articleCall(currentArticle); // loads first article

  $("#nextArticle").click(function() {
    if(currentArticle < 6) {
      articleCall(currentArticle++);
  }
  });

  $("#previousArticle").click(function() {
    if(currentArticle > 0) {
      articleCall(currentArticle--);
    }
  });

  function articleCall(articleNumber){
    $.get("https://raw.githubusercontent.com/bbc/news-coding-test-dataset/master/data/article-" + articleNumber.toString() + ".json", function(data, status) {
      var articleJson = JSON.parse(data)
      var html = "";

      $("#articleTitle").text(articleJson["title"]);
      
      $.each(articleJson.body, function(key, value){
        html += generateHtml(value["type"], value["model"]);
      });

      $("#articleBody").html(html);
    });
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
    var html = "";

    $.each(items, function(key, value){
      html += "<li>" + value + "</li>";
    });

    return html;
  }
});
