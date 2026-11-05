import {
  accentNodes, applyAltaQuery, authoredImage, decorImage, h, icon, inlineNodes, linkFrom,
  observeBall, observeReveal, tilt,
} from '../../scripts/rmw.js';

/** Plan ids and card sizes are fixed by position, as in the prototype. */
const PLANS = [
  { id: 'platinum', width: 344, height: 208 },
  { id: 'premium', width: 640, height: 394 },
  { id: 'junior', width: 640, height: 393 },
];

function buildPlan(row, i) {
  const { id, width, height } = PLANS[i] || { id: `plan-${i}` };
  const platinum = i === 0;
  const [mediaCell, idCell, priceCell, panelCell] = [...row.children];

  const badge = idCell ? idCell.querySelector('p em') : null;
  const name = idCell ? idCell.querySelector('h3') : null;
  const desc = idCell ? [...idCell.querySelectorAll('p')].find((p) => !p.querySelector('em')) : null;
  const price = priceCell ? priceCell.querySelector('strong') : null;
  const period = priceCell ? [...priceCell.querySelectorAll('p')].find((p) => !p.querySelector('strong')) : null;
  const benefits = panelCell ? [...panelCell.querySelectorAll('li')] : [];
  const ctaSource = panelCell ? panelCell.querySelector('a') : null;

  const cta = ctaSource ? linkFrom(ctaSource, {
    class: 'btn btn--primary btn--sm',
    'data-alta': '',
    'data-plan': id,
    'data-track': `plan-${id}-alta`,
  }) : null;
  if (cta) applyAltaQuery(cta);

  const radioId = `plan-${id}`;
  const wrap = h(
    'div',
    { class: platinum ? 'plan-wrap plan-wrap--platinum' : 'plan-wrap' },
    platinum ? decorImage('camiseta-platinum.webp', {
      class: 'plan__camiseta', width: 336, height: 359, alt: '', loading: 'lazy',
    }) : null,
    h(
      'div',
      { class: platinum ? 'plan plan--platinum' : 'plan' },
      h('input', {
        class: 'plan__radio', type: 'radio', name: 'plan', id: radioId, value: id, checked: platinum ? '' : null,
      }),
      h(
        'label',
        { class: 'plan__head', for: radioId },
        authoredImage(mediaCell, {
          class: 'plan__carnet', width, height, loading: 'lazy',
        }),
        h('span', { class: 'plan__dot', 'aria-hidden': 'true' }),
        h(
          'span',
          { class: 'plan__id' },
          badge ? h('span', { class: 'badge badge--premium' }, badge.textContent) : null,
          h('span', { class: 'plan__name' }, name ? name.textContent : ''),
          h('span', { class: 'plan__desc' }, desc ? desc.textContent : ''),
        ),
        h(
          'span',
          { class: 'plan__price' },
          h('strong', {}, price ? price.textContent : ''),
          period ? period.textContent : '',
        ),
      ),
      h(
        'div',
        { class: 'plan__panel' },
        h(
          'div',
          { class: 'plan__panel-inner' },
          h('ul', { class: 'plan__benefits', role: 'list' }, ...benefits.map((li, n) => h(
            'li',
            { class: n === 0 ? 'plan__benefit plan__benefit--destacado' : 'plan__benefit' },
            icon('i-check'),
            ...inlineNodes(li),
          ))),
          cta,
        ),
      ),
    ),
  );
  return wrap;
}

/**
 * Regenerates the prototype's plans section and takes in the plan-compare block.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const [titleRow, ...rows] = [...block.children];
  const heading = titleRow ? titleRow.querySelector('h2') : null;
  const note = titleRow ? titleRow.querySelector('p') : null;
  const wraps = rows.map(buildPlan);

  const title = h(
    'h2',
    { class: 'section-title', id: 'membresias-titulo' },
    ...(heading ? accentNodes(heading) : []),
  );
  const ball = decorImage('ilu-balon.webp', {
    class: 'membresias__balon', width: 595, height: 594, alt: '',
  });
  const container = h(
    'div',
    { class: 'container' },
    title,
    note ? h('p', { class: 'membresias__note tbc' }, note.textContent) : null,
    h(
      'fieldset',
      { class: 'membresias__selector' },
      h('legend', { class: 'visually-hidden' }, heading ? heading.textContent : ''),
      ...wraps,
    ),
  );

  block.replaceChildren(h(
    'section',
    { class: 'membresias', id: 'membresias', 'aria-labelledby': 'membresias-titulo' },
    ball,
    container,
  ));

  observeReveal(title);
  // Literal: Platinum has no data-reveal in the prototype
  wraps.slice(1).forEach(observeReveal);
  const web = window.matchMedia('(min-width: 1024px)');
  wraps.forEach((wrap) => tilt(wrap, 4, web));
  observeBall(ball);

  const section = block.closest('.section');
  const compare = section ? section.querySelector('.plan-compare-wrapper') : null;
  if (compare) container.append(compare);
}
