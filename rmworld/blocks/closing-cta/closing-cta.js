import {
  accentNodes, authoredImage, decorImage, h, linkFrom, observeBall, observeReveal,
} from '../../scripts/rmw.js';

const confettiSvg = (tone) => {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', `confeti cta-final__confeti cta-final__confeti--${tone}`);
  svg.setAttribute('viewBox', '0 0 1856 2339');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  return svg;
};

/**
 * Falls once when the section enters the screen (IIFE 7). Without an observer
 * or with reduced motion the confetti stays still.
 * @param {Element} section The section
 * @param {Element[]} pieces The confetti svgs
 */
function observeConfetti(section, pieces) {
  if (!('IntersectionObserver' in window)
    || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  pieces.forEach((svg) => svg.setAttribute('data-confeti-js', ''));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        pieces.forEach((svg) => svg.classList.add('is-cayendo'));
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.25 });
  io.observe(section);
}

/**
 * The confetti is a file: it is injected inline because the CSS reaches every
 * piece (fall, spin, blur) and paints it with currentColor. No confetti if the
 * fetch fails.
 * @param {Element} section The section
 * @param {Element[]} pieces The confetti svgs
 */
async function loadConfetti(section, pieces) {
  try {
    const resp = await fetch(`${window.hlx.codeBasePath}/icons/ilu-confeti.svg`);
    if (!resp.ok) return;
    const doc = new DOMParser().parseFromString(await resp.text(), 'image/svg+xml');
    pieces.forEach((svg) => {
      [...doc.documentElement.childNodes].forEach((node) => {
        svg.append(document.importNode(node, true));
      });
    });
    observeConfetti(section, pieces);
  } catch {
    // no confetti
  }
}

/**
 * Regenerates the prototype's closing section (.cta-final).
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const [textRow, mediaRow] = [...block.children];
  const heading = textRow ? textRow.querySelector('h2') : null;
  const paragraphs = textRow ? [...textRow.querySelectorAll('p')] : [];
  const lead = paragraphs.find((p) => !p.querySelector('a'));
  const ctaSource = textRow ? textRow.querySelector('a') : null;

  const title = h(
    'h2',
    { class: 'section-title cta-final__title', id: 'cta-titulo' },
    ...(heading ? accentNodes(heading) : []),
  );
  const ball = decorImage('ilu-balon.webp', {
    class: 'cta-final__balon', width: 595, height: 594, alt: '', loading: 'lazy',
  });
  const pieces = [confettiSvg('oro'), confettiSvg('azul')];
  const section = h(
    'section',
    { class: 'cta-final', id: 'alta', 'aria-labelledby': 'cta-titulo' },
    ...pieces,
    h(
      'div',
      { class: 'container cta-final__inner' },
      title,
      lead ? h('p', { class: 'section-lead cta-final__lead' }, lead.textContent) : null,
      ctaSource ? linkFrom(ctaSource, {
        class: 'btn btn--primary btn--lg', 'data-track': 'final-cta-alta',
      }) : null,
    ),
    h(
      'div',
      { class: 'cta-final__media' },
      authoredImage(mediaRow, {
        class: 'cta-final__photo', width: 1800, height: 1200, loading: 'lazy',
      }),
      ball,
    ),
  );

  block.replaceChildren(section);
  observeReveal(title);
  observeBall(ball);
  loadConfetti(section, pieces);
}
