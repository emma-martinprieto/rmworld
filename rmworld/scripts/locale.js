const RTL_LANGS = ['ar'];

/**
 * Resolves the language folder of the current page from its path, so it works
 * both published (/rmworld/ar/) and in the local preview (/drafts/rmworld/ar/).
 * @returns {{lang: string, dir: string, base: string}} Language, text direction
 * and path of the language folder (empty outside /rmworld/<lang>/)
 */
// eslint-disable-next-line import/prefer-default-export
export function getLocale() {
  const match = window.location.pathname.match(/^(.*\/rmworld\/(es|en|ar))(\/|$)/);
  if (!match) return { lang: 'es', dir: 'ltr', base: '' };
  const [, base, lang] = match;
  return { lang, dir: RTL_LANGS.includes(lang) ? 'rtl' : 'ltr', base };
}
