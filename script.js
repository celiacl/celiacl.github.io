// ===== Animated Hero Grid =====
(function() {
    const c = document.getElementById('heroGrid');
    if (!c) return;
    const ctx = c.getContext('2d');
    let w, h, cols, rows, mx = -1, my = -1;
    const gap = 40;

    function resize() {
        w = c.width = c.parentElement.offsetWidth;
        h = c.height = c.parentElement.offsetHeight;
        cols = Math.ceil(w / gap) + 1;
        rows = Math.ceil(h / gap) + 1;
    }
    resize();
    window.addEventListener('resize', resize);

    document.querySelector('.hero').addEventListener('mousemove', e => {
        const r = c.getBoundingClientRect();
        mx = e.clientX - r.left;
        my = e.clientY - r.top;
    });
    document.querySelector('.hero').addEventListener('mouseleave', () => { mx = -1; my = -1; });

    function draw() {
        ctx.clearRect(0, 0, w, h);
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                const x = i * gap, y = j * gap;
                let dist = mx >= 0 ? Math.hypot(x - mx, y - my) : 999;
                let alpha = Math.max(0.04, 0.35 - dist / 350);
                let size = dist < 200 ? 2 + (1 - dist / 200) * 2.5 : 2;
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                if (dist < 160) {
                    const hue = 270 + (dist / 160) * 60;
                    ctx.fillStyle = `hsla(${hue}, 80%, 70%, ${alpha})`;
                } else {
                    ctx.fillStyle = `rgba(148, 163, 184, ${alpha})`;
                }
                ctx.fill();
            }
        }
        requestAnimationFrame(draw);
    }
    draw();
})();

// ===== Typewriter Effect =====
const typewriterEl = document.getElementById('typewriter');
const roles = ['AI Engineer', 'PhD Candidate', 'NLP Specialist', 'University Lecturer', 'Data Scientist', 'Researcher'];
let roleIndex = 0, charIndex = 0, isDeleting = false;

function typewrite() {
    const current = roles[roleIndex];
    typewriterEl.textContent = current.substring(0, isDeleting ? --charIndex : ++charIndex);
    let speed = isDeleting ? 40 : 80;
    if (!isDeleting && charIndex === current.length) { speed = 2000; isDeleting = true; }
    else if (isDeleting && charIndex === 0) { isDeleting = false; roleIndex = (roleIndex + 1) % roles.length; speed = 400; }
    setTimeout(typewrite, speed);
}
typewrite();

// ===== Language Toggle =====
let currentLang = 'es';
document.getElementById('langToggle').addEventListener('click', () => {
    currentLang = currentLang === 'es' ? 'en' : 'es';
    document.querySelectorAll('.lang-option').forEach(o => o.classList.toggle('active', o.dataset.lang === currentLang));
    document.querySelectorAll('[data-es][data-en]').forEach(el => el.textContent = el.getAttribute(`data-${currentLang}`));
    document.documentElement.lang = currentLang;
    // Update placeholders
    const ta = document.getElementById('nlpInput');
    if (ta) ta.placeholder = currentLang === 'es' ? 'Escribe algo aquí...' : 'Type something here...';
    const es = document.getElementById('embedSearch');
    if (es) es.placeholder = currentLang === 'es' ? 'Buscar palabra...' : 'Search word...';
    const si = document.getElementById('semanticInput');
    if (si) si.placeholder = currentLang === 'es' ? 'ej: NLP clínico, seguridad cloud...' : 'e.g. clinical NLP, cloud security...';
});

