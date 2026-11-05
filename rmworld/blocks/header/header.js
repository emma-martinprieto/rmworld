import { getMetadata } from '../../scripts/aem.js';
import { getLocale } from '../../scripts/locale.js';
import {
  authoredImage, h, icon, languageHref, languageLinks, linkFrom,
} from '../../scripts/rmw.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * Language selector (IIFE 2): closes on Escape (focus back on the button), on
 * an outside click, and when tabbing out.
 * @param {Element} selector The selector
 */
function mountLanguageSelector(selector) {
  const boton = selector.querySelector('.idioma__boton');
  const lista = selector.querySelector('.idioma__lista');
  const abrir = (si) => {
    boton.setAttribute('aria-expanded', si ? 'true' : 'false');
    lista.hidden = !si;
  };
  boton.addEventListener('click', () => abrir(boton.getAttribute('aria-expanded') !== 'true'));
  document.addEventListener('click', (ev) => {
    if (!selector.contains(ev.target)) abrir(false);
  });
  selector.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape' && !lista.hidden) {
      abrir(false);
      boton.focus();
    }
  });
  selector.addEventListener('focusout', (ev) => {
    if (ev.relatedTarget && !selector.contains(ev.relatedTarget)) abrir(false);
  });
}

/**
 * Literal `dir` of the language options: in ES and EN the Arabic option is rtl;
 * in AR the Spanish option is ltr.
 */
function optionDir(lang, current) {
  if (current === 'ar') return lang === 'es' ? 'ltr' : null;
  return lang === 'ar' ? 'rtl' : null;
}

function buildSelector(toggleText, namesList, codesList) {
  const { lang: current } = getLocale();
  const codes = codesList ? [...codesList.querySelectorAll('a')] : [];
  const currentCode = codes.find((a) => a.getAttribute('href').includes(`/rmworld/${current}/`));
  const items = namesList ? [...namesList.querySelectorAll('a')] : [];

  return h(
    'div',
    { class: 'idioma', 'data-idioma': '' },
    h(
      'button',
      {
        class: 'idioma__boton', type: 'button', 'aria-expanded': 'false', 'aria-controls': 'idioma-lista',
      },
      icon('i-idioma'),
      h('span', { class: 'idioma__actual' }, currentCode ? currentCode.textContent : ''),
      h('span', { class: 'visually-hidden' }, toggleText),
      icon('i-flecha', 'icon idioma__flecha'),
    ),
    h('ul', {
      class: 'idioma__lista', id: 'idioma-lista', role: 'list', hidden: '',
    }, ...items.map((a) => {
      const href = a.getAttribute('href');
      const [, lang] = href.match(/\/rmworld\/(\w+)/) || [];
      const isCurrent = lang === current;
      return h('li', {}, h(
        'a',
        {
          class: 'idioma__opcion',
          href: languageHref(href),
          lang,
          hreflang: lang,
          'aria-current': isCurrent ? 'page' : null,
          dir: optionDir(lang, current),
        },
        a.textContent,
        isCurrent ? icon('i-check') : null,
      ));
    })),
  );
}

/**
 * Loads the nav fragment of the language folder and regenerates the prototype's
 * header. There is no <nav> or hamburger in the prototype.
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : `${getLocale().base}/nav`;
  const fragment = await loadFragment(navPath);
  block.closest('header').classList.add('site-header');
  block.textContent = '';
  if (!fragment) return;

  const [brandSection, languageSection, skipSection] = [...fragment.children];
  const brandLink = brandSection ? brandSection.querySelector('a') : null;
  const [toggleText, ariaLabel] = languageSection ? [...languageSection.querySelectorAll('p')] : [];
  const [namesList, codesList] = languageSection ? [...languageSection.querySelectorAll('ul')] : [];

  const selector = buildSelector(toggleText ? toggleText.textContent : '', namesList, codesList);
  block.append(h(
    'div',
    { class: 'container site-header__inner' },
    h(
      'a',
      { class: 'site-header__brand', href: brandLink ? brandLink.getAttribute('href') : null },
      authoredImage(brandLink, { class: 'site-header__park', width: 1412, height: 463 }),
      h('span', { class: 'site-header__logo site-header__logo--web', role: 'img', 'aria-label': 'Madridistas' }),
    ),
    h(
      'div',
      { class: 'site-header__actions' },
      selector,
      codesList ? languageLinks(codesList, ariaLabel ? ariaLabel.textContent : '', 'idioma-enlaces') : null,
    ),
  ));
  mountLanguageSelector(selector);

  // The skip link is the first child of <body> in the prototype
  const skipLink = skipSection ? skipSection.querySelector('a') : null;
  if (skipLink) document.body.prepend(linkFrom(skipLink, { class: 'skip-link' }));
}
