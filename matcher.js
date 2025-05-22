function splitIntoSentences(text) {
  return text
    .match(/[^.!?]+[.!?]?/g)
    ?.map(s => s.trim())
    .filter(s => s.split(/\s+/).length >= 3) || [];
}

function escapeForRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function highlightInDiv(div, matches) {
  let text = div.textContent;
  let highlighted = text;

  // Sort longest to shortest to avoid nested highlight overlaps
  matches.sort((a, b) => b.length - a.length);

  for (const sentence of matches) {
    const escaped = escapeForRegex(sentence);
    const regex = new RegExp(`(${escaped})`, 'g');
    highlighted = highlighted.replace(regex, '<span class="highlight">$1</span>');
  }

  div.innerHTML = highlighted;
}

function highlightMatches() {
  const div1 = document.getElementById("text1");
  const div2 = document.getElementById("text2");

  const text1 = div1.textContent;
  const text2 = div2.textContent;

  const sents1 = splitIntoSentences(text1);
  const sents2 = splitIntoSentences(text2);

  const matches = sents1.filter(s => sents2.includes(s));

  // Clear existing highlights
  div1.innerHTML = text1;
  div2.innerHTML = text2;

  // Apply new highlights
  highlightInDiv(div1, matches);
  highlightInDiv(div2, matches);
}
