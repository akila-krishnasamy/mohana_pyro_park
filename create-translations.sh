#!/bin/bash

# Translation File Generator Script
# This script creates the directory structure for all remaining Indian languages
# Usage: bash create_translations.sh

# Supported languages
LANGUAGES=(
  "te:తెలుగు"   # Telugu
  "kn:ಕನ್ನಡ"    # Kannada
  "ml:മലയാളം"  # Malayalam
  "gu:ગુજરાતી"  # Gujarati
  "mr:मराठी"    # Marathi
  "bn:বাংলা"   # Bengali
  "pa:ਪੰਜਾਬੀ"  # Punjabi
)

# Namespace files
NAMESPACES=("common" "products" "cart" "auth" "admin")

echo "🚀 Creating translation file structure..."

# Base path
LOCALE_PATH="frontend/public/locales"

# Create directories and files for each language
for lang_code_name in "${LANGUAGES[@]}"; do
  IFS=':' read -r lang_code lang_name <<< "$lang_code_name"
  
  # Create language directory
  mkdir -p "$LOCALE_PATH/$lang_code"
  
  echo "📁 Created: $LOCALE_PATH/$lang_code"
  
  # Copy English files as templates
  for namespace in "${NAMESPACES[@]}"; do
    if [ -f "$LOCALE_PATH/en/$namespace.json" ]; then
      cp "$LOCALE_PATH/en/$namespace.json" "$LOCALE_PATH/$lang_code/$namespace.json"
      echo "  ✓ $namespace.json"
    fi
  done
done

echo ""
echo "✅ Translation structure created!"
echo ""
echo "📝 Next Steps:"
echo "1. Edit files in $LOCALE_PATH/{language_code}/ directories"
echo "2. Replace English text with translations"
echo "3. Test in browser"
echo ""
echo "💡 Tip: Use Google Translate or hire translators for accuracy"