// ===== Nav, Menu, Scroll =====
const nav = document.getElementById('nav');
const scrollProgress = document.getElementById('scrollProgress');
const backToTopBtn = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    nav.classList.toggle('scrolled', scrollY > 50);

    // Scroll progress bar
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight > 0) scrollProgress.style.width = `${(scrollY / docHeight) * 100}%`;

    // Back to top visibility
    backToTopBtn.classList.toggle('visible', scrollY > 600);

    // Active nav link
    const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');
    let current = '';
    document.querySelectorAll('.section, .hero').forEach(sec => {
        const top = sec.offsetTop - 120;
        if (scrollY >= top) current = sec.getAttribute('id') || '';
    });
    navAnchors.forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === `#${current}`);
    });

    // Subtle hero parallax
    const hero = document.querySelector('.hero-content');
    if (hero && scrollY < window.innerHeight) {
        hero.style.transform = `translateY(${scrollY * 0.15}px)`;
        hero.style.opacity = 1 - scrollY / (window.innerHeight * 0.8);
    }
});

backToTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

const menuBtn = document.getElementById('menuBtn');
const navLinks = document.querySelector('.nav-links');
menuBtn.addEventListener('click', () => navLinks.classList.toggle('open'));
navLinks.querySelectorAll('a').forEach(l => l.addEventListener('click', () => navLinks.classList.remove('open')));

const sections = document.querySelectorAll('.section');
const obs = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }), { threshold: 0.1 });
sections.forEach(s => obs.observe(s));

// Staggered card animations on scroll
const cardObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            const cards = e.target.querySelectorAll('.timeline-card, .edu-card, .talk-card, .pub-card, .skill-category, .stat-card');
            cards.forEach((card, i) => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(24px)';
                setTimeout(() => {
                    card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, i * 100);
            });
            cardObs.unobserve(e.target);
        }
    });
}, { threshold: 0.05 });
sections.forEach(s => cardObs.observe(s));

// ===== Animated Counters =====
const counterObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.querySelectorAll('.stat-number').forEach(el => {
                const raw = el.textContent.trim();
                const suffix = raw.replace(/[\d.]/g, '');
                const target = parseFloat(raw);
                if (isNaN(target)) return;
                let current = 0;
                const step = target / 40;
                const timer = setInterval(() => {
                    current += step;
                    if (current >= target) { current = target; clearInterval(timer); }
                    el.textContent = (Number.isInteger(target) ? Math.round(current) : current.toFixed(1)) + suffix;
                }, 30);
            });
            counterObs.unobserve(e.target);
        }
    });
}, { threshold: 0.3 });
const aboutSection = document.getElementById('about');
if (aboutSection) counterObs.observe(aboutSection);

// ===== Skill Bars Animation =====
const skillBarObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.querySelectorAll('.skill-bar-fill').forEach((bar, i) => {
                setTimeout(() => {
                    bar.style.width = bar.dataset.level + '%';
                    bar.classList.add('animated');
                }, i * 150);
            });
            skillBarObs.unobserve(e.target);
        }
    });
}, { threshold: 0.2 });
const skillsSection = document.getElementById('skills');
if (skillsSection) skillBarObs.observe(skillsSection);

document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => { const t = document.querySelector(a.getAttribute('href')); if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth' }); } });
});

// ===== Lab Tabs =====
document.querySelectorAll('.lab-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.lab-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.lab-panel').forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(`panel-${tab.dataset.tab}`).classList.add('active');
        if (tab.dataset.tab === 'embeddings' && !embeddingInitialized) initEmbeddings();
    });
});

// ================================================================
//  TAB 1: NLP ANALYZER
// ================================================================
document.getElementById('nlpAnalyze').addEventListener('click', analyzeText);
document.querySelectorAll('.nlp-example-btn').forEach(btn => {
    btn.addEventListener('click', () => { document.getElementById('nlpInput').value = btn.dataset.text; analyzeText(); });
});
document.getElementById('nlpInput').addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); analyzeText(); } });

function analyzeText() {
    const text = document.getElementById('nlpInput').value.trim();
    if (!text) return;
    document.getElementById('nlpResults').classList.add('active');
    renderTokens(text); renderSentiment(text); renderEntities(text); renderStats(text);
}

