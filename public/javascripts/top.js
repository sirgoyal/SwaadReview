const backToTop = document.getElementById("backToTop");
backToTop.addEventListener('onclick', () => window.scrollTo({
  top: 0,
  behavior: 'smooth',
}));
