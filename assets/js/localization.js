import find from 'lodash.find';

export const locales = [
  {
    code: 'en',
    file: 'en.json',
    language: 'en',
    name: 'English',
    default: true 
  }, 
];

export const localeCodes = locales.map(locale => locale.code);

export const defaultLocale = find(locales, { default: true }).code;