const STOP_WORDS = new Set('el la los las un una de del en y que a con por para es se no al lo como su the a an in on of and to for is it with that this from are was has have had be been but or at by not do does'.split(' '));
const VERBS = new Set('es ha han ser tiene hacer trabajar buscar construir combinar diseñar implementar integrar desarrollar enseñar is are was has have require achieved build work love approach combine design implement develop teach create deploy train process analyze generate transform revolucionado encanta utiliza mejora aplicada presenta'.split(' '));
const ADJS = new Set('nuevo nueva increíble mejor grande bueno excelente natural automático automática interactivo cognitivo new great best better explainable technical economic incredible automatic interactive cognitive digital'.split(' '));

function classifyToken(w) {
    const l = w.toLowerCase();
    if (/^\d+[\.,]?\d*%?$/.test(w)) return 'number';
    if (w[0] === w[0].toUpperCase() && w.length > 1 && !STOP_WORDS.has(l)) return 'entity';
    if (VERBS.has(l)) return 'verb';
    if (ADJS.has(l)) return 'adj';
    if (STOP_WORDS.has(l)) return 'other';
    return l.length > 5 ? 'noun' : 'other';
}

function renderTokens(text) {
    const c = document.getElementById('tokensContainer');
    const words = text.match(/[\wáéíóúüñÁÉÍÓÚÜÑ]+|[^\s\wáéíóúüñÁÉÍÓÚÜÑ]+/g) || [];
    c.innerHTML = '';
    words.forEach((w, i) => {
        const s = document.createElement('span');
        s.className = `nlp-token ${/^[^\wáéíóúüñ]+$/i.test(w) ? 'other' : classifyToken(w)}`;
        s.textContent = w;
        s.style.animationDelay = `${i * 0.03}s`;
        c.appendChild(s);
    });
}

const POS_W = new Set('bueno buena genial excelente increíble maravilloso fantástico amor feliz hermoso mejor bien perfecto encanta innovar pasión apasiona éxito orgulloso orgullo inspirar brillante eficiente escalable creativo revolucionado prometedor optimizar good great excellent amazing wonderful fantastic love happy beautiful best perfect innovative passionate success proud inspiring brilliant efficient scalable creative revolutionary promising excited pleasure impressive improve better outstanding remarkable exceptional'.split(' '));
const NEG_W = new Set('malo mala terrible horrible peor odio triste feo pobre difícil problema error riesgo vulnerabilidad amenaza bad terrible horrible awful worst hate sad ugly poor difficult problem error risk vulnerability threat failure danger critical attack breach malicious'.split(' '));

function renderSentiment(text) {
    const words = text.toLowerCase().match(/[\wáéíóúüñ]+/g) || [];
    let pos = 0, neg = 0;
    words.forEach(w => { if (POS_W.has(w)) pos++; if (NEG_W.has(w)) neg++; });
    const total = pos + neg || 1, score = (pos - neg) / total, norm = Math.round((score + 1) * 50);
    const emoji = document.getElementById('sentimentEmoji');
    const bar = document.getElementById('sentimentBar');
    const label = document.getElementById('sentimentLabel');
    let txt, color;
    if (score > 0.2) { emoji.textContent = '😊'; txt = currentLang === 'es' ? 'Positivo' : 'Positive'; color = 'linear-gradient(90deg,#10b981,#34d399)'; }
    else if (score < -0.2) { emoji.textContent = '😟'; txt = currentLang === 'es' ? 'Negativo' : 'Negative'; color = 'linear-gradient(90deg,#ef4444,#f87171)'; }
    else { emoji.textContent = '😐'; txt = currentLang === 'es' ? 'Neutro' : 'Neutral'; color = 'linear-gradient(90deg,#f59e0b,#fbbf24)'; }
    label.textContent = `${txt} (${norm}%)`;
    label.style.color = score > 0.2 ? '#34d399' : score < -0.2 ? '#f87171' : '#fbbf24';
    requestAnimationFrame(() => { bar.style.width = `${Math.max(norm, 8)}%`; bar.style.background = color; });
}

