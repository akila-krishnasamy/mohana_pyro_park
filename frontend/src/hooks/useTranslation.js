import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { translationsAPI } from '../services/api';

/**
 * Custom hook to translate text dynamically using Google Translate API
 * Falls back to i18n translations from JSON files
 */
export const useTranslateText = () => {
  const { i18n } = useTranslation();

  const translate = useCallback(async (text, targetLanguage = null) => {
    try {
      const lang = targetLanguage || i18n.language;
      
      // Try API translation first
      if (lang !== 'en') {
        try {
          const result = await translationsAPI.translateText(text, lang, 'en');
          return result.translated;
        } catch (error) {
          console.debug('API translation not available, using fallback');
        }
      }
      
      return text;
    } catch (error) {
      console.error('Translation error:', error);
      return text;
    }
  }, [i18n]);

  return translate;
};

/**
 * Hook to translate multiple texts
 */
export const useTranslateTexts = () => {
  const { i18n } = useTranslation();

  const translateMultiple = useCallback(async (texts, targetLanguage = null) => {
    try {
      const lang = targetLanguage || i18n.language;
      
      if (lang !== 'en' && Array.isArray(texts)) {
        try {
          const result = await translationsAPI.translateBatch(texts, lang, 'en');
          return result.translations;
        } catch (error) {
          console.debug('Batch translation not available, using fallback');
        }
      }
      
      return texts;
    } catch (error) {
      console.error('Batch translation error:', error);
      return texts;
    }
  }, [i18n]);

  return translateMultiple;
};

export default {
  useTranslateText,
  useTranslateTexts,
};
