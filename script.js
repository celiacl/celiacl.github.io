// ===== Typewriter Effect =====
const typewriterEl = document.getElementById('typewriter');
const roles = [
    'AI Engineer',
    'PhD Candidate',
    'NLP Specialist',
    'University Lecturer',
    'Data Scientist',
    'Researcher'
];
let roleIndex = 0;
let charIndex = 0;
let isDeleting = false;

function typewrite() {
    const current = roles[roleIndex];
    if (isDeleting) {
        typewriterEl.textContent = current.substring(0, charIndex - 1);
        charIndex--;
    } else {
        typewriterEl.textContent = current.substring(0, charIndex + 1);
        charIndex++;
    }

    let speed = isDeleting ? 40 : 80;

    if (!isDeleting && charIndex === current.length) {
        speed = 2000;
        isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        speed = 400;
    }

    setTimeout(typewrite, speed);
}

typewrite();

// ===== Language Toggle =====
const langToggle = document.getElementById('langToggle');
let currentLang = 'es';

langToggle.addEventListener('click', () => {
    currentLang = currentLang === 'es' ? 'en' : 'es';

    document.querySelectorAll('.lang-option').forEach(opt => {
        opt.classList.toggle('active', opt.dataset.lang === currentLang);
    });

    document.querySelectorAll('[data-es][data-en]').forEach(el => {
        el.textContent = el.getAttribute(`data-${currentLang}`);
    });

    document.documentElement.lang = currentLang;

    // Update textarea placeholder
    const textarea = document.getElementById('nlpInput');
    if (textarea) {
        textarea.placeholder = currentLang === 'es'
            ? 'Escribe algo aquí...'
            : 'Type something here...';
    }
});

// ===== Navbar scroll effect =====
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
});

// ===== Mobile menu =====
const menuBtn = document.getElementById('menuBtn');
const navLinks = document.querySelector('.nav-links');

menuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('open');
});

navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('open');
    });
});

// ===== Scroll animations =====
const sections = document.querySelectorAll('.section');
const observer = new IntersectionObserver(
    (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    },
    { threshold: 0.1 }
);
sections.forEach(section => observer.observe(section));

// ===== Smooth scroll =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// ===== NLP Lab =====
const nlpInput = document.getElementById('nlpInput');
const nlpAnalyze = document.getElementById('nlpAnalyze');
const nlpResults = document.getElementById('nlpResults');

// Example buttons
document.querySelectorAll('.nlp-example-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        nlpInput.value = btn.dataset.text;
        analyzeText();
    });
});

nlpAnalyze.addEventListener('click', analyzeText);

// Allow Enter key to analyze (Shift+Enter for newline)
nlpInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        analyzeText();
    }
});

function analyzeText() {
    const text = nlpInput.value.trim();
    if (!text) return;

    nlpResults.classList.add('active');

    renderTokens(text);
    renderSentiment(text);
    renderEntities(text);
    renderStats(text);
}

// --- Tokenization ---
const STOP_WORDS = new Set([
    'el', 'la', 'los', 'las', 'un', 'una', 'de', 'del', 'en', 'y', 'que',
    'a', 'con', 'por', 'para', 'es', 'se', 'no', 'al', 'lo', 'como', 'su',
    'the', 'a', 'an', 'in', 'on', 'of', 'and', 'to', 'for', 'is', 'it',
    'with', 'that', 'this', 'from', 'are', 'was', 'has', 'have', 'had',
    'be', 'been', 'but', 'or', 'at', 'by', 'not', 'do', 'does'
]);

const VERBS_HINT = new Set([
    'es', 'ha', 'han', 'ser', 'tiene', 'hacer', 'trabajar', 'buscar', 'construir',
    'combinar', 'diseñar', 'implementar', 'integrar', 'desarrollar', 'enseñar',
    'is', 'are', 'was', 'has', 'have', 'require', 'achieved', 'build', 'work',
    'love', 'approach', 'combine', 'design', 'implement', 'develop', 'teach',
    'create', 'deploy', 'train', 'process', 'analyze', 'generate', 'transform',
    'revolucionado', 'encanta', 'utiliza', 'mejora', 'aplicada', 'presenta'
]);

