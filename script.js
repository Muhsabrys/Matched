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
    const freq1 = document.getElementById('freq1');
    const freq2 = document.getElementById('freq2');

    // Clear previous outputs and show progress
    output1.innerHTML = '';
    output2.innerHTML = '';
    freq1.innerHTML = '';
    freq2.innerHTML = '';
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

    // Count phrase frequencies in a text
    function getPhraseFrequencies(words) {
        const freqMap = new Map();
        const maxLength = Math.min(words.length, MAX_PHRASE_LENGTH);
        for (let i = 3; i <= maxLength; i++) {
            for (let j = 0; j <= words.length - i; j++) {
                const phrase = words.slice(j, j + i).join(' ');
                freqMap.set(phrase, (freqMap.get(phrase) || 0) + 1);
            }
        }
        return freqMap;
    }

    // Generate phrases and frequencies asynchronously
    await new Promise(resolve => setTimeout(resolve, 0));
    const phrases1 = getPhrases(words1);
    const phrases2 = getPhrases(words2);
    const freqMap1 = getPhraseFrequencies(words1);
    const freqMap2 = getPhraseFrequencies(words2);

    // Find matching phrases
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

    // Highlight matches in both texts
    function highlightText(words, matches, startKey, originalText) {
        const highlighted = [...words];
        const covered = new Set();

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
                highlighted[start] = `<span class="highlight">${match.text}</span>`;
                for (let i = start + 1; i < end; i++) {
                    highlighted[i] = '';
                }
            }
        });

        return originalText.split(/[\s،]+/).filter(word => word !== '').map((word, i) => {
            return highlighted[i] || word;
        }).join(' ');
    }

    // Display highlighted texts
    output1.innerHTML = highlightText(words1, matches, 'start1', text1);
    output2.innerHTML = highlightText(words2, matches, 'start2', text2);

    // Display frequency lists for matching phrases
    const uniqueMatches = [...new Set(matches.map(m => m.text))];
    uniqueMatches.forEach(phrase => {
        const count1 = freqMap1.get(phrase) || 0;
        const count2 = freqMap2.get(phrase) || 0;
        if (count1 > 0) {
            const li = document.createElement('li');
            li.textContent = `${phrase}: ${count1} time${count1 !== 1 ? 's' : ''}`;
            freq1.appendChild(li);
        }
        if (count2 > 0) {
            const li = document.createElement('li');
            li.textContent = `${phrase}: ${count2} time${count2 !== 1 ? 's' : ''}`;
            freq2.appendChild(li);
        }
    });

    // Apply initial text direction
    toggleDirection();

    // Hide progress
    progress.style.display = 'none';
}