const K_ORGS = new Set(['google','openai','microsoft','amazon','aws','azure','meta','nvidia','tesla','apple','ibm','unir','ionos','scitepress','mdpi','cloud levante','universidad','university']);
const K_TECH = new Set(['python','tensorflow','pytorch','docker','kubernetes','spark','sql','javascript','java','matlab','transformers','bert','gpt','nlp','ml','ai','ia','rag','llm','llms','deep learning','machine learning','nist','fair','iso']);

function renderEntities(text) {
    const c = document.getElementById('nerContainer');
    c.innerHTML = '';
    const found = new Map(), lt = text.toLowerCase();
    K_ORGS.forEach(t => { if (lt.includes(t)) found.set(t, 'ORG'); });
    K_TECH.forEach(t => { if (lt.includes(t)) found.set(t, 'TECH'); });
    text.split(/[.!?]+/).forEach(s => {
        s.trim().split(/\s+/).forEach((w, i) => {
            const cl = w.replace(/[^a-záéíóúüñA-ZÁÉÍÓÚÜÑ]/g, '');
            if (cl.length < 2) return;
            if (i > 0 && cl[0] === cl[0].toUpperCase() && cl[0] !== cl[0].toLowerCase() && !STOP_WORDS.has(cl.toLowerCase()) && !found.has(cl.toLowerCase()))
                found.set(cl, 'MISC');
        });
    });
    (text.match(/\d+[\.,]?\d*%?/g) || []).forEach(n => { if (!found.has(n)) found.set(n, 'NUM'); });
    if (!found.size) { c.innerHTML = `<span style="color:var(--gray);font-size:.9rem">${currentLang === 'es' ? 'No se detectaron entidades' : 'No entities detected'}</span>`; return; }
    found.forEach((type, entity) => {
        const el = document.createElement('span');
        el.className = `ner-entity ${type.toLowerCase()}`;
        el.innerHTML = `${entity} <span class="ner-label">${type}</span>`;
        el.style.animationDelay = `${c.children.length * 0.05}s`;
        c.appendChild(el);
    });
}

function detectLang(text) {
    const esWords = new Set('el la los las un una de del en y que por para es con su al lo como más esta este esta pero se ha son tiene muy todo también puede ser hay cuando donde'.split(' '));
    const words = text.toLowerCase().match(/[\wáéíóúüñ]+/g) || [];
    let esCount = 0;
    words.forEach(w => { if (esWords.has(w)) esCount++; });
    return esCount / words.length > 0.12 ? 'ES' : 'EN';
}

function renderStats(text) {
    const c = document.getElementById('statsContainer');
    const words = text.match(/[\wáéíóúüñ]+/g) || [];
    const sents = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const unique = new Set(words.map(w => w.toLowerCase())).size;
    const avg = words.length ? (words.reduce((s, w) => s + w.length, 0) / words.length).toFixed(1) : 0;
    const ld = words.length ? ((unique / words.length) * 100).toFixed(0) : 0;
    const lang = detectLang(text);
    const L = currentLang === 'es';
    const stats = [
        { v: words.length, l: L ? 'Palabras' : 'Words' },
        { v: sents.length, l: L ? 'Oraciones' : 'Sentences' },
        { v: text.length, l: L ? 'Caracteres' : 'Characters' },
        { v: avg, l: L ? 'Long. media' : 'Avg. length' },
        { v: unique, l: L ? 'Únicas' : 'Unique' },
        { v: `${ld}%`, l: L ? 'Diversidad léx.' : 'Lexical div.' },
        { v: lang, l: L ? 'Idioma det.' : 'Lang. det.' },
    ];

    // Word frequency top 5
    const freq = {};
    words.forEach(w => { const lw = w.toLowerCase(); if (!STOP_WORDS.has(lw) && lw.length > 2) freq[lw] = (freq[lw] || 0) + 1; });
    const top5 = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const maxFreq = top5.length ? top5[0][1] : 1;

    const freqHTML = top5.length ? `<div class="freq-chart">${top5.map(([word, count]) =>
        `<div class="freq-row"><span class="freq-word">${word}</span><div class="freq-bar-bg"><div class="freq-bar" style="width:${(count / maxFreq) * 100}%"></div></div><span class="freq-count">${count}</span></div>`
    ).join('')}</div>` : '';

    c.innerHTML = stats.map(s => `<div class="stat-mini"><span class="stat-mini-number">${s.v}</span><span class="stat-mini-label">${s.l}</span></div>`).join('') + freqHTML;
}