const ADJ_HINT = new Set([
    'nuevo', 'nueva', 'increíble', 'mejor', 'grande', 'bueno', 'excelente',
    'natural', 'automático', 'automática', 'interactivo', 'cognitivo',
    'new', 'great', 'best', 'better', 'explainable', 'technical', 'economic',
    'incredible', 'automatic', 'interactive', 'cognitive', 'digital'
]);

function classifyToken(word) {
    const lower = word.toLowerCase();
    if (/^\d+[\.,]?\d*%?$/.test(word)) return 'number';
    if (word[0] === word[0].toUpperCase() && word.length > 1 && !STOP_WORDS.has(lower)) return 'entity';
    if (VERBS_HINT.has(lower)) return 'verb';
    if (ADJ_HINT.has(lower)) return 'adj';
    if (STOP_WORDS.has(lower)) return 'other';
    if (lower.length > 5) return 'noun';
    return 'other';
}

function renderTokens(text) {
    const container = document.getElementById('tokensContainer');
    const words = text.match(/[\wáéíóúüñÁÉÍÓÚÜÑ]+|[^\s\wáéíóúüñÁÉÍÓÚÜÑ]+/g) || [];
    container.innerHTML = '';

    words.forEach((word, i) => {
        const span = document.createElement('span');
        const type = /^[^\wáéíóúüñ]+$/i.test(word) ? 'other' : classifyToken(word);
        span.className = `nlp-token ${type}`;
        span.textContent = word;
        span.style.animationDelay = `${i * 0.03}s`;
        container.appendChild(span);
    });
}

// --- Sentiment Analysis ---
const POSITIVE = new Set([
    'bueno', 'buena', 'genial', 'excelente', 'increíble', 'maravilloso', 'fantástico',
    'amor', 'feliz', 'hermoso', 'mejor', 'bien', 'perfecto', 'encanta', 'innovar',
    'pasión', 'apasiona', 'éxito', 'orgulloso', 'orgullo', 'inspirar', 'brillante',
    'eficiente', 'escalable', 'creativo', 'revolucionado', 'prometedor', 'optimizar',
    'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'love',
    'happy', 'beautiful', 'best', 'perfect', 'innovative', 'passionate', 'success',
    'proud', 'inspiring', 'brilliant', 'efficient', 'scalable', 'creative',
    'revolutionary', 'promising', 'excited', 'pleasure', 'impressive', 'improve',
    'better', 'outstanding', 'remarkable', 'exceptional'
]);

const NEGATIVE = new Set([
    'malo', 'mala', 'terrible', 'horrible', 'peor', 'odio', 'triste', 'feo',
    'pobre', 'difícil', 'problema', 'error', 'riesgo', 'vulnerabilidad', 'amenaza',
    'bad', 'terrible', 'horrible', 'awful', 'worst', 'hate', 'sad', 'ugly',
    'poor', 'difficult', 'problem', 'error', 'risk', 'vulnerability', 'threat',
    'failure', 'danger', 'critical', 'attack', 'breach', 'malicious'
]);

function renderSentiment(text) {
    const words = text.toLowerCase().match(/[\wáéíóúüñ]+/g) || [];
    let pos = 0, neg = 0;
    words.forEach(w => {
        if (POSITIVE.has(w)) pos++;
        if (NEGATIVE.has(w)) neg++;
    });

    const total = pos + neg || 1;
    const score = (pos - neg) / total;
    const normalized = Math.round((score + 1) * 50);

    const emoji = document.getElementById('sentimentEmoji');
    const bar = document.getElementById('sentimentBar');
    const label = document.getElementById('sentimentLabel');

    let sentimentText, color;
    if (score > 0.2) {
        emoji.textContent = '😊';
        sentimentText = currentLang === 'es' ? 'Positivo' : 'Positive';
        color = 'linear-gradient(90deg, #10b981, #34d399)';
    } else if (score < -0.2) {
        emoji.textContent = '😟';
        sentimentText = currentLang === 'es' ? 'Negativo' : 'Negative';
        color = 'linear-gradient(90deg, #ef4444, #f87171)';
    } else {
        emoji.textContent = '😐';
        sentimentText = currentLang === 'es' ? 'Neutro' : 'Neutral';
        color = 'linear-gradient(90deg, #f59e0b, #fbbf24)';
    }

    label.textContent = `${sentimentText} (${normalized}%)`;
    label.style.color = score > 0.2 ? '#34d399' : score < -0.2 ? '#f87171' : '#fbbf24';

    requestAnimationFrame(() => {
        bar.style.width = `${Math.max(normalized, 8)}%`;
        bar.style.background = color;
    });
}

