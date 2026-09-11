// Particle Text – Text aus Punkten, die dem Cursor explosiv ausweichen und
// zurückfedern. Parameter und Verhalten orientieren sich am Effekt auf
// unitedcarriers.com (dort mit einem Logo-Bild statt Text).
//
// Ablauf: Text auf ein Offscreen-Canvas zeichnen, im Raster `gap` abtasten,
// pro gefülltem Pixel ein Partikel mit Heimatposition. Die Partikel starten an
// Zufallspositionen und fliegen beim Laden zusammen. Pro Frame: Abstossung von
// der (bewegten) Maus, Feder zur Heimatposition, Dämpfung – Feder und Dämpfung
// sind pro Partikel leicht zufällig, das macht die Bewegung organisch.

export interface ParticleTextOptions {
    /** Text; "\n" erzwingt einen Zeilenumbruch */
    text: string;
    fontFamily?: string;
    fontWeight?: number | string;
    /** Maximale Schriftgrösse in px (wird sonst an die Breite angepasst) */
    maxFontSize?: number;
    /** Zeilenhöhe als Faktor der Schriftgrösse */
    lineHeight?: number;
    /** Rasterabstand in CSS-px – kleiner = mehr Punkte */
    gap?: number;
    /** Punktradius in CSS-px */
    dotRadius?: number;
    color?: string;
    /** Wirkradius der Maus in CSS-px */
    mouseRadius?: number;
    /** Maximale Abstossung in px/Frame (wird pro Partikel mit 0.5–1.5 multipliziert) */
    force?: number;
    /** Rand um den Text in CSS-px, damit weggestossene Punkte nicht abgeschnitten werden */
    padding?: number;
}

interface Particle {
    x: number; y: number;      // aktuelle Position
    hx: number; hy: number;    // Heimatposition
    vx: number; vy: number;    // Geschwindigkeit
    ease: number;              // aktuelle Federstärke
    idleEase: number;          // Federstärke, solange unberührt (langsam)
    touchedEase: number;       // Federstärke nach Mauskontakt (schnell zurück)
    friction: number;
}

