var languageSwitcher = document.querySelector('.language-switcher');

var translations = {
    'en': {
        'face-scanner': 'Face scanner',
        'make-sure-face-visible': '▸ Make sure your entire face is visible.',
        'press-start-when-ready': '▸ Press the start button when you are ready.',
        'age': 'Age',
        'gender': 'Gender',
        'emotion': 'Emotion'
    },
    'nl': {
        'face-scanner': 'Gezichtsscanner',
        'make-sure-face-visible': '▸ Zorg ervoor dat je hele gezicht zichtbaar is.',
        'press-start-when-ready': '▸ Druk op de startknop als je klaar bent.',
        'age': 'Leeftijd',
        'gender': 'Geslacht',
        'emotion': 'Emotie'
    }
};

languageSwitcher.addEventListener('click', function() {
    var language;
    if (languageSwitcher.textContent.trim().startsWith('en')) {
        languageSwitcher.innerHTML = 'nl <i class="fas fa-chevron-down"></i>';
        language = 'nl';
    } else {
        languageSwitcher.innerHTML = 'en <i class="fas fa-chevron-down"></i>';
        language = 'en';
    }

    var translatableElements = document.querySelectorAll('[data-translate]');
    translatableElements.forEach(function(element) {
        var key = element.getAttribute('data-translate');
        element.textContent = translations[language][key];
    });
});
