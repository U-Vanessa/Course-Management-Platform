/**
 * Translation Dictionary for Course Reflection Page
 * Supports internationalization (i18n) and localization (l10n)
 * 
 * Supported Languages:
 * - en: English (default)
 * - fr: French (Français)
 * - es: Spanish (Español)
 */

const translations = {
    // English translations
    en: {
        title: "Course Reflection",
        welcome: "Share your thoughts and experiences about this course",
        question1: "What did you enjoy most about the course?",
        question2: "What was the most challenging part of the course?",
        question3: "What suggestions do you have for improving the course?",
        placeholder1: "Share what you found most engaging or interesting...",
        placeholder2: "Describe any difficulties you encountered and how you overcame them...",
        placeholder3: "Share your ideas for making this course even better...",
        footer: "Thank you for your valuable feedback! Your reflections help us improve the learning experience.",
        currentLang: "Current Language:",
        langName: "English"
    },

    // French translations
    fr: {
        title: "Réflexion sur le Cours",
        welcome: "Partagez vos pensées et expériences sur ce cours",
        question1: "Qu'avez-vous le plus apprécié dans ce cours?",
        question2: "Quelle a été la partie la plus difficile du cours?",
        question3: "Quelles suggestions avez-vous pour améliorer le cours?",
        placeholder1: "Partagez ce que vous avez trouvé le plus engageant ou intéressant...",
        placeholder2: "Décrivez les difficultés que vous avez rencontrées et comment vous les avez surmontées...",
        placeholder3: "Partagez vos idées pour rendre ce cours encore meilleur...",
        footer: "Merci pour vos précieux commentaires! Vos réflexions nous aident à améliorer l'expérience d'apprentissage.",
        currentLang: "Langue Actuelle:",
        langName: "Français"
    },

    // Spanish translations
    es: {
        title: "Reflexión del Curso",
        welcome: "Comparte tus pensamientos y experiencias sobre este curso",
        question1: "¿Qué fue lo que más disfrutaste del curso?",
        question2: "¿Cuál fue la parte más desafiante del curso?",
        question3: "¿Qué sugerencias tienes para mejorar el curso?",
        placeholder1: "Comparte lo que encontraste más atractivo o interesante...",
        placeholder2: "Describe cualquier dificultad que encontraste y cómo la superaste...",
        placeholder3: "Comparte tus ideas para hacer este curso aún mejor...",
        footer: "¡Gracias por tus valiosos comentarios! Tus reflexiones nos ayudan a mejorar la experiencia de aprendizaje.",
        currentLang: "Idioma Actual:",
        langName: "Español"
    }
};

// Utility functions for translation management
const TranslationUtils = {
    /**
     * Get available languages
     * @returns {string[]} Array of language codes
     */
    getAvailableLanguages() {
        return Object.keys(translations);
    },

    /**
     * Check if a language is supported
     * @param {string} langCode - Language code to check
     * @returns {boolean} Whether the language is supported
     */
    isLanguageSupported(langCode) {
        return translations.hasOwnProperty(langCode);
    },

    /**
     * Get translation for a specific key and language
     * @param {string} langCode - Language code
     * @param {string} key - Translation key
     * @param {string} fallback - Fallback text if translation not found
     * @returns {string} Translated text or fallback
     */
    getTranslation(langCode, key, fallback = '') {
        if (!this.isLanguageSupported(langCode)) {
            console.warn(`Language ${langCode} not supported, falling back to English`);
            langCode = 'en';
        }
        
        const translation = translations[langCode][key];
        if (!translation) {
            console.warn(`Translation key '${key}' not found for language '${langCode}'`);
            return fallback || translations.en[key] || key;
        }
        
        return translation;
    },

    /**
     * Get all translations for a specific language
     * @param {string} langCode - Language code
     * @returns {object} Translation object for the language
     */
    getLanguageTranslations(langCode) {
        if (!this.isLanguageSupported(langCode)) {
            console.warn(`Language ${langCode} not supported, returning English translations`);
            return translations.en;
        }
        return translations[langCode];
    },

    /**
     * Add a new language to the translations
     * @param {string} langCode - Language code
     * @param {object} translationObj - Translation object
     */
    addLanguage(langCode, translationObj) {
        if (translations[langCode]) {
            console.warn(`Language ${langCode} already exists, overwriting...`);
        }
        translations[langCode] = translationObj;
    },

    /**
     * Update specific translation keys for a language
     * @param {string} langCode - Language code
     * @param {object} updates - Object with key-value pairs to update
     */
    updateTranslations(langCode, updates) {
        if (!this.isLanguageSupported(langCode)) {
            console.error(`Cannot update translations for unsupported language: ${langCode}`);
            return;
        }
        
        Object.assign(translations[langCode], updates);
    }
};

// Export for use in other files (if using modules)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { translations, TranslationUtils };
}

// Make available globally for browser use
if (typeof window !== 'undefined') {
    window.translations = translations;
    window.TranslationUtils = TranslationUtils;
}