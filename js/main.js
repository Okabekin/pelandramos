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

const buildTree = document.getElementById('buildTree');

if (buildTree) {
  const PATCH = '16.14.1';
  const LAST_SLOT = 5;

  // Items sharing a group build out of the same component, so only one can be owned
  const ITEMS = {
    3036: { name: "Lord Dominik's Regards", group: 'lastwhisper' },
    6694: { name: "Serylda's Grudge", group: 'lastwhisper' },
    3033: { name: 'Mortal Reminder', group: 'lastwhisper' },
    3142: { name: "Youmuu's Ghostblade" },
    6698: { name: 'Profane Hydra' },
    3814: { name: 'Edge of Night' },
    // Only worth building once one of the crit-based armour pen items is up
    3031: { name: 'Infinity Edge', requires: ['3036', '3033'] },
    3046: { name: 'Phantom Dancer' }
  };
  const POOL = ['3036', '6694', '3033', '3142', '6698', '3814', '3031'];
  const FINAL_ITEM = '3046';   // the 6th slot is fixed, bought by selling boots

  const iconUrl = id => `https://ddragon.leagueoflegends.com/cdn/${PATCH}/img/item/${id}.png`;

  const slot3 = document.getElementById('slot3');
  const hint = document.getElementById('buildHint');
  const picks = [];            // picks[0] is the 3rd item, picks[1] the 4th, ...
  const branches = [slot3];
  const links = [];

  for (let slot = 4; slot <= LAST_SLOT; slot++) {
    const link = document.createElement('span');
    link.className = 'build-link';
    const branch = document.createElement('div');
    branch.className = 'build-branch';
    buildTree.append(link, branch);
    links.push(link);
    branches.push(branch);
  }

  // Fixed final node, shown once every choice above it has been made
  const finalLink = document.createElement('span');
  finalLink.className = 'build-link';
  const finalBranch = document.createElement('div');
  finalBranch.className = 'build-branch collapsed';
  finalBranch.innerHTML =
    `<div class="build-branch-row"><div class="build-node">` +
    `<img src="${iconUrl(FINAL_ITEM)}" alt="${ITEMS[FINAL_ITEM].name}" ` +
    `title="${ITEMS[FINAL_ITEM].name} (sell your boots)"></div></div>`;
  buildTree.append(finalLink, finalBranch);

  const ordinal = slot => slot + (slot === 3 ? 'rd' : 'th');

  // An item is offered only if no earlier slot took it or its group,
  // and any item it depends on is already in the path
  const availableAt = (id, depth) => {
    const earlier = picks.slice(0, depth);
    if (earlier.includes(id)) return false;

    const { group, requires } = ITEMS[id];
    if (group && earlier.some(pick => ITEMS[pick].group === group)) return false;
    if (requires && !requires.some(req => earlier.includes(req))) return false;

    return true;
  };

  const choose = (index, id) => {
    const wasPicked = picks[index] === id;
    picks.length = index;      // anything chosen after this slot no longer applies
    if (!wasPicked) picks[index] = id;
    render();
  };

  const makeRow = (index, id) => {
    const row = document.createElement('div');
    row.className = 'build-branch-row';

    const button = document.createElement('button');
    button.className = 'build-node build-choice';
    button.dataset.item = id;
    button.setAttribute('aria-pressed', String(picks[index] === id));
    button.addEventListener('click', () => choose(index, id));

    const img = document.createElement('img');
    img.src = iconUrl(id);
    img.alt = ITEMS[id].name;
    img.title = ITEMS[id].name;

    button.append(img);
    row.append(button);
    return row;
  };

  const render = () => {
    branches.forEach((branch, index) => {
      const picked = picks[index];

      if (index === 0) {
        branch.querySelectorAll('.build-choice').forEach(choice => {
          const isPicked = choice.dataset.item === picked;
          choice.setAttribute('aria-pressed', String(isPicked));
          choice.closest('.build-branch-row').hidden = Boolean(picked) && !isPicked;
        });
      } else {
        const reached = picks.length >= index;
        links[index - 1].hidden = !reached;
        branch.hidden = !reached;

        if (reached) {
          branch.replaceChildren(...POOL
            .filter(id => availableAt(id, index))
            .filter(id => !picked || id === picked)
            .map(id => makeRow(index, id)));
        }
      }

      branch.classList.toggle('collapsed', Boolean(picked));
    });

    const complete = picks.length >= branches.length;
    finalLink.hidden = !complete;
    finalBranch.hidden = !complete;

    const nextSlot = picks.length + 3;
    if (picks.length === 0) {
      hint.textContent = 'Pick a 3rd item to see your 4th item options.';
    } else if (nextSlot <= LAST_SLOT) {
      hint.textContent = `Now pick your ${ordinal(nextSlot)} item.`;
    } else {
      hint.textContent = 'The 6th item is always Phantom Dancer – sell your boots for it. ' +
        'Click any item in the path to change it from there.';
    }
  };

  slot3.querySelectorAll('.build-choice').forEach(choice => {
    choice.addEventListener('click', () => choose(0, choice.dataset.item));
  });

  render();
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
