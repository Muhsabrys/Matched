function compareTexts() {
    // Get input texts
    const text1 = document.getElementById('text1').value;
    const text2 = document.getElementById('text2').value;
    const output1 = document.getElementById('output1');
    const output2 = document.getElementById('output2');

    // Clear previous outputs
    output1.innerHTML = '';
    output2.innerHTML = '';

    // Split texts into words
    const words1 = text1.split(/\s+/).filter(word => word.length > 0);
    const words2 = text2.split(/\s+/).filter(word => word.length > 0);

    // Function to generate phrases of 3 or more words
    function getPhrases(words) {
        const phrases = [];
        for (let i = 3; i <= words.length; i++) {
            for (let j = 0; j <= words.length - i; j++) {
                const phrase = words.slice(j, j + i).join(' ');
                phrases.push({ text: phrase, start: j, length: i });
            }
        }
        return phrases;
    }

    // Get all possible phrases
    const phrases1 = getPhrases(words1);
    const phrases2 = getPhrases(words2);

    // Find matching phrases
    const matches = [];
    phrases1.forEach(phrase1 => {
        phrases2.forEach(phrase2 => {
            if (phrase1.text === phrase2.text) {
                matches.push({ text: phrase1.text, start1: phrase1.start, start2: phrase2.start, length: phrase1.length });
            }
        });
    });

    // Sort matches by length (descending) to prioritize longer matches
    matches.sort((a, b) => b.length - a.length);

    // Highlight matches in both texts
    function highlightText(words, matches, startKey) {
        const highlighted = [...words];
        const covered = new Set();

        matches.forEach(match => {
            const start = match[startKey];
            const end = start + match.length;

            // Only highlight if this range hasn't been covered by a longer match
            let isCovered = false;
            for (let i = start; i < end; i++) {
                if (covered.has(i)) {
                    isCovered = true;
                    break;
                }
            }

            if (!isCovered) {
                for (let i = start; i < end; i++) {
                    covered.add(i);
                }
                highlighted[start] = `<span class="highlight">${match.text}</span>`;
                for (let i = start + 1; i < end; i++) {
                    highlighted[i] = '';
                }
            }
        });

        // Join words, filter out empty strings, and return
        return highlighted.filter(word => word !== '').join(' ');
    }

    // Display highlighted texts
    output1.innerHTML = highlightText(words1, matches, 'start1');
    output2.innerHTML = highlightText(words2, matches, 'start2');
}
