import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { zhTranslations, enTranslations } from './translations';

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            zh: {
                translation: zhTranslations
            },
            en: {
                translation: enTranslations
            }
        },
        fallbackLng: 'zh',
        interpolation: {
            escapeValue: false
        },
        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage']
        }
    });

export default i18n;
