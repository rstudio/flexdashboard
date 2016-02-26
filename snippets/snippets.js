

function loadSnippet(snippet) {
  $("#" + snippet).addClass("snippet");
  var editor = ace.edit(snippet);
  editor.setHighlightActiveLine(false);
  editor.setShowPrintMargin(false);
  editor.setReadOnly(true); 
  editor.setShowFoldWidgets(false);
  editor.renderer.setDisplayIndentGuides(false);
  editor.setTheme("ace/theme/textmate");
  editor.session.setMode("ace/mode/markdown");
  editor.session.getSelection().clearSelection();
  
  $.get("snippets/" + snippet + ".md", function(data) {
    editor.setValue(data, -1);
    editor.setOptions({
      maxLines: editor.session.getLength()
    });
  });
}
