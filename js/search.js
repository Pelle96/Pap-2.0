// apri menu
$(".banner>img").click((e) => {
  e.stopPropagation();
  $("#search").addClass("open");
});

// chiudi menu
$("#search>.banner>img").click((e) => {
  e.stopPropagation();
  $("#search").removeClass("open");
});

// logica di ricerca
var searchBox = $("#search>.banner>input");
searchBox.keyup(function () {
  var photos = $(".contenuto>.column>figure");
  var result = $(".contenuto>#search>.results>div");
  var input = searchBox.val();
  var words = input.match(WORDS);
  var filtered = [];

  result.empty();

  if (this.value === "") {
    noMatch(result);
  } else {
    $.each(photos, (i, element) => {
      let elt = $(element);
      let data = {};
      data.title = elt.find("figcaption").text();
      data.descr = elt.find("img").attr("data-description");
      data.tags = elt.find(".tags>*");
      $.each(data.tags, (i, tag) => (data[`tag${i}`] = $(tag).text()));
      // il testo viene cercato nel titolo, descrizione e tags
      // la corrispondenza è cercata parola per parola
      var match = false;
      $.each(words, (i, word) => {
        if (containsWord(data, word)) match = true;
      });
      if (match) filtered.push(element);
    });

    if (filtered.length === 0) {
      noMatch(result);
    } else {
      $.each(filtered, (i, element) => {
        var clone = $(element).clone(true);
        result.append(clone);
      });
    }
  }

  function noMatch(parent) {
    parent.append($("<p>").text("No match found."));
  }
});
