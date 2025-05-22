function splitIntoSentences(text) {
  return text
    .match(/[^.!?]+[.!?]?/g)  // Basic sentence split
    ?.map(s => s.trim())
    .filter(s => s.split(/\s+/).length >= 3) || [];
}

function highlightMatches() {
  const text1 = document.getElementById("text1").value;
  const text2 = document.getElementById("text2").value;

  const sentences1 = splitIntoSentences(text1);
  const sentences2 = splitIntoSentences(text2);

  const matches = sentences1.filter(s1 =>
    sentences2.some(s2 => s1 === s2)
  );

  // Display with highlighting
  document.getElementById("text1").value = text1;
  document.getElementById("text2").value = text2;

  highlightInTextArea("text1", matches);
  highlightInTextArea("text2", matches);
}

function highlightInTextArea(textareaId, sentences) {
  const textarea = document.getElementById(textareaId);
  const content = textarea.value;

  // Highlight logic using spans in HTML requires replacing textarea with a div
  // But since textarea can't render HTML, consider upgrading UI later
  // For now: log matches
  console.log(`Matched in ${textareaId}:`, sentences);
}
