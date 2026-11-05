/*
 * Shared behavior and helpers of the RM World landing.
 * Reimplements the IIFEs of the prototype's script.js that are not owned by a
 * single block, keeping their conditions and values literally.
 */
import { getLocale } from './locale.js';

/* ---------- DOM helpers ---------- */

/**
 * Creates an element.
 * @param {string} tag Tag name
 * @param {Object} attrs Attributes; a null or undefined value skips the attribute
 * @param {...(Node|string)} children Child nodes
 * @returns {Element} The element
 */
export function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  Object.entries(attrs).forEach(([name, value]) => {
    if (value !== null && value !== undefined) el.setAttribute(name, value);
  });
  el.append(...children.filter((c) => c !== null && c !== undefined));
  return el;
}

/**
 * Icon from the shared sprite.
 * @param {string} name Symbol id
 * @param {string} cls Class of the svg
 * @returns {SVGElement} The svg
 */
export function icon(name, cls = 'icon') {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('class', cls);
  svg.setAttribute('aria-hidden', 'true');
  if (cls === 'tarjeta2__logo-play') svg.setAttribute('focusable', 'false');
  const use = document.createElementNS(ns, 'use');
  use.setAttribute('href', `${window.hlx.codeBasePath}/icons/sprite.svg#${name}`);
  svg.append(use);
  return svg;
}

/**
 * Parses a literal inline SVG.
 * @param {string} markup SVG markup
 * @returns {Element} The svg element
 */
export function svgFrom(markup) {
  return new DOMParser().parseFromString(markup, 'text/html').body.firstElementChild;
}

/**
 * Prepares an authored image: prototype class and attributes on the <img>,
 * keeping its <picture> if there is one.
 * @param {Element} container Element holding the image, or the image itself
 * @param {Object} attrs Attributes for the img (null removes the attribute)
 * @returns {Element|null} The node to insert (<picture> or <img>)
 */
export function authoredImage(container, attrs = {}) {
  if (!container) return null;
  const img = container.tagName === 'IMG' ? container : container.querySelector('img');
  if (!img) return null;
  Object.entries(attrs).forEach(([name, value]) => {
    if (value === null) img.removeAttribute(name);
    else if (value !== undefined) img.setAttribute(name, value);
  });
  return img.closest('picture') || img;
}

/**
 * Decoration image from /rmworld/images.
 * @param {string} file File name
 * @param {Object} attrs Attributes of the img
 * @returns {HTMLImageElement} The image
 */
export function decorImage(file, attrs = {}) {
  return h('img', { ...attrs, src: `${window.hlx.codeBasePath}/images/${file}` });
}

/**
 * Copies the children of an element converting inline markup.
 * @param {Element} from Source element
 * @param {Object<string, function(Element): Node>} map Replacer by lower-case tag name
 * @returns {Node[]} The new nodes
 */
export function inlineNodes(from, map = {}) {
  return [...from.childNodes].map((node) => {
    if (node.nodeType !== Node.ELEMENT_NODE) return node.cloneNode(true);
    const replace = map[node.tagName.toLowerCase()];
    if (replace) return replace(node);
    const copy = node.cloneNode(false);
    copy.append(...inlineNodes(node, map));
    return copy;
  });
}

/**
 * Heading content with its <em> turned into the accent span.
 * @param {Element} heading The authored heading
 * @returns {Node[]} The new nodes
 */
export function accentNodes(heading) {
  return inlineNodes(heading, {
    em: (em) => h('span', { class: 'acento' }, ...inlineNodes(em)),
  });
}

/**
 * Wraps every [bracketed] text of a node in <span class="tbc">, in place.
 * @param {Element} root The element
 * @returns {Element} The same element
 */
export function markTbc(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const texts = [];
  while (walker.nextNode()) texts.push(walker.currentNode);
  texts.forEach((text) => {
    const parts = text.nodeValue.split(/(\[[^\]]*\])/);
    if (parts.length === 1) return;
    text.replaceWith(...parts.filter(Boolean).map((part) => (part.startsWith('[')
      ? h('span', { class: 'tbc' }, part)
      : document.createTextNode(part))));
  });
  return root;
}

/**
 * New link from an authored one: href copied untouched, <em> as hidden text,
 * target and rel for PDFs and realmadrid.com.
 * @param {HTMLAnchorElement} source The authored link
 * @param {Object} attrs Attributes of the new link
 * @param {Node} [before] Node placed before the text (an icon)
 * @returns {HTMLAnchorElement} The new link
 */
export function linkFrom(source, attrs = {}, before = null) {
  const href = source.getAttribute('href');
  const external = href.endsWith('.pdf') || href === 'https://www.realmadrid.com';
  const nodes = inlineNodes(source, {
    em: (em) => h('span', { class: 'visually-hidden' }, ...inlineNodes(em)),
  });
  return h('a', {
    ...attrs,
    href,
    target: external ? '_blank' : null,
    rel: external ? 'noopener' : null,
  }, before, ...nodes);
}

/**
 * Language links stay in the preview, which serves the pages under /drafts.
 * Published, the authored href is returned untouched.
 * @param {string} href Authored href, /rmworld/<lang>/
 * @returns {string} The href to use
 */
