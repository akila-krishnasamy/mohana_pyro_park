# Translation Integration Guide

## Overview
This project integrates Google Translation API with i18next for supporting multiple Indian languages across the application.

## Supported Languages
- **English** (en) - Default
- **Hindi** (hi) - हिन्दी
- **Tamil** (ta) - தமிழ்
- **Telugu** (te) - తెలుగు
- **Kannada** (kn) - ಕನ್ನಡ
- **Malayalam** (ml) - മലയാളം
- **Gujarati** (gu) - ગુજરાતી
- **Marathi** (mr) - मराठी
- **Bengali** (bn) - বাংলা
- **Punjabi** (pa) - ਪੰਜਾਬੀ

## Backend Setup

### 1. Google Cloud Credentials
To use Google Translate API:

```bash
# Download credentials from Google Cloud Console
# Set environment variable in backend/.env:
GOOGLE_APPLICATION_CREDENTIALS=/path/to/credentials.json
GOOGLE_CLOUD_PROJECT=your-project-id
```

### 2. Translation Routes
Available endpoints:

```
GET  /api/translations/languages          - Get all supported languages
POST /api/translations/translate          - Translate single text
POST /api/translations/translate-batch    - Translate multiple texts
```

#### Example Request
```javascript
// Single text
POST /api/translations/translate
{
  "text": "Hello, Welcome to Mohana Pyro Park",
  "targetLanguage": "hi",
  "sourceLanguage": "en"
}

// Multiple texts
POST /api/translations/translate-batch
{
  "texts": ["Product", "Price", "Add to Cart"],
  "targetLanguage": "ta",
  "sourceLanguage": "en"
}
```

## Frontend Setup

### 1. i18n Configuration
Located in: `frontend/src/i18n.js`

The configuration uses:
- **i18next**: Translation engine
- **react-i18next**: React bindings
- **Language Detector**: Auto-detect user's language
- **HTTP Backend**: Load translations from JSON files

### 2. Translation JSON Files
Location: `frontend/public/locales/{language_code}/`

Structure:
```
locales/
├── en/
│   ├── common.json    - Navigation, common terms
│   ├── products.json  - Product page translations
│   ├── cart.json      - Cart/checkout translations
│   ├── auth.json      - Login/register translations
│   └── admin.json     - Admin panel translations
├── hi/
│   ├── common.json
│   ├── products.json
│   └── ...
└── ... (other languages)
```

### 3. Using Translations in Components

#### Basic Usage with useTranslation
```jsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t, i18n } = useTranslation('common');
  
  return (
    <div>
      <h1>{t('nav.home')}</h1>
      <p>Current Language: {i18n.language}</p>
      
      <button onClick={() => i18n.changeLanguage('hi')}>
        Switch to Hindi
      </button>
    </div>
  );
}
```

#### Using Dynamic Translation
```jsx
import { useTranslateText } from '../hooks/useTranslation';

function ProductName({ name }) {
  const translate = useTranslateText();
  const [translated, setTranslated] = useState(name);
  
  useEffect(() => {
    translate(name).then(setTranslated);
  }, [name, translate]);
  
  return <h2>{translated}</h2>;
}
```

### 4. Language Selector
The language selector component is integrated into the navbar:
- Located: `frontend/src/components/common/LanguageSelector.jsx`
- Automatically saves selection to localStorage
- Shows all supported languages with flags

## Integration Steps

### For New Pages:

1. **Import useTranslation hook**:
```jsx
import { useTranslation } from 'react-i18next';
```

2. **Use in component**:
```jsx
const { t } = useTranslation('namespace'); // e.g., 'products', 'auth'
```

3. **Replace hardcoded strings**:
```jsx
// Before
<button>Add to Cart</button>

// After
<button>{t('products.addToCart')}</button>
```

### For Product Names/Dynamic Content:

Use the Google Translate API via hooks:
```jsx
import { useTranslateText } from '../hooks/useTranslation';

const translate = useTranslateText();
const translatedName = await translate(productName);
```

## Adding New Language Translations

### 1. Create JSON Files
Create new translation files for the language under `frontend/public/locales/{lang_code}/`:

```bash
mkdir -p frontend/public/locales/{lang_code}
touch frontend/public/locales/{lang_code}/common.json
touch frontend/public/locales/{lang_code}/products.json
# ... etc
```

### 2. Language Options
Update `frontend/src/components/common/LanguageSelector.jsx` if needed:

```javascript
const LANGUAGES = {
  en: { label: 'English', flag: '🇬🇧' },
  hi: { label: 'हिन्दी (Hindi)', flag: '🇮🇳' },
  // Add more...
};
```

### 3. Backend Support
Add to `SUPPORTED_LANGUAGES` in `backend/services/translationService.js`:

```javascript
export const SUPPORTED_LANGUAGES = {
  en: { code: 'en', name: 'English', nativeName: 'English' },
  hi: { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  // Add more...
};
```

## Language Persistence

Language selection is automatically saved to localStorage:
- Key: `i18nextLng`
- Loads on next visit
- Falls back to browser language detection
- Default: English (en)

## API for Dynamic Content Translation

For product names, descriptions, and other dynamic content:

```javascript
import { translationsAPI } from '../services/api';

// Translate single text
const result = await translationsAPI.translateText(
  'Product Name',
  'hi',  // target language
  'en'   // source language
);

// Translate batch
const results = await translationsAPI.translateBatch(
  ['Product 1', 'Product 2', 'Product 3'],
  'ta',
  'en'
);
```

## Testing

### 1. Test Language Switching
- Click language selector in navbar
- Verify page content updates
- Check localStorage for saved language

### 2. Test API Translation
```bash
# Test endpoint
curl -X POST http://localhost:5000/api/translations/translate \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello World",
    "targetLanguage": "hi"
  }'
```

### 3. Test Fallback
- Without Google credentials, should show original text
- No errors in console
- UI should still be functional

## Best Practices

1. **Always use namespaces** - Organize translations by feature
2. **Use descriptive keys** - `nav.home` instead of `t1`
3. **Handle missing translations** - Provide fallback text
4. **Cache translations** - Avoid repeated API calls
5. **Use language in URL** - Optional for SEO: `/en/products` or `/hi/products`

## Troubleshooting

### Translations not loading?
- Check if JSON files exist in `frontend/public/locales/{language}/`
- Verify i18n initialization in `main.jsx`
- Check browser console for errors

### Google Translate API not working?
- Verify `GOOGLE_APPLICATION_CREDENTIALS` is set
- Check credentials file path
- Verify service account has Translate API enabled
- Check backend logs for errors

### Language not persisting?
- Check if localStorage is enabled
- Verify `i18nextLng` key in localStorage
- Clear localStorage and refresh

## Performance Considerations

- Translation JSON files are loaded on demand
- Cache translations client-side to reduce API calls
- Use batch translation for multiple items
- Consider lazy loading namespaces for large projects

## Resources

- [i18next Documentation](https://www.i18next.com/)
- [React-i18next Documentation](https://react.i18next.com/)
- [Google Cloud Translate API](https://cloud.google.com/translate/docs)