// ================================================================
//  TAB 2: EMBEDDING EXPLORER (Canvas 2D)
// ================================================================
let embeddingInitialized = false;

const CLUSTER_DEFS = {
    ai:    { cx: 0.62, cy: 0.30, color: '#a78bfa', label: 'AI / ML',
             words: 'machine learning deep neural network model training inference prediction classification regression supervised unsupervised gradient optimization loss accuracy epoch feature layer perceptron'.split(' ') },
    nlp:   { cx: 0.78, cy: 0.55, color: '#f472b6', label: 'NLP',
             words: 'language natural processing text token tokenization embedding transformer attention BERT GPT sentiment NER translation summarization generation prompt corpus vocabulary semantic parsing scraping agent multi-agent document context'.split(' ') },
    data:  { cx: 0.35, cy: 0.65, color: '#22d3ee', label: 'Data',
             words: 'data science engineering SQL database pipeline ETL warehouse lake analytics visualization statistics pandas numpy spark dataframe query schema pricing prediction volumetric logistics optimization forecasting'.split(' ') },
    cyber: { cx: 0.20, cy: 0.30, color: '#f87171', label: 'Security',
             words: 'security cybersecurity risk vulnerability threat attack encryption firewall compliance NIST ISO cloud infrastructure monitoring audit FAIR privacy'.split(' ') },
    med:   { cx: 0.15, cy: 0.70, color: '#34d399', label: 'Medical',
             words: 'medical clinical biomedical health patient diagnosis robotics telemedicine sensor signal report transcription speech recognition DICOM'.split(' ') },
    cloud: { cx: 0.50, cy: 0.82, color: '#fbbf24', label: 'Cloud / DevOps',
             words: 'AWS Azure Docker Kubernetes deployment production microservice API server container orchestration IONOS scalability compute storage serverless'.split(' ') },
    research: { cx: 0.48, cy: 0.12, color: '#818cf8', label: 'Research',
             words: 'research paper publication conference thesis PhD academic university experiment methodology review journal ICISSP SCITEPRESS MDPI citation'.split(' ') }
};

let points = [];
let canvasW, canvasH, ctx, hoveredPoint = null, selectedPoint = null, searchTerm = '';

function buildPoints() {
    points = [];
    const rand = () => (Math.random() - 0.5) * 0.12;
    Object.entries(CLUSTER_DEFS).forEach(([key, cl]) => {
        cl.words.forEach(w => {
            points.push({ word: w, x: cl.cx + rand(), y: cl.cy + rand(), cluster: key, color: cl.color, r: 5 });
        });
    });
}

function initEmbeddings() {
    embeddingInitialized = true;
    buildPoints();
    const canvas = document.getElementById('embeddingCanvas');
    ctx = canvas.getContext('2d');
    const wrap = canvas.parentElement;

    function resize() {
        const rect = wrap.getBoundingClientRect();
        canvasW = rect.width || 800;
        canvasH = 500;
        canvas.width = canvasW * devicePixelRatio;
        canvas.height = canvasH * devicePixelRatio;
        canvas.style.height = canvasH + 'px';
        ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
        draw();
    }

    // Small delay to ensure panel is rendered and has dimensions
    requestAnimationFrame(() => { resize(); });
    window.addEventListener('resize', resize);

    // Legend
    const legend = document.getElementById('embedLegend');
    legend.innerHTML = Object.values(CLUSTER_DEFS).map(cl =>
        `<span class="legend-item"><span class="legend-dot" style="background:${cl.color}"></span>${cl.label}</span>`
    ).join('');

    // Mouse events
    canvas.addEventListener('mousemove', e => {
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left, my = e.clientY - rect.top;
        hoveredPoint = null;
        for (const p of points) {
            const px = p.x * canvasW, py = p.y * canvasH;
            if (Math.hypot(mx - px, my - py) < 14) { hoveredPoint = p; break; }
        }
        canvas.style.cursor = hoveredPoint ? 'pointer' : 'crosshair';
        draw();
    });

    canvas.addEventListener('click', () => {
        selectedPoint = hoveredPoint;
        draw();
    });

    // Search
    document.getElementById('embedSearch').addEventListener('input', e => {
        searchTerm = e.target.value.toLowerCase();
        selectedPoint = null;
        draw();
    });
}

