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

const slot3 = document.getElementById('slot3');

if (slot3) {
  const slot4 = document.getElementById('slot4');
  const slot4Link = document.getElementById('slot4Link');
  const hint = document.getElementById('buildHint');
  const choices = [...slot3.querySelectorAll('.build-choice')];

  const select = picked => {
    const item = picked ? picked.dataset.item : null;
    // Items in the same group (e.g. Last Whisper upgrades) can't be stacked
    const group = picked ? picked.dataset.group : null;

    choices.forEach(choice => {
      const isPicked = choice === picked;
      choice.setAttribute('aria-pressed', isPicked);
      choice.closest('.build-branch-row').hidden = picked !== null && !isPicked;
    });

    slot3.classList.toggle('collapsed', picked !== null);
    slot4.hidden = picked === null;
    slot4Link.hidden = picked === null;

    slot4.querySelectorAll('.build-branch-row').forEach(row => {
      row.hidden = row.dataset.item === item ||
        (group !== undefined && group !== null && row.dataset.group === group);
    });

    hint.textContent = picked === null
      ? 'Pick a 3rd item to see your 4th item options.'
      : 'Click your 3rd item again to change it.';
  };

  choices.forEach(choice => {
    choice.addEventListener('click', () => {
      const alreadyPicked = choice.getAttribute('aria-pressed') === 'true';
      select(alreadyPicked ? null : choice);
    });
  });
}

document.querySelectorAll('.tree-tabs').forEach(tabs => {
  const column = tabs.parentElement;

  tabs.querySelectorAll('.tree-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const tree = tab.dataset.tree;

      tabs.querySelectorAll('.tree-tab').forEach(t => {
        const isActive = t === tab;
        t.classList.toggle('active', isActive);
        t.setAttribute('aria-selected', isActive);
      });

      column.querySelectorAll('.tree-panel').forEach(panel => {
        panel.classList.toggle('active', panel.dataset.tree === tree);
      });
    });
  });
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
