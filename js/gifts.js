async function loadTranslations(lang) {
    try {
        const response = await fetch(`/locales/${lang}.json`);
        const translations = await response.json();
        return translations;
    } catch (error) {
        console.error("Error loading translations:", error);
        return {};
    }
}

let currentTranslations = {};
let currentLanguage = 'en'; // Default language

async function changeLanguage(lang) {
    currentLanguage = lang;
    currentTranslations = await loadTranslations(lang);
    updateText(); // Function to update the text on the page
}

function translate(key) {
    // Access nested keys using dot notation if needed
    const keys = key.split('.');
    let value = currentTranslations;
    for (const k of keys) {
        if (value && value.hasOwnProperty(k)) {
            value = value[k];
        } else {
            return key; // Return the key if translation not found
        }
    }
    return value;
}

function updateText() {
    // Example: Update elements with the 'data-i18n' attribute
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (element.childNodes.length > 0) {
            // If it has children, iterate through them and translate text nodes
            element.childNodes.forEach(node => {
                if (node.nodeType === Node.TEXT_NODE) {
                    node.textContent = translate(key);
                } else if (node.hasAttribute && node.hasAttribute('data-i18n')) {
                    // If a child element also has the data-i18n attribute, translate its text
                    node.textContent = translate(node.getAttribute('data-i18n'));
                }
            });
        } else {
            // If it has no children (only text), directly translate the textContent
            element.textContent = translate(key);
        }
    });

    // Update language buttons
    document.querySelectorAll('.language-switcher button').forEach(button => {
        button.classList.remove('active');
        if (button.getAttribute('data-lang') === currentLanguage) {
            button.classList.add('active');
        }
    });
}

// Initial load (e.g., based on browser language or default)
document.addEventListener('DOMContentLoaded', () => {
    const browserLang = navigator.language.split('-')[0]; // Get primary language code
    const initialLang = ['en', 'it', 'tr'].includes(browserLang) ? browserLang : currentLanguage;
    changeLanguage(initialLang);

    // Event listeners for language buttons
    document.querySelectorAll('.language-switcher button').forEach(button => {
        button.addEventListener('click', function () {
            changeLanguage(this.getAttribute('data-lang'));
        })
    });
});