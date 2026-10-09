// Site chrome behaviour (spec §6.3, §6.4, §6.9, §8.1): theme toggle, header shadow
// on scroll, scroll progress, back-to-top and the navigation drawer. One passive,
// rAF-throttled scroll listener drives everything scroll-related.

const root = document.documentElement;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ── Theme ─────────────────────────────────────────────────── */
const THEME_KEY = "marc-theme";

function syncThemeControls() {
    const dark = root.getAttribute("data-theme") === "marc-dark";
    document.querySelectorAll<HTMLButtonElement>("[data-theme-toggle]").forEach((btn) => {
        btn.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
    });
}

document.querySelectorAll<HTMLButtonElement>("[data-theme-toggle]").forEach((btn) => {
    btn.addEventListener("click", () => {
        const next = root.getAttribute("data-theme") === "marc-dark" ? "marc" : "marc-dark";
        root.setAttribute("data-theme", next);
        try {
            localStorage.setItem(THEME_KEY, next);
        } catch {
            /* storage unavailable: theme still applies for this page */
        }
        syncThemeControls();
    });
});
syncThemeControls();

/* ── Scroll-driven chrome ──────────────────────────────────── */
const header = document.querySelector<HTMLElement>("[data-site-header]");
const toTop = document.querySelector<HTMLElement>("[data-back-to-top]");
const progress = document.querySelector<HTMLElement>("[data-scroll-progress]");

let ticking = false;
function onScrollFrame() {
    const y = window.scrollY;
    header?.classList.toggle("is-stuck", y > 40);
    toTop?.classList.toggle("is-visible", y > 620);
    if (progress) {
        const max = root.scrollHeight - window.innerHeight;
        progress.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
    }
    ticking = false;
}
window.addEventListener(
    "scroll",
    () => {
        if (!ticking) {
            ticking = true;
            requestAnimationFrame(onScrollFrame);
        }
    },
    { passive: true },
);
onScrollFrame();

toTop?.addEventListener("click", (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    document.getElementById("main")?.focus({ preventScroll: true });
});

/* ── Scroll reveal (spec §8.2) ─────────────────────────────── */
// Items marked .reveal fade up once as they enter the view. Without JS, or with
// reduced motion, they are simply visible (see app.css).
const revealItems = document.querySelectorAll<HTMLElement>(".reveal");
if (reduceMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach((el) => el.classList.add("is-in"));
} else {
    const io = new IntersectionObserver(
        (entries) => {
            for (const entry of entries) {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-in");
                    io.unobserve(entry.target);
                }
            }
        },
        { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    revealItems.forEach((el) => io.observe(el));
}

/* ── Mobile drawer ─────────────────────────────────────────── */
const drawer = document.querySelector<HTMLElement>("[data-drawer]");
const toggle = document.querySelector<HTMLButtonElement>("[data-drawer-toggle]");
const panel = drawer?.querySelector<HTMLElement>('[role="dialog"]');

if (location.hash === "#site-drawer") {
    history.replaceState(null, "", location.pathname + location.search);
}

const FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

function focusables(): HTMLElement[] {
    if (!panel) return [];
    return Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null && !el.closest("[aria-hidden='true']"),
    );
}

function lockScroll(lock: boolean) {
    if (lock) {
        const gap = window.innerWidth - root.clientWidth;
        root.style.overflow = "hidden";
        if (gap > 0) root.style.paddingRight = `${gap}px`;
    } else {
        root.style.overflow = "";
        root.style.paddingRight = "";
    }
}

function onDrawerKey(e: KeyboardEvent) {
    if (e.key === "Escape") {
        e.preventDefault();
        closeDrawer(true);
        return;
    }
    if (e.key !== "Tab") return;
    const items = focusables();
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && (document.activeElement === first || !panel?.contains(document.activeElement))) {
        e.preventDefault();
        last.focus();
    } else if (!e.shiftKey && (document.activeElement === last || !panel?.contains(document.activeElement))) {
        e.preventDefault();
        first.focus();
    }
}

function openDrawer() {
    if (!drawer || !toggle) return;
    drawer.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Close menu");
    lockScroll(true);
    document.addEventListener("keydown", onDrawerKey);
    const firstLink = panel?.querySelector<HTMLElement>(".drawer__link");
    window.setTimeout(() => firstLink?.focus(), reduceMotion ? 0 : 260);
}

function closeDrawer(returnFocus: boolean) {
    if (!drawer || !toggle || !drawer.classList.contains("is-open")) return;
    drawer.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
    lockScroll(false);
    document.removeEventListener("keydown", onDrawerKey);
    if (returnFocus) toggle.focus();
}

toggle?.addEventListener("click", () => {
    if (drawer?.classList.contains("is-open")) closeDrawer(true);
    else openDrawer();
});
drawer?.querySelectorAll("[data-drawer-close]").forEach((el) =>
    el.addEventListener("click", () => closeDrawer(true)),
);
drawer?.querySelectorAll<HTMLAnchorElement>(".drawer__link, .drawer__foot a:not([target])").forEach((a) =>
    a.addEventListener("click", () => closeDrawer(false)),
);
window.matchMedia("(min-width: 1081px)").addEventListener("change", (e) => {
    if (e.matches) closeDrawer(false);
});