export function languageHref(href) {
  return getLocale().base.startsWith('/drafts/') ? `/drafts${href}` : href;
}

/**
 * Language links of the header and footer lists.
 * @param {Element} list The authored <ul>
 * @param {string} ariaLabel aria-label of the new list
 * @param {string} cls Class of the new list
 * @returns {HTMLUListElement} The new list
 */
export function languageLinks(list, ariaLabel, cls) {
  const { lang: current } = getLocale();
  const ul = h('ul', { class: cls, role: 'list', 'aria-label': ariaLabel });
  list.querySelectorAll('a').forEach((a) => {
    const href = a.getAttribute('href');
    const [, lang] = href.match(/\/rmworld\/(\w+)/) || [];
    ul.append(h('li', {}, h('a', {
      href: languageHref(href),
      'aria-current': lang === current ? 'page' : null,
      lang,
      hreflang: lang,
    }, a.textContent)));
  });
  return ul;
}

/* ---------- Behavior ---------- */

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Query string kept to append it to the alta links, as the prototype does. */
const altaQuery = () => window.location.search.replace(/^\?/, '');

/**
 * IIFE 1 (origin and mode): reads the query and writes it to <html>.
 */
export function initOriginMode() {
  const params = {};
  const query = altaQuery();
  (query ? query.split('&') : []).forEach((pair) => {
    const kv = pair.split('=');
    params[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1] || '');
  });

  const html = document.documentElement;
  const origen = params.origen || (params.utm_medium === 'qr' ? 'parque' : '');
  const modo = params.modo || '';

  if (origen === 'parque' || origen === 'comunicaciones') html.setAttribute('data-origen', origen);
  if (modo === 'pase' || modo === 'captacion') html.setAttribute('data-modo', modo);
}

/**
 * IIFE 1 (alta links): keeps the origin by appending the current query.
 * @param {HTMLAnchorElement} a Link carrying data-alta
 */
export function applyAltaQuery(a) {
  const query = altaQuery();
  const href = a.getAttribute('href');
  if (query && href.indexOf('#') !== 0) {
    a.setAttribute('href', href + (href.indexOf('?') > -1 ? '&' : '?') + query);
  }
}

let ballObserver;

/**
 * IIFE 10: balls float while on screen. One shared observer.
 * @param {Element} img The ball
 */
export function observeBall(img) {
  if (!('IntersectionObserver' in window) || reducedMotion()) return;
  if (!ballObserver) {
    ballObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle('flota', entry.isIntersecting);
      });
    }, { threshold: 0.4 });
  }
  ballObserver.observe(img);
}

let revealObserver;

/**
 * IIFE 11: appears each time it enters the screen; resets only once fully out.
 * @param {Element} el The element
 */
export function observeReveal(el) {
  el.setAttribute('data-reveal', '');
  if (!('IntersectionObserver' in window)) return;
  if (!revealObserver) {
    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.1) {
          entry.target.classList.add('is-visible');
        } else if (!entry.isIntersecting) {
          entry.target.classList.remove('is-visible');
        }
      });
    }, { threshold: [0, 0.15] });
  }
  el.classList.add('reveal');
  revealObserver.observe(el);
}

/**
 * IIFE 12: exposes clicks on [data-track] as a document event.
 */
export function initTracking() {
  document.addEventListener('click', (ev) => {
    const el = ev.target.closest ? ev.target.closest('[data-track]') : null;
    if (!el) return;
    document.dispatchEvent(new CustomEvent('rmw:track', {
      detail: {
        nombre: el.getAttribute('data-track'),
        origen: document.documentElement.getAttribute('data-origen'),
        modo: document.documentElement.getAttribute('data-modo'),
      },
    }));
  });
}

/**
 * IIFE 14: tilts towards the pointer, with a soft shine.
 * @param {HTMLElement} el The element
 * @param {number} MAX Maximum angle in degrees
 * @param {MediaQueryList} [soloSi] Only while this query matches
 */
export function tilt(el, MAX, soloSi) {
  if (reducedMotion() || !window.matchMedia('(hover: hover)').matches) return;
  el.addEventListener('pointermove', (e) => {
    if (soloSi && !soloSi.matches) return;
    const r = el.getBoundingClientRect();
    const dx = (e.clientX - r.left) / r.width - 0.5;
    const dy = (e.clientY - r.top) / r.height - 0.5;
    el.style.transition = 'none';
    el.style.transform = `perspective(1200px) rotateX(${(-dy * 2 * MAX).toFixed(2)}deg) rotateY(${(dx * 2 * MAX).toFixed(2)}deg) scale(1.02)`;
    el.style.setProperty('--brillo-x', `${((dx + 0.5) * 100).toFixed(1)}%`);
    el.style.setProperty('--brillo-y', `${((dy + 0.5) * 100).toFixed(1)}%`);
    el.classList.add('is-inclinado');
  });
  el.addEventListener('pointerleave', () => {
    el.style.transition = '';
    el.style.transform = '';
    el.classList.remove('is-inclinado');
  });
}
