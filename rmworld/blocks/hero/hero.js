import {
  authoredImage, decorImage, h, icon, inlineNodes, linkFrom, svgFrom, tilt,
} from '../../scripts/rmw.js';

const TICKET_ICONS = [
  '<svg class="ticket2__icono" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M7 3v8M4.5 3v5a2.5 2.5 0 0 0 5 0V3M7 11v10M17 21V3c-2.2 1.2-3.5 3.6-3.5 6.5V13H17"/></svg>',
  '<svg class="ticket2__icono" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4.5 8h15l-1 13h-13z"/><path d="M8.5 10V6.5a3.5 3.5 0 0 1 7 0V10"/></svg>',
  '<svg class="ticket2__icono" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M3 7.5V9a3 3 0 0 1 0 6v1.5A1.5 1.5 0 0 0 4.5 18h15a1.5 1.5 0 0 0 1.5-1.5V15a3 3 0 0 1 0-6V7.5A1.5 1.5 0 0 0 19.5 6h-15A1.5 1.5 0 0 0 3 7.5z"/><path d="M14.5 6v2M14.5 11v2M14.5 16v2"/></svg>',
];

const escudo = () => decorImage('escudo-puntos.webp', {
  class: 'hero2__pegatina hero2__pegatina--escudo', width: 1328, height: 1761, alt: '',
});

/** Replaces the :escudo: mark with the sticker, in text nodes at any depth. */
function placeEscudo(nodes) {
  return nodes.flatMap((node) => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const content = placeEscudo([...node.childNodes]);
      node.replaceChildren(...content);
      return [node];
    }
    if (node.nodeType !== Node.TEXT_NODE || !node.nodeValue.includes(':escudo:')) return [node];
    const [before, after] = node.nodeValue.split(':escudo:');
    return [document.createTextNode(before), escudo(), document.createTextNode(after)];
  });
}

function buildTitle(source) {
  const title = h('h1', { class: 'hero2__titulo', id: 'hero-titulo' });
  if (!source) return title;
  const nodes = inlineNodes(source, {
    em: (em) => h('span', { class: 'hero2__save' }, ...inlineNodes(em)),
    strong: (strong) => h('span', { class: 'hero2__junto' }, ...inlineNodes(strong)),
  });
  const lines = [[]];
  nodes.forEach((node) => {
    if (node.nodeName === 'BR') lines.push([]);
    else lines[lines.length - 1].push(node);
  });
  lines.forEach((line, i) => {
    // The lines wrap at the whitespace between them, as in the prototype's markup
    if (i > 0) title.append(' ');
    title.append(h('span', {
      class: i === 2 ? 'hero2__linea hero2__linea--junta' : 'hero2__linea',
    }, ...placeEscudo(line)));
  });
  return title;
}

function buildTicket(row) {
  const [figureCell, stubsCell] = row ? [...row.children] : [];
  const [figure, suffix] = figureCell ? [...figureCell.querySelectorAll('p')] : [];
  const stubs = stubsCell ? [...stubsCell.querySelectorAll('li')] : [];
  return h(
    'div',
    { class: 'ticket2' },
    h(
      'div',
      { class: 'ticket2__papel' },
      h(
        'p',
        { class: 'ticket2__cifra' },
        h('bdi', { dir: 'ltr' }, figure ? figure.textContent : ''),
        suffix ? h('span', { class: 'visually-hidden' }, ` ${suffix.textContent}`) : null,
      ),
      h('ul', { class: 'ticket2__talones', role: 'list' }, ...stubs.map((li, i) => h(
        'li',
        { class: 'ticket2__talon' },
        TICKET_ICONS[i] ? svgFrom(TICKET_ICONS[i]) : null,
        li.textContent,
      ))),
    ),
  );
}

/**
 * Parallax of the scene (IIFE 13). It paints from the first scroll, not on load.
 * @param {HTMLElement} hero The section
 */
function parallax(hero) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let pendiente = false;
  const pintar = () => {
    pendiente = false;
    const y = window.pageYOffset || document.documentElement.scrollTop;
    if (y > hero.offsetTop + hero.offsetHeight) return;
    hero.style.setProperty('--parallax', `${Math.round(y)}px`);
  };
  window.addEventListener('scroll', () => {
    if (!pendiente) {
      pendiente = true;
      window.requestAnimationFrame(pintar);
    }
  }, { passive: true });
}

/**
 * Regenerates the prototype's hero (section.hero2) from the authored table.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const [titleRow, ticketRow, ctaRow, imagesRow] = [...block.children];
  const [webCell, sceneCell] = imagesRow ? [...imagesRow.children] : [];
  const [cielo, montana] = webCell ? [...webCell.querySelectorAll('img')] : [];
  const [rusa, entrada, vagon] = sceneCell ? [...sceneCell.querySelectorAll('img')] : [];

  const confeti = (name) => decorImage('confeti-esquina.webp', {
    class: `hero2__confeti hero2__confeti--${name}`, width: 1856, height: 2339, alt: '', 'aria-hidden': 'true',
  });
  const cae = (n) => decorImage('confeti-cae.svg', {
    class: `hero2__cae hero2__cae--${n}`, width: 23, height: 33, alt: '', 'aria-hidden': 'true',
  });

  const ctaSource = ctaRow ? ctaRow.querySelector('a') : null;
  const cta = ctaSource ? linkFrom(ctaSource, {
    class: 'btn btn--primary btn--lg hero2__cta', 'data-track': 'hero-cta-alta',
  }) : null;
  if (cta) cta.append(icon('i-flecha-derecha'));

  const ticket = buildTicket(ticketRow);
  const section = h(
    'section',
    { class: 'hero2', id: 'inicio', 'aria-labelledby': 'hero-titulo' },
    confeti('inicio'),
    confeti('fin'),
    confeti('montana'),
    confeti('vagon'),
    cae(1),
    cae(2),
    cae(3),
    h(
      'div',
      { class: 'container hero2__contenido' },
      buildTitle(titleRow ? titleRow.querySelector('h1') : null),
      ticket,
      cta,
    ),
    h(
      'div',
      { class: 'hero2__fondo-web', 'aria-hidden': 'true' },
      authoredImage(cielo, {
        class: 'hero2__fondo-cielo', width: 2000, height: 1125, loading: null,
      }),
      authoredImage(montana, {
        class: 'hero2__fondo-montana', width: 1400, height: 787, loading: null,
      }),
    ),
    h(
      'div',
      { class: 'hero2__escena', 'data-parallax': '' },
      h('div', { class: 'hero2__cielo' }),
      authoredImage(rusa, {
        class: 'hero2__foto hero2__foto--montana', width: 2000, height: 1125, loading: null, fetchpriority: 'high',
      }),
      authoredImage(entrada, {
        class: 'hero2__foto hero2__foto--entrada', width: 1500, height: 765, loading: null,
      }),
      authoredImage(vagon, {
        class: 'hero2__foto hero2__foto--vagon', width: 1300, height: 866, loading: null,
      }),
      h('div', { class: 'hero2__suelo' }),
    ),
  );

  block.replaceChildren(section);
  tilt(ticket.querySelector('.ticket2__papel'), 6);
  parallax(section);
}
