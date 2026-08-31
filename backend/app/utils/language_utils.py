"""Centralized supported-languages registry.

Single source of truth for output-language validation across backend services.
Add a new language here and it works everywhere — no other code changes needed.
"""

SUPPORTED_LANGUAGES = [
    # Indian languages
    {"code": "en", "name": "English", "english_name": "English"},
    {"code": "te", "name": "తెలుగు", "english_name": "Telugu"},
    {"code": "hi", "name": "हिन्दी", "english_name": "Hindi"},
    {"code": "ta", "name": "தமிழ்", "english_name": "Tamil"},
    {"code": "kn", "name": "ಕನ್ನಡ", "english_name": "Kannada"},
    {"code": "ml", "name": "മലയാളം", "english_name": "Malayalam"},
    {"code": "bn", "name": "বাংলা", "english_name": "Bengali"},
    {"code": "mr", "name": "मराठी", "english_name": "Marathi"},
    {"code": "gu", "name": "ગુજરાતી", "english_name": "Gujarati"},
    {"code": "pa", "name": "ਪੰਜਾਬੀ", "english_name": "Punjabi"},
    {"code": "ur", "name": "اردو", "english_name": "Urdu"},
    {"code": "or", "name": "ଓଡ଼ିଆ", "english_name": "Odia"},
    {"code": "as", "name": "অসমীয়া", "english_name": "Assamese"},
    # International languages
    {"code": "es", "name": "Español", "english_name": "Spanish"},
    {"code": "fr", "name": "Français", "english_name": "French"},
    {"code": "de", "name": "Deutsch", "english_name": "German"},
    {"code": "pt", "name": "Português", "english_name": "Portuguese"},
    {"code": "it", "name": "Italiano", "english_name": "Italian"},
    {"code": "nl", "name": "Nederlands", "english_name": "Dutch"},
    {"code": "ru", "name": "Русский", "english_name": "Russian"},
    {"code": "zh", "name": "中文", "english_name": "Chinese"},
    {"code": "ja", "name": "日本語", "english_name": "Japanese"},
    {"code": "ko", "name": "한국어", "english_name": "Korean"},
    {"code": "ar", "name": "العربية", "english_name": "Arabic"},
    {"code": "tr", "name": "Türkçe", "english_name": "Turkish"},
]

_LANGUAGES_BY_CODE = {lang["code"]: lang for lang in SUPPORTED_LANGUAGES}

DEFAULT_LANGUAGE_CODE = "en"


def get_language(code: str | None) -> dict | None:
    """Return the language entry for a code, or None if unsupported."""
    if not code:
        return None
    return _LANGUAGES_BY_CODE.get(code.strip().lower())


def is_supported(code: str | None) -> bool:
    return get_language(code) is not None


def language_name(code: str | None) -> str:
    """English display name for a code; safe fallback for provider codes."""
    lang = get_language(code)
    if lang:
        return lang["english_name"]
    return (code or "Unknown").upper()
