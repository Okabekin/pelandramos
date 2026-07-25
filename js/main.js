document.getElementById('year').textContent = new Date().getFullYear();

const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', isOpen);
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

document.querySelectorAll('.level-cells[data-active]').forEach(row => {
  const active = row.dataset.active.split(',').map(n => n.trim());
  for (let level = 1; level <= 18; level++) {
    const cell = document.createElement('span');
    cell.className = 'level-cell';
    cell.textContent = level;
    if (active.includes(String(level))) cell.classList.add('active');
    row.appendChild(cell);
  }
});

document.querySelectorAll('.rune-expandable').forEach(item => {
  const detail = item.nextElementSibling;
  if (!detail || !detail.classList.contains('rune-detail')) return;

  const toggle = () => {
    const isOpen = item.classList.toggle('open');
    detail.classList.toggle('open', isOpen);
    item.setAttribute('aria-expanded', isOpen);
  };

  item.addEventListener('click', toggle);
  item.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggle();
    }
  });
});
