import { h, icon, linkFrom } from '../../scripts/rmw.js';

/**
 * Shows the bar once out of the hero, hides it at the closing CTA (IIFE 6).
 * Without an observer it stays always visible.
 * @param {Element} barra The bar
 */
function observeZones(barra) {
  const zonas = [...document.querySelectorAll('.hero2, #alta')];
  if (!zonas.length || !('IntersectionObserver' in window)) return;
  const enPantalla = [];
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      enPantalla[zonas.indexOf(e.target)] = e.target.classList.contains('hero2')
        ? e.intersectionRatio > 0.35
        : e.isIntersecting;
    });
    barra.classList.toggle('is-visible', !enPantalla.some(Boolean));
  }, { threshold: [0, 0.35] });
  barra.setAttribute('data-barra-js', '');
  zonas.forEach((zona) => io.observe(zona));
}

/**
 * Regenerates the prototype's fixed bar and moves it to the end of <body>.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const rows = {};
  [...block.children].forEach((row) => {
    rows[row.children[0].textContent.trim()] = [...row.children].slice(1);
  });
  const [figureCell, ctaCell] = rows.capture || [];
  const [number, label] = figureCell ? [...figureCell.querySelectorAll('p')] : [];
  // No trim here: in ES the word starts with a non-breaking space, literal
  const parkWord = rows.park && rows.park[0] ? rows.park[0].textContent : '';

  const cifra = (strong) => h(
    'span',
    { class: 'barra__cifra' },
    h('bdi', { dir: 'ltr' }, strong.textContent),
    h('span', { class: 'variante--parque' }, parkWord),
  );
  const numberNodes = number ? [...number.childNodes].map((node) => (
    node.nodeName === 'STRONG' ? cifra(node) : node.cloneNode(true))) : [];

  const ctaSource = ctaCell ? ctaCell.querySelector('a') : null;
  const [mapCell, walletCell] = rows.pass || [];
  const mapSource = mapCell ? mapCell.querySelector('a') : null;
  const walletSource = walletCell ? walletCell.querySelector('a') : null;

  const barra = h(
    'div',
    { class: 'barra', 'data-barra': '' },
    h(
      'div',
      { class: 'barra__inner' },
      h(
        'p',
        { class: 'barra__figure variante--captacion' },
        h('span', { class: 'barra__number' }, ...numberNodes),
        h('span', { class: 'barra__label' }, label ? label.textContent : ''),
      ),
      ctaSource ? linkFrom(ctaSource, {
        class: 'btn btn--primary variante--captacion', 'data-track': 'barra-cta-alta',
      }) : null,
      mapSource ? linkFrom(mapSource, {
        class: 'btn btn--secondary btn--sm variante--pase', 'data-track': 'barra-mapa',
      }, icon('i-mapa')) : null,
      walletSource ? linkFrom(walletSource, {
        class: 'btn btn--primary btn--sm variante--pase', 'data-track': 'barra-wallet',
      }, icon('i-wallet')) : null,
    ),
  );

  document.body.append(barra);
  observeZones(barra);
  const section = block.closest('.section');
  if (section) section.remove();
}
