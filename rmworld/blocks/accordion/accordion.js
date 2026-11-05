import {
  accentNodes, authoredImage, decorImage, h, icon, inlineNodes, linkFrom, markTbc,
  observeBall, observeReveal,
} from '../../scripts/rmw.js';

/** Panel widths of the photo set come from the prototype's img attributes, by position. */
const PHOTO_SIZES = [[1800, 1200], [1400, 933], [1400, 933], [1400, 933]];

/**
 * Photo accordion (IIFE 3): one panel is always open. Opens on click, on focus
 * and, when there is a mouse (evaluated once), on hover.
 * @param {HTMLElement} list The accordion list
 */
function mountPanels(list) {
  const hayRaton = window.matchMedia('(hover: hover)').matches;
  const panels = [...list.querySelectorAll('.acordeon__panel')];
  const open = (panel) => {
    panels.forEach((p) => {
      const es = p === panel;
      p.classList.toggle('is-open', es);
      p.querySelector('.acordeon__hit').setAttribute('aria-expanded', es ? 'true' : 'false');
    });
  };
  panels.forEach((panel) => {
    const hit = panel.querySelector('.acordeon__hit');
    hit.addEventListener('click', () => open(panel));
    hit.addEventListener('focus', () => open(panel));
    if (hayRaton) hit.addEventListener('mouseenter', () => open(panel));
  });
}

function buildPhoto(block) {
  const rows = [...block.children];
  const heading = rows[0] ? rows[0].querySelector('h2') : null;
  const footLink = rows.length > 1 ? rows[rows.length - 1].querySelector('a') : null;
  const panelRows = rows.slice(1).filter((row) => row.children.length >= 3);

  const title = h(
    'h2',
    { class: 'section-title', id: 'descubre-titulo' },
    ...(heading ? accentNodes(heading) : []),
  );
  const list = h(
    'ul',
    { class: 'acordeon', role: 'list', 'data-acordeon': '' },
    ...panelRows.map((row, i) => {
      const [mediaCell, titleCell, textCell] = [...row.children];
      const [width, height] = PHOTO_SIZES[i] || [];
      return h(
        'li',
        { class: i === 0 ? 'acordeon__panel is-open' : 'acordeon__panel' },
        authoredImage(mediaCell, {
          class: 'acordeon__img', width, height, loading: 'lazy',
        }),
        h(
          'button',
          { class: 'acordeon__hit', type: 'button', 'aria-expanded': i === 0 ? 'true' : 'false' },
          h('span', { class: 'acordeon__label', 'aria-hidden': 'true' }, titleCell.textContent),
          h(
            'span',
            { class: 'acordeon__body' },
            h('span', { class: 'acordeon__title' }, titleCell.textContent),
            h('span', { class: 'acordeon__text' }, textCell.textContent),
          ),
        ),
      );
    }),
  );
  const ball = decorImage('ilu-balon-basket.webp', {
    class: 'descubre__balon', width: 400, height: 398, alt: '', loading: 'lazy',
  });

  block.replaceChildren(h(
    'section',
    { class: 'descubre', 'aria-labelledby': 'descubre-titulo' },
    h(
      'div',
      { class: 'container' },
      ball,
      title,
      list,
      footLink ? h('p', { class: 'descubre__foot' }, linkFrom(footLink, {
        class: 'btn btn--primary', 'data-track': 'descubre-cta-membresias',
      })) : null,
    ),
  ));

  observeReveal(title);
  observeReveal(list);
  mountPanels(list);
  observeBall(ball);
}

function answerNodes(cell) {
  return [...cell.children].map((child) => {
    if (child.tagName === 'UL') {
      const list = h('ul', { class: 'faq__lista', role: 'list' });
      list.append(...inlineNodes(child));
      return markTbc(list);
    }
    const links = [...child.querySelectorAll('a')];
    const onlyLinks = links.length > 0
      && links.reduce((rest, a) => rest.replace(a.textContent, ''), child.textContent).trim() === '';
    if (!onlyLinks) {
      return markTbc(h('p', { class: 'faq__text' }, ...inlineNodes(child)));
    }
    const actions = h('p', { class: 'faq__acciones' });
    links.forEach((a, i) => {
      const isMap = a.getAttribute('href').endsWith('.pdf');
      if (i > 0) actions.append(' ');
      actions.append(linkFrom(a, {
        class: 'btn btn--secondary btn--sm',
        'data-track': isMap ? 'faq-mapa' : 'faq-wallet',
      }, icon(isMap ? 'i-mapa' : 'i-wallet')));
    });
    return actions;
  });
}

function buildFaq(block) {
  const [titleRow, ...rows] = [...block.children];
  const heading = titleRow ? titleRow.querySelector('h2') : null;
  const title = h('h2', { class: 'section-title', id: 'faq-titulo' }, ...(heading ? accentNodes(heading) : []));
  const items = rows.map((row) => {
    const [question, answer, state] = [...row.children];
    return h(
      'details',
      {
        class: 'faq__item',
        open: state && state.textContent.trim() === 'open' ? '' : null,
      },
      h(
        'summary',
        { class: 'faq__summary' },
        question ? question.textContent : '',
        icon('i-plus', 'icon faq__icono-cerrada'),
        icon('i-aspa', 'icon faq__icono-abierta'),
      ),
      ...(answer ? answerNodes(answer) : []),
    );
  });

  block.replaceChildren(h(
    'section',
    { class: 'faq', id: 'faq', 'aria-labelledby': 'faq-titulo' },
    h('div', { class: 'container' }, title, ...items),
  ));
  observeReveal(title);
  items.forEach(observeReveal);
}

/**
 * Regenerates the prototype's photo accordion (.descubre) or FAQ (.faq).
 * @param {Element} block The block element
 */
export default function decorate(block) {
  if (block.classList.contains('photo')) buildPhoto(block);
  else buildFaq(block);
}