function draw() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvasW, canvasH);

    // Background grid
    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvasW; x += 50) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvasH); ctx.stroke(); }
    for (let y = 0; y < canvasH; y += 50) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvasW, y); ctx.stroke(); }

    // Draw neighbor lines for selected point
    if (selectedPoint) {
        const sx = selectedPoint.x * canvasW, sy = selectedPoint.y * canvasH;
        const dists = points.map(p => ({ p, d: Math.hypot(p.x - selectedPoint.x, p.y - selectedPoint.y) })).sort((a, b) => a.d - b.d);
        dists.slice(1, 8).forEach(({ p }) => {
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.lineTo(p.x * canvasW, p.y * canvasH);
            ctx.strokeStyle = `${selectedPoint.color}44`;
            ctx.lineWidth = 1.5;
            ctx.stroke();
        });
    }

    // Draw points
    points.forEach(p => {
        const px = p.x * canvasW, py = p.y * canvasH;
        const isSearchMatch = searchTerm && p.word.toLowerCase().includes(searchTerm);
        const isSelected = selectedPoint === p;
        const isNeighbor = selectedPoint && Math.hypot(p.x - selectedPoint.x, p.y - selectedPoint.y) < 0.15 && p !== selectedPoint;
        const isHovered = hoveredPoint === p;
        const dimmed = (searchTerm && !isSearchMatch) || (selectedPoint && !isSelected && !isNeighbor);

        ctx.beginPath();
        const r = isSelected ? 10 : isHovered ? 8 : isSearchMatch ? 7 : 5;
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fillStyle = dimmed ? `${p.color}22` : (isSelected || isSearchMatch ? p.color : `${p.color}99`);
        ctx.fill();

        if (isSelected) {
            ctx.beginPath();
            ctx.arc(px, py, 14, 0, Math.PI * 2);
            ctx.strokeStyle = p.color;
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        // Labels
        if (isHovered || isSelected || isSearchMatch || isNeighbor) {
            ctx.font = `${isSelected || isHovered ? '600 13px' : '500 11px'} 'Space Grotesk', sans-serif`;
            ctx.fillStyle = dimmed ? `${p.color}66` : p.color;
            ctx.textAlign = 'center';
            ctx.fillText(p.word, px, py - r - 6);
        }
    });

    // Tooltip
    if (hoveredPoint) {
        const px = hoveredPoint.x * canvasW, py = hoveredPoint.y * canvasH;
        const cluster = CLUSTER_DEFS[hoveredPoint.cluster].label;
        const label = `${hoveredPoint.word}  [${cluster}]`;
        ctx.font = '500 12px "Inter", sans-serif';
        const tw = ctx.measureText(label).width + 16;
        const tx = Math.min(Math.max(px - tw / 2, 4), canvasW - tw - 4);
        const ty = py + 20;
        const th = 28, tr = 8;
        ctx.beginPath();
        ctx.moveTo(tx + tr, ty);
        ctx.lineTo(tx + tw - tr, ty);
        ctx.quadraticCurveTo(tx + tw, ty, tx + tw, ty + tr);
        ctx.lineTo(tx + tw, ty + th - tr);
        ctx.quadraticCurveTo(tx + tw, ty + th, tx + tw - tr, ty + th);
        ctx.lineTo(tx + tr, ty + th);
        ctx.quadraticCurveTo(tx, ty + th, tx, ty + th - tr);
        ctx.lineTo(tx, ty + tr);
        ctx.quadraticCurveTo(tx, ty, tx + tr, ty);
        ctx.closePath();
        ctx.fillStyle = 'rgba(15,15,26,0.9)';
        ctx.fill();
        ctx.strokeStyle = hoveredPoint.color;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = '#f8fafc';
        ctx.textAlign = 'center';
        ctx.fillText(label, tx + tw / 2, ty + 18);
    }
}

