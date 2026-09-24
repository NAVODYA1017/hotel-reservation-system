// The Regent Court — global site script
// Reconstructed: handles the mobile nav toggle referenced in
// templates/fragments/layout.html (#menuToggle / #mainNav).

document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('menuToggle');
  const nav = document.getElementById('mainNav');

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      nav.classList.toggle('open');
    });

    // Close the mobile menu when a nav link is clicked.
    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => nav.classList.remove('open'));
    });
  }
});
