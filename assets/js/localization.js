import data from './localization.data.json'

export const locales = data.locales

export const localeCodes = locales.map(l => l.code)

export const defaultLocale = (locales.find(l => l.default) || locales[0] || { code: 'en' }).code
