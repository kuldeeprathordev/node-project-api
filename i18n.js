// i18n.js
import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import middleware from 'i18next-http-middleware';
import path from 'path';

i18next
  .use(Backend)
  .use(middleware.LanguageDetector)
  .init({
    fallbackLng: 'en',
    preload: ['en', 'ar'],
    backend: { loadPath: path.resolve('./lang/{{lng}}/translation.json'), },
    detection: { order: ['header'], },
  });

export default i18next;
