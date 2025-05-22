function toggleDirection() {
    const direction = document.getElementById('text-direction').value;
    const outputs = document.getElementsByClassName('text-output');
    for (let output of outputs) {
        output.className = `text-output ${direction}`;
    }
}

async function compareTexts() {
    const progress = document.getElementById('progress');
    const text1 = document.getElementById('text1').value;
    const text2 = document.getElementById('text2').value;
    const output1 = document.getElementById('output1');
    const output2 = document.getElementById('output2');

    // Clear previous outputs and show progress
    output1.innerHTML = '';
    output2.innerHTML = '';
    progress.style.display = 'block';

    // Normalize text (remove Arabic diacritics for comparison)
    function normalizeText(text) {
        return text.normalize('NFKD').replace(/[\u064B-\u065F]/g, '');
    }

    const normalizedText1 = normalizeText(text1);
    const normalizedText2 = normalizeText(text2);

    // Split texts into words (handle Arabic and English)
    const words1 = normalizedText1.split(/[\s،]+/).filter(word => word.length > 0);
    const words2 = normalizedText2.split(/[\s،]+/).filter(word => word.length > 0);

    // Cap phrase length to improve performance
    const MAX_PHRASE_LENGTH = 10;

    // Function to generate phrases of 3 to MAX_PHRASE_LENGTH words
    function getPhrases(words) {
        const phrases = [];
        const maxLength = Math.min(words.length, MAX_PHRASE_LENGTH);
        for (let i = 3; i <= maxLength; i++) {
            for (let j = 0; j <= words.length - i; j++) {
                const phrase = words.slice(j, j + i).join(' ');
                phrases.push({ text: phrase, start: j, length: i });
            }
        }
        return phrases;
    }

    // Function to count phrase occurrences within a text
    function getPhraseOccurrences(words) {
        const occurrences = [];
        const maxLength = Math.min(words.length, MAX_PHRASE_LENGTH);
        for (let i = 3; i <= maxLength; i++) {
            const phraseMap = new Map();
            for (let j = 0; j <= words.length - i; j++) {
                const phrase = words.slice(j, j + i).join(' ');
                if (!phraseMap.has(phrase)) {
                    phraseMap.set(phrase, []);
                }
                phraseMap.get(phrase).push({ start: j, length: i });
            }
            // Only include phrases that appear more than once
            for (let [phrase, positions] of phraseMap) {
                if (positions.length > 1) {
                    occurrences.push({ text: phrase, positions });
                }
            }
        }
        return occurrences;
    }

    // Generate phrases and occurrences asynchronously
    await new Promise(resolve => setTimeout(resolve, 0));
    const phrases1 = getPhrases(words1);
    const phrases2 = getPhrases(words2);
    const repeats1 = getPhraseOccurrences(words1);
    const repeats2 = getPhraseOccurrences(words2);

    // Find matching phrases between texts
    const matches = [];
    phrases1.forEach(phrase1 => {
        phrases2.forEach(phrase2 => {
            if (phrase1.text === phrase2.text) {
                matches.push({ text: phrase1.text, start1: phrase1.start, start2: phrase2.start, length: phrase1.length });
            }
        });
    });

    // Sort matches by length (descending)
    matches.sort((a, b) => b.length - a.length);

    // Highlight matches and repeats in a text
    function highlightText(words, matches, repeats, startKey, originalText) {
        const highlighted = [...words];
        const covered = new Set();

        // Highlight matches between texts (yellow)
        matches.forEach(match => {
            const start = match[startKey];
            const end = start + match.length;

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
                highlighted[start] = `<span class="highlight-match">${match.text}</span>`;
                for (let i = start + 1; i < end; i++) {
                    highlighted[i] = '';
                }
            }
        });

        // Highlight repeated phrases within the text (orange)
        repeats.forEach(repeat => {
            repeat.positions.forEach(pos => {
                const start = pos.start;
                const end = start + pos.length;

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
                    highlighted[start] = `<span class="highlight-repeat">${repeat.text}</span>`;
                    for (let i = start + 1; i < end; i++) {
                        highlighted[i] = '';
                    }
                }
            });
        });

        // Use original text for display (preserves diacritics)
        return originalText.split(/[\s،]+/).filter(word => word !== '').map((word, i) => {
            return highlighted[i] || word;
        }).join(' ');
    }

    // Display highlighted texts
    output1.innerHTML = highlightText(words1, matches, repeats1, 'start1', text1);
    output2.innerHTML = highlightText(words2, matches, repeats2, 'start2', text2);

    // Apply initial text direction
    toggleDirection();

    // Hide progress
    progress.style.display = 'none';
}