// ================================================================
//  TAB 3: SEMANTIC SEARCH (TF-IDF + Cosine)
// ================================================================
const CORPUS = [
    { title: 'Explainable Risk Translation Layer', tags: ['ICISSP 2026', 'XAI', 'Cybersecurity'],
      text: 'Explainable risk translation layer cloud cybersecurity technical vulnerability signals economic impact security metrics business decision making risk assessment FAIR ISO NIST probabilistic reasoning' },
    { title: 'Automated Clinical Reports with Deep Learning', tags: ['Sensors MDPI', 'NLP', 'ASR'],
      text: 'Automated generation clinical reports sensing technologies deep learning techniques speech recognition transformer models transcription summarization medical consultations patient doctor interactions ROUGE' },
    { title: 'PhD: AI for Cloud Cybersecurity', tags: ['PhD', 'GenAI', 'Cloud'],
      text: 'Doctoral thesis industrial PhD generative AI security models cloud computing architectures cybersecurity strategies risk translation technical economic operational FAIR ISO NIST machine learning NLP probabilistic' },
    { title: 'AI Engineer @ Cloud Levante', tags: ['Industry', 'MLOps', 'Cloud'],
      text: 'AI engineer machine learning computer vision datalakes big data governance ETL cognitive systems RAG vector databases LLM embedding reranking finetuning deployment production docker kubernetes AWS Azure IONOS predictive pricing volumetric logistics optimization route translation multi-agent scraping' },
    { title: 'Predictive & Optimization Systems', tags: ['ML', 'Optimization', 'Industry'],
      text: 'Predictive systems pricing price optimization volumetric logistics route optimization machine learning regression forecasting demand estimation cost reduction efficiency supply chain planning scheduling' },
    { title: 'Advanced Document Translation & Multi-Agent Scraping', tags: ['NLP', 'LLMs', 'Agents'],
      text: 'Advanced translation complex documents context-aware multilingual NLP transformer LLM multi-agent scraping automated data extraction web crawling intelligent agents orchestration pipeline' },
    { title: 'NLP University Lecturer @ UNIR', tags: ['Teaching', 'NLP', 'Academia'],
      text: 'University lecturer natural language processing NLP master artificial intelligence teaching grading exams forum management student support thesis tutor cloud computing AI UNIR' },
    { title: 'Doctoral Researcher @ Universidad de Alicante', tags: ['Research', 'AI', 'Security'],
      text: 'Doctoral researcher AI applied cybersecurity cloud risk management scientific papers conference contributions ICISSP FAIR ISO NIST machine learning NLP probabilistic reasoning' },
    { title: 'Biomedical Engineer @ Bumerania', tags: ['R&D', 'Robotics', 'Medical'],
      text: 'Biomedical engineer research design development medical robotics telemedicine teleassistance assistive robots hospital home care technical linguistic support international negotiations' },
    { title: 'MSc in Artificial Intelligence (UNIR)', tags: ['Education', 'AI', 'Data Eng.'],
      text: 'Master artificial intelligence data engineering deep learning cognitive systems NLP computer vision planning multi-agent PDDL research methods European legislation Spark SQL Python' },
    { title: 'BSc in Biomedical Engineering (UA)', tags: ['Education', 'Biomedical'],
      text: 'Biomedical engineering programming Python Java MATLAB JavaScript HTML SQL APIs REST distributed systems telemedicine telecommunications health security cryptography signals instrumentation DICOM clinical datasets' },
    { title: 'Speaker: Cloud Europa 2026', tags: ['Talk', 'Cloud', 'AI'],
      text: 'Speaker Cloud Europa event AI European infrastructure IONOS Cloud digital sovereignty traceability reliability data governance compliance practical approach Parque Cientifico Alicante' },
];

