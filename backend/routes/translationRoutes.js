import express from 'express';
import {
  translateText,
  getSupportedLanguages,
  isSupportedLanguage,
  SUPPORTED_LANGUAGES
} from '../services/translationService.js';

const router = express.Router();

/**
 * @desc    Get all supported languages
 * @route   GET /api/translations/languages
 * @access  Public
 */
router.get('/languages', (req, res) => {
  try {
    res.json({
      success: true,
      languages: SUPPORTED_LANGUAGES
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @desc    Translate text to target language
 * @route   POST /api/translations/translate
 * @access  Public
 * @body    { text: string, targetLanguage: string, sourceLanguage?: string }
 */
router.post('/translate', async (req, res) => {
  try {
    const { text, targetLanguage, sourceLanguage = 'en' } = req.body;

    if (!text || !targetLanguage) {
      return res.status(400).json({
        success: false,
        message: 'text and targetLanguage are required'
      });
    }

    if (!isSupportedLanguage(targetLanguage)) {
      return res.status(400).json({
        success: false,
        message: `Unsupported language: ${targetLanguage}`,
        supportedLanguages: Object.keys(SUPPORTED_LANGUAGES)
      });
    }

    const translated = await translateText(text, targetLanguage, sourceLanguage);

    res.json({
      success: true,
      original: text,
      translated,
      targetLanguage,
      sourceLanguage
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @desc    Translate multiple texts
 * @route   POST /api/translations/translate-batch
 * @access  Public
 * @body    { texts: string[], targetLanguage: string, sourceLanguage?: string }
 */
router.post('/translate-batch', async (req, res) => {
  try {
    const { texts, targetLanguage, sourceLanguage = 'en' } = req.body;

    if (!Array.isArray(texts) || texts.length === 0 || !targetLanguage) {
      return res.status(400).json({
        success: false,
        message: 'texts (array) and targetLanguage are required'
      });
    }

    if (!isSupportedLanguage(targetLanguage)) {
      return res.status(400).json({
        success: false,
        message: `Unsupported language: ${targetLanguage}`,
        supportedLanguages: Object.keys(SUPPORTED_LANGUAGES)
      });
    }

    const translations = await Promise.all(
      texts.map(text => translateText(text, targetLanguage, sourceLanguage))
    );

    res.json({
      success: true,
      originals: texts,
      translations,
      targetLanguage,
      sourceLanguage,
      count: translations.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
