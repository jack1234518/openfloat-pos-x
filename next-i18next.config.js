// next-i18next.config.js

module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'sw'],
    localeDetection: true,
  },
  ns: ['common'],
  defaultNS: 'common',
  localePath: './public/locales',
};