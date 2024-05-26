window.addEventListener('load', function() {
    const loadingSection = document.querySelector('.loading');
    setTimeout(function() {
      loadingSection.style.display = 'none';
    }, 5000); // 5000 milliseconds = 5 seconds
  });
  