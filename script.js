// ===== Language Toggle =====
const langToggle = document.getElementById('langToggle');
let currentLang = 'es';

langToggle.addEventListener('click', () => {
    currentLang = currentLang === 'es' ? 'en' : 'es';

    // Update toggle UI
    document.querySelectorAll('.lang-option').forEach(opt => {
        opt.classList.toggle('active', opt.dataset.lang === currentLang);
    });

    // Update all translatable elements
    document.querySelectorAll('[data-es][data-en]').forEach(el => {
        el.textContent = el.getAttribute(`data-${currentLang}`);
    });

    // Update html lang attribute
    document.documentElement.lang = currentLang;
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

// Close mobile menu when a link is clicked
navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('open');
    });
});

// ===== Scroll animations (Intersection Observer) =====
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

// ===== Smooth scroll for anchor links =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});
