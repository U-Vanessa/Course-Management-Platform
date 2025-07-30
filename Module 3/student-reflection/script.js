/**
 * Main JavaScript file for Student Reflection Page
 * Handles internationalization, user interactions, and data persistence
 */

// Wait for translations to be loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if translations are loaded
    if (typeof translations === 'undefined') {
        console.error('Translations not loaded! Make sure translations.js is included.');
        showError('Translation files could not be loaded. Please refresh the page.');
        return;
    }

    // Initialize the application
    init();
});

/**
 * Show error message to user
 * @param {string} message - Error message to display
 */
function showError(message) {
    const container = document.querySelector('.container');
    if (container) {
        container.innerHTML = `
            <div class="loading">
                <h2>⚠️ Error</h2>
                <p>${message}</p>
            </div>
        `;
    }
}

/**
 * Get user's preferred language from localStorage or browser
 * @returns {string} Language code
 */
function getPreferredLanguage() {
    // Check localStorage first
    const stored = localStorage.getItem('preferredLanguage');
    if (stored && TranslationUtils.isLanguageSupported(stored)) {
        return stored;
    }
    
    // Check browser language
    const browserLang = navigator.language.split('-')[0];
    if (TranslationUtils.isLanguageSupported(browserLang)) {
        return browserLang;
    }
    
    // Default to English
    return 'en';
}

/**
 * Save language preference to localStorage
 * @param {string} lang - Language code to save
 */
function saveLanguagePreference(lang) {
    try {
        localStorage.setItem('preferredLanguage', lang);
    } catch (error) {
        console.warn('Could not save language preference:', error);
    }
}

/**
 * Update page content based on selected language
 * @param {string} lang - Language code
 */
function updateContent(lang) {
    console.log('Updating content to language:', lang);
    
    if (!TranslationUtils.isLanguageSupported(lang)) {
        console.error(`Language ${lang} not supported`);
        return;
    }

    const translation = TranslationUtils.getLanguageTranslations(lang);
    console.log('Translation object:', translation);
    
    // Update text content for all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        const translatedText = TranslationUtils.getTranslation(lang, key);
        
        if (translatedText) {
            console.log(`Updating ${key} to:`, translatedText);
            element.textContent = translatedText;
        }
    });

    // Update placeholders for all elements with data-i18n-placeholder attribute
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        const translatedPlaceholder = TranslationUtils.getTranslation(lang, key);
        
        if (translatedPlaceholder) {
            element.placeholder = translatedPlaceholder;
        }
    });

    // Update language indicator
    const langDisplay = document.getElementById('current-lang-display');
    if (langDisplay) {
        const langName = TranslationUtils.getTranslation(lang, 'langName', lang.toUpperCase());
        langDisplay.textContent = langName;
    }
    
    // Update document language attribute
    document.documentElement.lang = lang;
    
    // Update active button state
    updateLanguageButtons(lang);
    
    // Add fade-in animation
    addFadeAnimation();

    // Save preference
    saveLanguagePreference(lang);
    
    console.log(`Language updated to: ${lang}`);
}

/**
 * Update the active state of language buttons
 * @param {string} activeLang - Currently active language
 */
function updateLanguageButtons(activeLang) {
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-lang') === activeLang) {
            btn.classList.add('active');
        }
    });
}

/**
 * Add fade-in animation to content
 */
function addFadeAnimation() {
    const content = document.querySelector('.content');
    if (content) {
        content.classList.remove('fade-in');
        // Small delay to trigger animation
        setTimeout(() => {
            content.classList.add('fade-in');
        }, 10);
    }
}

/**
 * Setup event listeners for language buttons
 */
function setupLanguageButtons() {
    document.querySelectorAll('.lang-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const lang = e.target.getAttribute('data-lang');
            console.log('Language button clicked:', lang);
            
            if (TranslationUtils.isLanguageSupported(lang)) {
                updateContent(lang);
            } else {
                console.error(`Attempted to switch to unsupported language: ${lang}`);
            }
        });
    });
}

/**
 * Setup textarea persistence (save/load content)
 */
function setupTextareaPersistence() {
    document.querySelectorAll('.answer-area').forEach((textarea, index) => {
        const key = `reflection_answer_${index}`;
        
        // Load saved content
        try {
            const saved = localStorage.getItem(key);
            if (saved) {
                textarea.value = saved;
            }
        } catch (error) {
            console.warn('Could not load saved textarea content:', error);
        }
        
        // Save on input with debouncing
        let saveTimeout;
        textarea.addEventListener('input', () => {
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(() => {
                try {
                    localStorage.setItem(key, textarea.value);
                } catch (error) {
                    console.warn('Could not save textarea content:', error);
                }
            }, 500); // 500ms debounce
        });
    });
}

/**
 * Setup keyboard shortcuts
 */
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Alt + 1, 2, 3 for language switching
        if (e.altKey && !e.ctrlKey && !e.shiftKey) {
            const languages = TranslationUtils.getAvailableLanguages();
            const keyMap = { '1': 0, '2': 1, '3': 2 };
            const index = keyMap[e.key];
            
            if (index !== undefined && languages[index]) {
                e.preventDefault();
                updateContent(languages[index]);
            }
        }
    });
}

/**
 * Initialize the application
 */
function init() {
    console.log('Initializing Student Reflection Page...');
    console.log('Available languages:', TranslationUtils.getAvailableLanguages());
    
    // Get and set initial language
    const preferredLang = getPreferredLanguage();
    console.log('Initial language:', preferredLang);
    updateContent(preferredLang);

    // Setup event listeners
    setupLanguageButtons();
    setupTextareaPersistence();
    setupKeyboardShortcuts();
    
    // Handle browser language change (if supported)
    if ('onlanguagechange' in window) {
        window.addEventListener('languagechange', () => {
            const newLang = getPreferredLanguage();
            updateContent(newLang);
        });
    }
    
    console.log('Application initialized successfully!');
}

/**
 * Export functions for testing (if in Node.js environment)
 */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getPreferredLanguage,
        updateContent,
        setupLanguageButtons,
        init
    };
}