// --- Named Entity Recognition ---
const KNOWN_ORGS = new Set([
    'google', 'openai', 'microsoft', 'amazon', 'aws', 'azure', 'meta', 'nvidia',
    'tesla', 'apple', 'ibm', 'unir', 'ionos', 'scitepress', 'mdpi',
    'cloud levante', 'universidad', 'university'
]);

const KNOWN_TECH = new Set([
    'python', 'tensorflow', 'pytorch', 'docker', 'kubernetes', 'spark',
    'sql', 'javascript', 'java', 'matlab', 'transformers', 'bert', 'gpt',
    'nlp', 'ml', 'ai', 'ia', 'rag', 'llm', 'llms', 'deep learning',
    'machine learning', 'nist', 'fair', 'iso'
]);

function renderEntities(text) {
    const container = document.getElementById('nerContainer');
    container.innerHTML = '';
    const found = new Map();

    // Check known orgs and tech (multi-word first)
    const lowerText = text.toLowerCase();
    [...KNOWN_ORGS].forEach(term => {
        if (lowerText.includes(term) && !found.has(term)) {
            found.set(term, 'ORG');
        }
    });
    [...KNOWN_TECH].forEach(term => {
        if (lowerText.includes(term) && !found.has(term)) {
            found.set(term, 'TECH');
        }
    });

    // Detect capitalized proper nouns (2+ chars, not sentence-start after simple split)
    const sentences = text.split(/[.!?]+/);
    sentences.forEach(sentence => {
        const words = sentence.trim().split(/\s+/);
        words.forEach((word, idx) => {
            const clean = word.replace(/[^a-záéíóúüñA-ZÁÉÍÓÚÜÑ]/g, '');
            if (clean.length < 2) return;
            const lower = clean.toLowerCase();
            if (idx > 0 && clean[0] === clean[0].toUpperCase() && clean[0] !== clean[0].toLowerCase()) {
                if (!STOP_WORDS.has(lower) && !found.has(lower)) {
                    found.set(clean, 'MISC');
                }
            }
        });
    });

    // Detect numbers/percentages
    const numbers = text.match(/\d+[\.,]?\d*%?/g) || [];
    numbers.forEach(n => {
        if (!found.has(n)) found.set(n, 'NUM');
    });

    if (found.size === 0) {
        container.innerHTML = `<span style="color: var(--gray); font-size: 0.9rem">${
            currentLang === 'es' ? 'No se detectaron entidades significativas' : 'No significant entities detected'
        }</span>`;
        return;
    }

    found.forEach((type, entity) => {
        const el = document.createElement('span');
        el.className = `ner-entity ${type.toLowerCase()}`;
        el.innerHTML = `${entity} <span class="ner-label">${type}</span>`;
        el.style.animationDelay = `${container.children.length * 0.05}s`;
        container.appendChild(el);
    });
}

// --- Text Statistics ---
function renderStats(text) {
    const container = document.getElementById('statsContainer');
    const words = text.match(/[\wáéíóúüñ]+/g) || [];
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const chars = text.length;
    const avgWordLen = words.length > 0
        ? (words.reduce((sum, w) => sum + w.length, 0) / words.length).toFixed(1)
        : 0;
    const uniqueWords = new Set(words.map(w => w.toLowerCase())).size;
    const lexicalDiversity = words.length > 0
        ? ((uniqueWords / words.length) * 100).toFixed(0)
        : 0;

    const stats = [
        { value: words.length, label: currentLang === 'es' ? 'Palabras' : 'Words' },
        { value: sentences.length, label: currentLang === 'es' ? 'Oraciones' : 'Sentences' },
        { value: chars, label: currentLang === 'es' ? 'Caracteres' : 'Characters' },
        { value: avgWordLen, label: currentLang === 'es' ? 'Long. media' : 'Avg. length' },
        { value: uniqueWords, label: currentLang === 'es' ? 'Únicas' : 'Unique' },
        { value: `${lexicalDiversity}%`, label: currentLang === 'es' ? 'Diversidad léx.' : 'Lexical div.' },
    ];

    container.innerHTML = stats.map(s => `
        <div class="stat-mini">
            <span class="stat-mini-number">${s.value}</span>
            <span class="stat-mini-label">${s.label}</span>
        </div>
    `).join('');
}
