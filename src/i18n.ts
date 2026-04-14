import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// import Backend from 'i18next-http-backend';
// import LanguageDetector from 'i18next-browser-languagedetector';
// don't want to use this?
// have a look at the Quick start guide 
// for passing in lng and translations on init

i18n
  // load translation using http -> see /public/locales (i.e. https://github.com/i18next/react-i18next/tree/master/example/react/public/locales)
  // learn more: https://github.com/i18next/i18next-http-backend
  // want your translations to be loaded from a professional CDN? => https://github.com/locize/react-tutorial#step-2---use-the-locize-cdn
//   .use(Backend)
//   // detect user language
//   // learn more: https://github.com/i18next/i18next-browser-languageDetector
//   .use(LanguageDetector)
  // pass the i18n instance to react-i18next.
  .use(initReactI18next)
  // init i18next
  // for all options read: https://www.i18next.com/overview/configuration-options
  .init({
    fallbackLng: 'en',
    debug: true,
    lng: 'pt', 

    resources: {
      en: {
        translation: {
          "collection": {
            "name": "Lafda internal collection",
            "desc": "© Universidade Federal Fluminense - 2025"
          },
          "tutorial": {
            "title": "How to navigate",
            "moreInfo": "For more information, visit the",
            "lafdaSite": "Lafda website",
            "navigate": "Navigate",
            "step1": {"label": "Orbit", "description": "Left click + drag / drag with one finger (touch). The orbit is around the object."},
            "step2": {"label": "Zoom", "description": "Scroll wheel / pinch (touch)"},
            "step3": {"label": "Select", "description": "Left click / single tap (touch)"},
            "step4": {"label": "Position", "description": "Click on the object and drag to reposition it"}
          },
          "search": {"placeholder": "Search"}
        }
      },
      pt: {
        translation: {
          "collection": {
            "name": "Acervo interno do Lafda",
            "desc": "© Universidade Federal Fluminense - 2025"
          },
          "tutorial": {
            "title": "Como navegar",
            "moreInfo": "Para mais informações, acesse o",
            "lafdaSite": "site do Lafda",
            "navigate": "Navegar",
            "step1": {"label": "Órbita", "description": "Clique esquerdo + arraste / arraste com um dedo (touch). A órbita é ao redor do objeto."},
            "step2": {"label": "Zoom", "description": "Segure ou role o scroll / Faça pinça (touch)"},
            "step3": {"label": "Selecionar", "description": "Clique esquerdo / toque único (touch)"},
            "step4": {"label": "Posicionar", "description": "Clique no objeto e arraste para reposicioná-lo"}
          },
            "search": {"placeholder": "Pesquisar"}
        }
      }
    },

    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },

  });


export default i18n;