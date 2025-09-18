export const buildUrl = ({ pathname = '/', params = {}, lang, theme }) => {
  const url = new URL(pathname, window.location.origin);
  const search = new URLSearchParams(window.location.search);
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') search.delete(k);
    else search.set(k, String(v));
  });
  if (lang) search.set('lang', lang);
  if (theme) search.set('theme', theme);
  url.search = search.toString();
  return url.pathname + (url.search ? `?${url.search}` : '');
};

export const getParam = (key) => {
  const sp = new URLSearchParams(window.location.search);
  return sp.get(key);
};

export const syncParam = (key, value) => {
  const sp = new URLSearchParams(window.location.search);
  if (value === undefined || value === null) sp.delete(key); else sp.set(key, value);
  const newUrl = window.location.pathname + (sp.toString() ? `?${sp.toString()}` : '') + window.location.hash;
  window.history.replaceState({}, '', newUrl);
};




