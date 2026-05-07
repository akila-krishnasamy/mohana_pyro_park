// Language config for common Indian languages
// Using MyMemory API for free translation (no credentials needed)
export const SUPPORTED_LANGUAGES = {
  en: { code: 'en', name: 'English', nativeName: 'English' },
  hi: { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  ta: { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  te: { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  kn: { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  ml: { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
  gu: { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  mr: { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  bn: { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  pa: { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
};

/**
 * Initialize Translation Service
 * Uses MyMemory API - free, no credentials required
 */
export const initializeTranslator = () => {
  console.log('✅ Translation service initialized (MyMemory API)');
  return true;
};

/**
 * Translate text to target language using MyMemory API
 * @param {string} text - Text to translate
 * @param {string} targetLanguage - Target language code
 * @param {string} sourceLanguage - Source language code (defaults to 'en')
 * @returns {Promise<string>} Translated text
 */
export const translateText = async (text, targetLanguage, sourceLanguage = 'en') => {
  try {
    // Skip if source and target are the same
    if (sourceLanguage === targetLanguage) {
      return text;
    }

    // Skip if target language is not supported
    if (!SUPPORTED_LANGUAGES[targetLanguage]) {
      console.warn(`Unsupported target language: ${targetLanguage}`);
      return text;
    }

    // Skip translation for English (source language)
    if (targetLanguage === 'en') {
      return text;
    }

    // Call MyMemory API
    const langPair = `${sourceLanguage}|${targetLanguage}`;
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langPair}`;
    
    const response = await fetch(url, {
      timeout: 5000,
      headers: { 'User-Agent': 'MohanaApp/1.0' }
    });
    
    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.responseStatus === 200 && data.responseData?.translatedText) {
      return data.responseData.translatedText;
    }
    
    console.warn(`Translation API returned status: ${data.responseStatus}`);
    return text;
  } catch (error) {
    console.warn(`Translation error for ${targetLanguage}:`, error.message);
    return text; // Return original text on error
  }
};

/**
 * Translate multiple texts (batch)
 * @param {string[]} texts - Array of texts to translate
 * @param {string} targetLanguage - Target language code
 * @param {string} sourceLanguage - Source language code
 * @returns {Promise<string[]>} Array of translated texts
 */
export const translateTexts = async (texts, targetLanguage, sourceLanguage = 'en') => {
  try {
    if (sourceLanguage === targetLanguage || !Array.isArray(texts)) {
      return texts;
    }

    if (!SUPPORTED_LANGUAGES[targetLanguage]) {
      return texts;
    }

    // Translate each text with small delay to avoid rate limiting
    const translations = [];
    for (const text of texts) {
      const translated = await translateText(text, targetLanguage, sourceLanguage);
      translations.push(translated);
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    return translations;
  } catch (error) {
    console.error('Error translating batch texts:', error.message);
    return texts;
  }
};

/**
 * Translate object properties (shallow)
 * Useful for translating product names, descriptions, etc.
 * @param {object} obj - Object with string properties
 * @param {string[]} keys - Keys to translate
 * @param {string} targetLanguage - Target language code
 * @returns {Promise<object>} Object with translated properties
 */
export const translateObject = async (obj, keys, targetLanguage) => {
  try {
    if (!SUPPORTED_LANGUAGES[targetLanguage] || targetLanguage === 'en') {
      return obj;
    }

    const textsToTranslate = keys.map(key => obj[key] || '');
    const translations = await translateTexts(textsToTranslate, targetLanguage);

    const result = { ...obj };
    keys.forEach((key, index) => {
      if (translations[index]) {
        result[key] = translations[index];
      }
    });

    return result;
  } catch (error) {
    console.error('Error translating object:', error.message);
    return obj;
  }
};

/**
 * Get supported languages
 * @returns {object} Supported languages mapping
 */
export const getSupportedLanguages = () => {
  return SUPPORTED_LANGUAGES;
};

/**
 * Check if language is supported
 * @param {string} languageCode - Language code to check
 * @returns {boolean}
 */
export const isSupportedLanguage = (languageCode) => {
  return Boolean(SUPPORTED_LANGUAGES[languageCode]);
};

export default {
  initializeTranslator,
  translateText,
  translateTexts,
  translateObject,
  getSupportedLanguages,
  isSupportedLanguage,
  SUPPORTED_LANGUAGES,
};
