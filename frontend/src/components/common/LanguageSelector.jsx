import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { useState } from 'react';

const LANGUAGES = {
  en: { label: 'English', flag: '🇬🇧' },
  hi: { label: 'हिन्दी (Hindi)', flag: '🇮🇳' },
  ta: { label: 'தமிழ் (Tamil)', flag: '🇮🇳' },
  te: { label: 'తెలుగు (Telugu)', flag: '🇮🇳' },
  kn: { label: 'ಕನ್ನಡ (Kannada)', flag: '🇮🇳' },
  ml: { label: 'മലയാളം (Malayalam)', flag: '🇮🇳' },
  gu: { label: 'ગુજરાતી (Gujarati)', flag: '🇮🇳' },
  mr: { label: 'मराठी (Marathi)', flag: '🇮🇳' },
  bn: { label: 'বাংলা (Bengali)', flag: '🇮🇳' },
  pa: { label: 'ਪੰਜਾਬੀ (Punjabi)', flag: '🇮🇳' },
};

export const LanguageSelector = () => {
  const { i18n, t } = useTranslation('common');
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('i18nextLng', lang);
    setIsOpen(false);
  };

  const currentLang = (i18n.resolvedLanguage || i18n.language || 'en').split('-')[0];
  const currentLanguage = LANGUAGES[currentLang] || LANGUAGES['en'];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
        title={t('nav.language')}
      >
        <Globe className="w-5 h-5" />
        <span className="hidden sm:inline">{currentLanguage.flag}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-2">
            {Object.entries(LANGUAGES).map(([code, { label, flag }]) => (
              <button
                key={code}
                onClick={() => handleLanguageChange(code)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  currentLang === code
                    ? 'bg-blue-100 text-blue-700'
                    : 'hover:bg-gray-100'
                }`}
              >
                <span>{flag}</span>
                <span>{label}</span>
                {currentLang === code && <span className="ml-auto text-blue-600">✓</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
