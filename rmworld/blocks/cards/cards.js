import {
  accentNodes, authoredImage, h, icon, inlineNodes, observeReveal,
} from '../../scripts/rmw.js';

function buildSavings(block) {
  const [titleRow, ...rows] = [...block.children];
  const heading = titleRow ? titleRow.querySelector('h2') : null;
  const title = h(
    'h2',
    { class: 'section-title ahorro__title', id: 'ahorro-titulo' },
    ...(heading ? accentNodes(heading) : []),
  );
  const items = rows.map((row) => {
    const [mediaCell, bodyCell] = [...row.children];
    const name = bodyCell ? bodyCell.querySelector('h3') : null;
    const [pct, text] = bodyCell ? [...bodyCell.querySelectorAll('p')] : [];
    const li = h(
      'li',
      { class: 'beneficio' },
      h(
        'div',
        { class: 'beneficio__media' },
        authoredImage(mediaCell, {
          class: 'beneficio__photo', width: 1400, height: 933, loading: 'lazy',
        }),
        h(
          'div',
          { class: 'beneficio__body' },
          h('h3', { class: 'beneficio__title' }, name ? name.textContent : ''),
          h('p', { class: 'beneficio__pct' }, h('bdi', { dir: 'ltr' }, pct ? pct.textContent : '')),
          h('p', { class: 'beneficio__text' }, text ? text.textContent : ''),
        ),
      ),
    );
    return li;
  });

  block.replaceChildren(h(
    'section',
    { class: 'ahorro', id: 'ahorro', 'aria-labelledby': 'ahorro-titulo' },
    h('div', { class: 'container' }, title),
    h('div', { class: 'container' }, h('ol', { class: 'beneficios', role: 'list' }, ...items)),
  ));
  observeReveal(title);
  items.forEach(observeReveal);
}

const PERKS = [
  {
    variant: 'tarjeta2--lila',
    icono: () => h(
      'span',
      { class: 'tarjeta2__icono tarjeta2__icono--logo' },
      icon('v2-logo-rmplay', 'tarjeta2__logo-play'),
    ),
  },
  {
    variant: 'tarjeta2--violeta',
    icono: () => h('span', { class: 'tarjeta2__icono' }, icon('v2-regalo')),
  },
  {
    variant: 'tarjeta2--amarilla',
    titleClass: 'tarjeta2__titulo tarjeta2__titulo--cifra',
    adornos: () => [h('span', { class: 'tarjeta2__porcentaje', 'aria-hidden': 'true' }, '%')],
    icono: () => h('span', { class: 'tarjeta2__icono' }, icon('v2-etiqueta')),
  },
  {
    variant: 'tarjeta2--noche',
    adornos: () => [
      h('span', { class: 'tarjeta2__carnet', 'aria-hidden': 'true' }),
      h('span', { class: 'tarjeta2__punto', 'aria-hidden': 'true' }),
      h('span', { class: 'tarjeta2__raya', 'aria-hidden': 'true' }),
      h('span', { class: 'tarjeta2__raya tarjeta2__raya--2', 'aria-hidden': 'true' }),
    ],
    icono: () => h('span', { class: 'tarjeta2__icono' }, icon('v2-carnet')),
  },
];

function buildPerks(block) {
  const [titleRow, ...rows] = [...block.children];
  const heading = titleRow ? titleRow.querySelector('h2') : null;
  const lead = titleRow ? titleRow.querySelector('p') : null;
  const items = rows.map((row, i) => {
    const [mediaCell, bodyCell] = [...row.children];
    const name = bodyCell ? bodyCell.querySelector('h3') : null;
    const text = bodyCell ? bodyCell.querySelector('p') : null;
    const look = PERKS[i] || {};
    return h(
      'li',
      { class: `tarjeta2 ${look.variant || ''}`.trim() },
      authoredImage(mediaCell, { class: 'tarjeta2__fondo', loading: 'lazy' }),
      ...(look.adornos ? look.adornos() : []),
      look.icono ? look.icono() : null,
      h('h3', { class: look.titleClass || 'tarjeta2__titulo' }, ...(name ? inlineNodes(name) : [])),
      h('p', { class: 'tarjeta2__texto' }, text ? text.textContent : ''),
    );
  });

  block.replaceChildren(h(
    'section',
    { class: 'pertenece2', 'aria-labelledby': 'pertenece-titulo' },
    h(
      'div',
      { class: 'container' },
      h(
        'h2',
        { class: 'section-title pertenece2__titulo', id: 'pertenece-titulo' },
        ...(heading ? accentNodes(heading) : []),
      ),
      lead ? h('p', { class: 'section-lead pertenece2__lead' }, lead.textContent) : null,
      h('ul', { class: 'pertenece2__tarjetas', role: 'list' }, ...items),
    ),
  ));
  items.forEach(observeReveal);
}

/**
 * Regenerates the prototype's savings (.ahorro) or perks (.pertenece2) section.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  if (block.classList.contains('savings')) buildSavings(block);
  else if (block.classList.contains('perks')) buildPerks(block);
}
