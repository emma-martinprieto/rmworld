import { getMetadata } from '../../scripts/aem.js';
import { getLocale } from '../../scripts/locale.js';
import {
  authoredImage, h, inlineNodes, languageLinks, linkFrom, markTbc,
} from '../../scripts/rmw.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * Loads the footer fragment of the language folder and regenerates the
 * prototype's footer.
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : `${getLocale().base}/footer`;
  const fragment = await loadFragment(footerPath);
  block.closest('footer').classList.add('site-footer');
  block.textContent = '';
  if (!fragment) return;

  const [logoSection, languageSection, legalSection, linksSection] = [...fragment.children];
  const label = languageSection ? languageSection.querySelector('p') : null;
  const langs = languageSection ? languageSection.querySelector('ul') : null;
  const legal = legalSection ? legalSection.querySelector('p') : null;
  const links = linksSection ? [...linksSection.querySelectorAll('a')] : [];

  block.append(h(
    'div',
    { class: 'container site-footer__inner' },
    h(
      'ul',
      { class: 'site-footer__marcas', role: 'list' },
      h('li', {}, h('span', { class: 'site-footer__madridistas', role: 'img', 'aria-label': 'Madridistas' })),
      h('li', { class: 'site-footer__marca' }, authoredImage(logoSection, { width: 1412, height: 463, loading: 'lazy' })),
    ),
    langs ? languageLinks(langs, label ? label.textContent : '', 'site-footer__langs') : null,
    legal ? markTbc(h('p', { class: 'site-footer__legal' }, ...inlineNodes(legal))) : null,
    h('ul', { class: 'site-footer__links', role: 'list' }, ...links.map((a) => h('li', {}, linkFrom(a)))),
  ));
}
