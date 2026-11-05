import {
  applyAltaQuery, h, icon, linkFrom,
} from '../../scripts/rmw.js';

/** Row icons and plan ids are fixed by position, as in the prototype. */
const ROW_ICONS = ['i-etiqueta', 'i-camiseta', 'i-cartera', 'i-play', 'i-bolsa', 'i-persona', 'i-precio'];
const PLANS = ['platinum', 'premium', 'junior'];

function valueNodes(cell, words) {
  const text = cell.textContent.trim();
  if (text === words.yes) {
    return [icon('i-check', 'icon comparar__si'), h('span', { class: 'visually-hidden' }, words.yes)];
  }
  if (text === words.no) {
    return [
      h('span', { class: 'comparar__no', 'aria-hidden': 'true' }, '—'),
      h('span', { class: 'visually-hidden' }, words.no),
    ];
  }
  const [value, period] = [...cell.querySelectorAll('p')];
  if (period) return [value.textContent, h('span', { class: 'comparar__periodo' }, period.textContent)];
  return [value ? value.textContent : cell.textContent];
}

/**
 * Regenerates the prototype's plan comparator: button plus native <dialog> (IIFE 4).
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const rows = [...block.children];
  const config = {};
  rows.filter((row) => row.children.length === 2).forEach((row) => {
    const [key, value] = row.children;
    config[key.textContent.trim()] = value;
  });
  const text = (key) => (config[key] ? config[key].textContent : '');
  const words = { yes: text('yes').trim(), no: text('no').trim() };

  const matrix = rows.filter((row) => row.children.length === 4).map((row) => [...row.children]);
  const header = matrix[0] || [];
  const footer = matrix.length > 1 ? matrix[matrix.length - 1] : [];
  const body = matrix.slice(1, -1);

  const openButton = h('button', {
    class: 'btn btn--secondary', type: 'button', 'data-comparar-abrir': '', 'aria-haspopup': 'dialog',
  }, text('open'));
  const closeButton = h('button', {
    class: 'comparar__cerrar', type: 'button', 'data-comparar-cerrar': '', 'aria-label': text('close'),
  }, icon('i-plus'));
  const opener = h('p', { class: 'comparar__abrir', 'data-comparar-js': '', hidden: '' }, openButton);

  const dialog = h(
    'dialog',
    { class: 'comparar', 'aria-labelledby': 'comparar-titulo', 'data-comparar': '' },
    h(
      'div',
      { class: 'comparar__head' },
      h('h3', {
        class: 'comparar__title', id: 'comparar-titulo', tabindex: '-1', autofocus: '',
      }, text('title')),
      closeButton,
    ),
    h(
      'div',
      { class: 'comparar__scroll' },
      h(
        'table',
        { class: 'comparar__tabla' },
        h('thead', {}, h(
          'tr',
          {},
          h('td'),
          ...header.slice(1).map((cell) => h('th', { scope: 'col' }, cell.textContent)),
        )),
        h('tbody', {}, ...body.map((cells, i) => h(
          'tr',
          {},
          h('th', { scope: 'row' }, h(
            'span',
            { class: 'comparar__fila' },
            ROW_ICONS[i] ? icon(ROW_ICONS[i], 'icon comparar__icono') : null,
            h('span', {}, cells[0].textContent),
          )),
          ...cells.slice(1).map((cell) => h('td', {}, ...valueNodes(cell, words))),
        ))),
        h('tfoot', {}, h(
          'tr',
          {},
          h('td'),
          ...footer.slice(1).map((cell, i) => {
            const source = cell.querySelector('a');
            if (!source) return h('td');
            const cta = linkFrom(source, {
              class: `btn ${i === 0 ? 'btn--primary' : 'btn--secondary'} btn--sm comparar__cta`,
              'data-alta': '',
              'data-plan': PLANS[i],
              'data-track': `comparar-${PLANS[i]}-alta`,
            });
            applyAltaQuery(cta);
            return h('td', {}, cta);
          }),
        )),
      ),
    ),
    h('p', { class: 'comparar__nota tbc' }, text('note')),
  );

  block.replaceChildren(opener, dialog);

  if (typeof dialog.showModal !== 'function') return;
  opener.hidden = false;
  openButton.addEventListener('click', () => dialog.showModal());
  closeButton.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (ev) => {
    if (ev.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', () => openButton.focus());
}
