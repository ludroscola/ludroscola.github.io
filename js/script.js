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

    // Update placeholder for entry code input
    if (currentLanguage === 'en') {
        document.getElementById('entryCode').placeholder = "Enter code";
    } else if (currentLanguage === 'it') {
        document.getElementById('entryCode').placeholder = "Inserisci il codice";
    } else if (currentLanguage === 'tr') {
        document.getElementById('entryCode').placeholder = "Kodu girin";
    }
  }
  
  // Initial load (e.g., based on browser language or default)
  document.addEventListener('DOMContentLoaded', () => {
    const browserLang = navigator.language.split('-')[0]; // Get primary language code
    const initialLang = ['en', 'it', 'tr'].includes(browserLang) ? browserLang : currentLanguage;
    changeLanguage(initialLang);
  
    // Event listeners for language buttons
    document.querySelectorAll('.language-switcher button').forEach(button => {
        button.addEventListener('click', function() {
            changeLanguage(this.getAttribute('data-lang'));
        })
    });
  });


// Entry code handling
document.getElementById('submitCode').addEventListener('click', checkEntryCode);
document.getElementById('entryCode').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        checkEntryCode();
    }
});

function checkEntryCode() {
    const inputCode = document.getElementById('entryCode').value.trim();

    // Sanitize input
    const sanitizedCode = sanitizeInput(inputCode);

    // Check if code is valid
    const hashedItalyCode = -1272046950;
    const hashedTurkiyeCode = 103145374;
    const hashedInputCode = hashCode(sanitizedCode);
    //console.log(sanitizedCode + '=' + hashedInputCode);

    if (hashedInputCode === hashedItalyCode) {
        showEventDetails('italyEvent');
    } else if (hashedInputCode === hashedTurkiyeCode) {
        showEventDetails('turkiyeEvent');
    } else {
        // Show error and shake input
        const entryForm = document.querySelector('.entry-form');
        entryForm.classList.add('shake');

        setTimeout(() => {
            entryForm.classList.remove('shake');
        }, 500);

        // Show toast message
        showToast(currentLanguage === 'en' ? 'Invalid entry code. Please try again.' :
                    (currentLanguage === 'it' ? 'Codice di accesso non valido. Riprova.' :
                    'Geçersiz giriş kodu. Lütfen tekrar deneyin.'));
    }

    // Clear input field
    document.getElementById('entryCode').value = '';
}

// Simple hash function to avoid storing passwords in plain text
function hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}

// Input sanitization function
function sanitizeInput(input) {
    // To lower case
    const lowercase = input.toLowerCase();
    // Remove any HTML tags and scripts
    const sanitized = lowercase.replace(/<[^>]*>?/gm, '').replace('ü', 'u');
    // Further escape special characters
    return sanitized.replace(/[^\w\s]/gi, '');
}

function hideEmptyBoxItems() {
    const boxItems = document.querySelectorAll('.box .box-item');
  
    boxItems.forEach(item => {
      const boxLeft = item.querySelector('.box-left');
      const boxDescription = item.querySelector('.box-description');
  
      if (boxLeft && boxDescription) {
        const leftText = boxLeft.textContent.trim();
        const descriptionText = boxDescription.textContent.trim();
  
        if (!leftText || !descriptionText) {
          item.style.display = 'none'; // Or item.remove() to completely remove from the DOM
        }
      }
    });
  }

// Show toast message
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Show event details
function showEventDetails(eventId) {
    document.getElementById('entryScreen').style.display = 'none';
    document.getElementById(eventId).style.display = 'block';
}

// Back button functionality
document.getElementById('backFromItaly').addEventListener('click', function() {
    document.getElementById('italyEvent').style.display = 'none';
    document.getElementById('entryScreen').style.display = 'flex';
});

document.getElementById('backFromTurkiye').addEventListener('click', function() {
    document.getElementById('turkiyeEvent').style.display = 'none';
    document.getElementById('entryScreen').style.display = 'flex';
});