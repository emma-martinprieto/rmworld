import {
  accentNodes, decorImage, h, observeBall, svgFrom,
} from '../../scripts/rmw.js';

const ROAD_MOBILE = '<svg class="pasos__road pasos__road--movil" viewBox="0 0 100 400" preserveAspectRatio="none" aria-hidden="true" focusable="false"> <defs> <linearGradient id="pasos-road" x1="0" y1="0" x2="0" y2="1"> <stop offset="0" class="pasos__road-stop-start"/> <stop offset="1" class="pasos__road-stop-end"/> </linearGradient> </defs> <path class="pasos__road-edge" d="M20 16 V50 C20 110 80 90 80 150 C80 210 20 190 20 250 C20 310 80 290 80 350 V384"/> <path class="pasos__road-lane" d="M20 16 V50 C20 110 80 90 80 150 C80 210 20 190 20 250 C20 310 80 290 80 350 V384"/> </svg>';
const ROAD_WEB = '<svg class="pasos__road pasos__road--web" viewBox="0 0 400 100" preserveAspectRatio="none" aria-hidden="true" focusable="false"> <defs> <linearGradient id="pasos-road-h" x1="0" y1="0" x2="1" y2="0"> <stop offset="0" class="pasos__road-stop-start"/> <stop offset="1" class="pasos__road-stop-end"/> </linearGradient> </defs> <path class="pasos__road-edge" d="M8 50 C 30 50, 28 25, 50 25 C 100 25, 100 75, 150 75 C 200 75, 200 25, 250 25 C 300 25, 300 75, 350 75 C 372 75, 370 50, 392 50"/> <path class="pasos__road-lane pasos__road-lane--h" d="M8 50 C 30 50, 28 25, 50 25 C 100 25, 100 75, 150 75 C 200 75, 200 25, 250 25 C 300 25, 300 75, 350 75 C 372 75, 370 50, 392 50"/> </svg>';

/**
 * The road draws itself each time it enters the screen (IIFE 5).
 * @param {Element} camino The road container
 */
function observeRoad(camino) {
  if (!('IntersectionObserver' in window)
    || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  camino.classList.add('reveal');
  const io = new IntersectionObserver((entries) => {
    const e = entries[0];
    if (e.isIntersecting && e.intersectionRatio > 0.2) camino.classList.add('is-visible');
    else if (!e.isIntersecting) camino.classList.remove('is-visible');
  }, { threshold: [0, 0.25] });
  io.observe(camino);
}

/**
 * Regenerates the prototype's "Así de fácil" section.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const [titleRow, ...rows] = [...block.children];
  const heading = titleRow ? titleRow.querySelector('h2') : null;
  const lead = titleRow ? titleRow.querySelector('p') : null;

  const items = rows.map((row) => {
    const [titleCell, textCell] = [...row.children];
    return h(
      'li',
      { class: 'pasos__item' },
      h(
        'div',
        { class: 'pasos__texto' },
        h('strong', {}, titleCell ? titleCell.textContent : ''),
        ' ',
        h('span', {}, textCell ? textCell.textContent : ''),
      ),
    );
  });

  const ball = decorImage('ilu-balon.webp', {
    class: 'pasos__balon', width: 595, height: 594, alt: '',
  });
  const camino = h(
    'div',
    { class: 'pasos__camino', 'data-pasos': '' },
    svgFrom(ROAD_MOBILE),
    svgFrom(ROAD_WEB),
    h('ol', { class: 'pasos__list', role: 'list' }, ...items),
  );

  block.replaceChildren(h(
    'section',
    { class: 'pasos-seccion', 'aria-labelledby': 'pasos-titulo' },
    h(
      'div',
      { class: 'container' },
      h(
        'div',
        { class: 'pasos' },
        ball,
        h('h2', { class: 'pasos__title', id: 'pasos-titulo' }, ...(heading ? accentNodes(heading) : [])),
        lead ? h('p', { class: 'pasos__lead' }, lead.textContent) : null,
        camino,
      ),
    ),
  ));

  observeRoad(camino);
  observeBall(ball);
}