// Build vocabulary and compute IDF
let vocab = {}, idf = {}, tfidfMatrix = [];

function buildSearchIndex() {
    const df = {};
    CORPUS.forEach(doc => {
        const words = doc.text.toLowerCase().split(/\s+/);
        const unique = new Set(words);
        unique.forEach(w => { df[w] = (df[w] || 0) + 1; if (!(w in vocab)) vocab[w] = Object.keys(vocab).length; });
    });
    const N = CORPUS.length;
    Object.keys(df).forEach(w => idf[w] = Math.log(N / (df[w] + 1)) + 1);
    tfidfMatrix = CORPUS.map(doc => {
        const words = doc.text.toLowerCase().split(/\s+/);
        const tf = {};
        words.forEach(w => tf[w] = (tf[w] || 0) + 1);
        const vec = {};
        Object.keys(tf).forEach(w => vec[w] = (tf[w] / words.length) * (idf[w] || 1));
        return vec;
    });
}

function cosineSim(a, b) {
    let dot = 0, magA = 0, magB = 0;
    const allKeys = new Set([...Object.keys(a), ...Object.keys(b)]);
    allKeys.forEach(k => {
        const va = a[k] || 0, vb = b[k] || 0;
        dot += va * vb; magA += va * va; magB += vb * vb;
    });
    return magA && magB ? dot / (Math.sqrt(magA) * Math.sqrt(magB)) : 0;
}

function semanticSearch(query) {
    const words = query.toLowerCase().split(/\s+/);
    const tf = {};
    words.forEach(w => tf[w] = (tf[w] || 0) + 1);
    const qVec = {};
    Object.keys(tf).forEach(w => qVec[w] = (tf[w] / words.length) * (idf[w] || 1));

    const results = CORPUS.map((doc, i) => ({
        ...doc,
        score: cosineSim(qVec, tfidfMatrix[i])
    })).filter(r => r.score > 0.01).sort((a, b) => b.score - a.score);

    return results;
}

function highlightTerms(text, query) {
    const terms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);
    let result = text;
    terms.forEach(term => {
        const regex = new RegExp(`(${term})`, 'gi');
        result = result.replace(regex, '<mark>$1</mark>');
    });
    return result;
}

buildSearchIndex();

document.getElementById('semanticSearch').addEventListener('click', runSemanticSearch);
document.getElementById('semanticInput').addEventListener('keydown', e => { if (e.key === 'Enter') runSemanticSearch(); });

function runSemanticSearch() {
    const query = document.getElementById('semanticInput').value.trim();
    const container = document.getElementById('searchResults');
    if (!query) { container.innerHTML = ''; return; }

    const results = semanticSearch(query);

    if (!results.length) {
        container.innerHTML = `<div class="search-empty">${currentLang === 'es' ? 'Sin resultados. Prueba con otros términos.' : 'No results. Try different terms.'}</div>`;
        return;
    }

    container.innerHTML = results.slice(0, 6).map((r, i) => {
        const pct = Math.round(r.score * 100);
        const level = pct > 30 ? 'high' : pct > 15 ? 'medium' : 'low';
        return `<div class="search-result-card" style="animation-delay:${i * 0.08}s">
            <div class="search-result-header">
                <span class="search-result-title">${r.title}</span>
                <span class="search-result-score ${level}">${pct}% match</span>
            </div>
            <div class="search-result-text">${highlightTerms(r.text, query)}</div>
            <div class="search-result-tags">${r.tags.map(t => `<span>${t}</span>`).join('')}</div>
        </div>`;
    }).join('');
}