export function mountParticleText(canvas: HTMLCanvasElement, opts: ParticleTextOptions) {
    const {
        text,
        fontFamily = 'sans-serif',
        fontWeight = 600,
        maxFontSize = 260,
        lineHeight = 0.95,
        gap = 4,
        dotRadius = 1.1,
        color = '#ffffff',
        mouseRadius = 55,
        force = 150,
        padding = 200,
    } = opts;

    const ctx = canvas.getContext('2d');
    if (!ctx) return () => {};

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let particles: Particle[] = [];
    let width = 0;   // Canvas-Grösse in CSS-px (inkl. padding)
    let height = 0;
    const mouse = { x: -1e4, y: -1e4, active: false, timeout: 0 };

    /** Partikel aus dem gerenderten Text erzeugen; Schriftgrösse an die Containerbreite anpassen */
    const build = () => {
        const containerW = Math.max(1, Math.floor(canvas.parentElement?.getBoundingClientRect().width ?? 300));
        const lines = text.split('\n');

        const off = document.createElement('canvas');
        const oc = off.getContext('2d')!;
        // Tintenbreite statt nominaler Breite messen – kursive Fonts (z.B. Airstrike)
        // ragen rechts über ihre Vorschubbreite hinaus und würden sonst abgeschnitten
        const measure = (size: number) => {
            oc.font = `${fontWeight} ${size}px ${fontFamily}`;
            return Math.max(
                ...lines.map((l) => {
                    const m = oc.measureText(l);
                    return m.actualBoundingBoxLeft + m.actualBoundingBoxRight;
                }),
            );
        };
        // Grösste Schriftgrösse, bei der die längste Zeile in die Breite passt (mit 2 % Reserve)
        const w0 = measure(100);
        const fontSize = Math.min(maxFontSize, Math.floor((containerW * 0.98 / w0) * 100));
        oc.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
        // Linker Überhang, damit die Tinte am Containerrand beginnt
        const inkLeft = Math.max(...lines.map((l) => oc.measureText(l).actualBoundingBoxLeft));

        const lh = fontSize * lineHeight;
        const textH = Math.ceil(lines.length * lh);
        width = containerW + padding * 2;
        height = textH + padding * 2;

        off.width = width;
        off.height = height;
        oc.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
        oc.fillStyle = '#fff';
        oc.textBaseline = 'middle';
        lines.forEach((l, i) => oc.fillText(l, padding + inkLeft, padding + lh * i + lh / 2));

        const data = oc.getImageData(0, 0, width, height).data;
        const next: Particle[] = [];
        // Ganzes Canvas abtasten (Überhänge liegen im Padding-Bereich)
        for (let y = 0; y < height; y += gap) {
            for (let x = 0; x < width; x += gap) {
                if (data[(y * width + x) * 4 + 3] > 128) {
                    // Bei Resize bestehende Positionen behalten, sonst Zufallsstart (Assemble-Effekt)
                    const old = particles[next.length];
                    const idleEase = 0.04 + Math.random() * 0.04;
                    next.push({
                        x: old?.x ?? Math.random() * width,
                        y: old?.y ?? Math.random() * height,
                        hx: x, hy: y,
                        vx: 0, vy: 0,
                        ease: old?.ease ?? idleEase,
                        idleEase,
                        touchedEase: 0.2 + Math.random() * 0.2,
                        friction: 0.8 + Math.random() * 0.15,
                    });
                }
            }
        }
        particles = next;

        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        canvas.style.margin = `${-padding}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        draw();
    };

    const draw = () => {
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = color;
        ctx.beginPath();
        for (const p of particles) {
            ctx.moveTo(p.x + dotRadius, p.y);
            ctx.arc(p.x, p.y, dotRadius, 0, Math.PI * 2);
        }
        ctx.fill();
    };

    const step = () => {
        const r2 = mouseRadius * mouseRadius;
        for (const p of particles) {
            if (mouse.active) {
                const dx = mouse.x - p.x;
                const dy = mouse.y - p.y;
                const d2 = dx * dx + dy * dy;
                if (d2 < r2) {
                    const d = Math.sqrt(d2) || 1;
                    // Starker Stoss weg von der Maus, zufällig variiert, plus etwas Jitter
                    const f = -((mouseRadius - d) / mouseRadius) * force * (0.5 + Math.random());
                    p.vx += (dx / d) * f + (Math.random() - 0.5);
                    p.vy += (dy / d) * f + (Math.random() - 0.5);
                    p.ease = p.touchedEase;
                }
            }
            p.vx *= p.friction;
            p.vy *= p.friction;
            p.x += p.vx + (p.hx - p.x) * p.ease;
            p.y += p.vy + (p.hy - p.y) * p.ease;
        }
        draw();
    };

    // Zeiger relativ zum Canvas; gilt nur als aktiv, solange er sich bewegt
    const setPointer = (clientX: number, clientY: number) => {
        const r = canvas.getBoundingClientRect();
        mouse.x = clientX - r.left;
        mouse.y = clientY - r.top;
        mouse.active = true;
        clearTimeout(mouse.timeout);
        mouse.timeout = window.setTimeout(() => { mouse.active = false; }, 100);
    };
    const onPointerMove = (e: PointerEvent) => setPointer(e.clientX, e.clientY);
    // Touch separat: beim Scrollen bricht der Browser Pointer-Events ab (pointercancel),
    // touchmove feuert aber weiter – so reagieren die Punkte auch beim Wischen übers Handy
    const onTouch = (e: TouchEvent) => {
        const t = e.touches[0];
        if (t) setPointer(t.clientX, t.clientY);
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('touchstart', onTouch, { passive: true });
    window.addEventListener('touchmove', onTouch, { passive: true });

    // Render-Loop nur, wenn sichtbar
    let raf = 0;
    let inView = true;
    let pageVisible = !document.hidden;
    const loop = () => { step(); raf = requestAnimationFrame(loop); };
    const start = () => { if (inView && pageVisible && raf === 0) raf = requestAnimationFrame(loop); };
    const stop = () => { if (raf !== 0) { cancelAnimationFrame(raf); raf = 0; } };
    const io = new IntersectionObserver(([e]) => { inView = e.isIntersecting; inView ? start() : stop(); });
    io.observe(canvas);
    const onVis = () => { pageVisible = !document.hidden; pageVisible ? start() : stop(); };
    document.addEventListener('visibilitychange', onVis);

    const ro = new ResizeObserver(build);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    // Erst bauen, wenn der Font geladen ist – sonst wird mit dem Fallback-Font abgetastet
    document.fonts.ready.then(() => { build(); start(); });

    return () => {
        stop();
        io.disconnect();
        ro.disconnect();
        clearTimeout(mouse.timeout);
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('touchstart', onTouch);
        window.removeEventListener('touchmove', onTouch);
        document.removeEventListener('visibilitychange', onVis);
    };
}
