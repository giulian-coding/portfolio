// Scroll-Animationen mit GSAP + ScrollTrigger.
//
// Verwendung im Markup:
//   data-hero               – Element wird beim Laden eingeblendet (Hero)
//   data-reveal             – Element blendet beim Reinscrollen ein
//   data-reveal="stagger"   – die direkten Kinder blenden nacheinander ein (Grids)
//
// Die Startwerte (opacity: 0) setzt global.css nur, wenn JS läuft (html.js),
// damit die Seite ohne JS vollständig sichtbar bleibt.

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (reduceMotion) {
    // Keine Animation: alles sofort sichtbar
    gsap.set('[data-hero], [data-reveal], [data-reveal="stagger"] > *', { opacity: 1, y: 0 });
} else {
    const ease = 'power3.out';

    // Hero: einmalig beim Laden, Elemente nacheinander
    gsap.fromTo(
        '[data-hero]',
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, ease, stagger: 0.12, delay: 0.1 },
    );

    // Sektionen: beim Reinscrollen, nur einmal
    document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
        const targets = el.dataset.reveal === 'stagger' ? Array.from(el.children) : el;

        gsap.fromTo(
            targets,
            { y: 32, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 0.8,
                ease,
                stagger: 0.08,
                scrollTrigger: {
                    trigger: el,
                    start: 'top 85%',
                    once: true,
                },
            },
        );
    });
}
