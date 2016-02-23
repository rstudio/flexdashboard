

function loadSnippet(snippet) {
  $("#" + snippet).addClass("snippet");
  var editor = ace.edit(snippet);
  editor.setTheme("ace/theme/textmate");
  editor.session.setMode("ace/mode/markdown");
  $.get("snippets/" + snippet + ".md", function(data) {
    editor.setValue(data);
  });
}
