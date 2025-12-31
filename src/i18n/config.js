import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import enTranslations from "./locales/en.json";
import hiTranslations from "./locales/hi.json";
import taTranslations from "./locales/ta.json";
import teTranslations from "./locales/te.json";
import bnTranslations from "./locales/bn.json";
import mrTranslations from "./locales/mr.json";
import guTranslations from "./locales/gu.json";
import knTranslations from "./locales/kn.json";
import mlTranslations from "./locales/ml.json";
import esTranslations from "./locales/es.json";
import frTranslations from "./locales/fr.json";
import deTranslations from "./locales/de.json";
import zhTranslations from "./locales/zh.json";
import jaTranslations from "./locales/ja.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslations },
      hi: { translation: hiTranslations },
      ta: { translation: taTranslations },
      te: { translation: teTranslations },
      bn: { translation: bnTranslations },
      mr: { translation: mrTranslations },
      gu: { translation: guTranslations },
      kn: { translation: knTranslations },
      ml: { translation: mlTranslations },
      es: { translation: esTranslations },
      fr: { translation: frTranslations },
      de: { translation: deTranslations },
      zh: { translation: zhTranslations },
      ja: { translation: jaTranslations },
    },
    fallbackLng: "en",
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
  });

export default i18n;
