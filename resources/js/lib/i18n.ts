import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import from Laravel's lang folder (shared with backend)
import en from '../../../lang/en.json';
import enIN from '../../../lang/en-IN.json';

i18n.use(initReactI18next).init({
  resources: {
    'en-GB': { translation: en },
    'en-IN': { translation: { ...en, ...enIN } },
  },
  lng: 'en-GB',
  fallbackLng: 'en-GB',
  interpolation: { escapeValue: false },
});

export default i18n;
