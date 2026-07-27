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

  // Items sharing a group build out of the same component, so only one can be owned.
  // notes is keyed by which slot the item is being considered for, since the same
  // item can have a different reason to get it depending on when it's picked.
  // A note is only shown while that item's column is the one currently open.
  const ITEMS = {
    3036: {
      name: "Lord Dominik's Regards", group: 'lastwhisper',
      notes: {
        4: "Usually you need armor pen as a 4th item because the enemy already " +
          "bought armor, or their base armor is high enough to make this good on its own. " +
          "Go LDR if the enemy has a lot of HP and you're planning to build into the " +
          "Infinity Edge power spike later &ndash; so when you know the game will run long " +
          "and you'll want that crit power spike.",
        5: "Once you've already gone defensive or gotten your damage from Profane at " +
          "4th, your games usually don't run long enough to reach a 5th item &ndash; but " +
          "if they do stall out, that last item has to be armor pen. LDR is great if the " +
          "enemy has a lot of HP."
      }
    },
    6694: {
      name: "Serylda's Grudge", group: 'lastwhisper',
      notes: {
        4: "Serylda's is the stronger immediate power spike compared to LDR. It's " +
          "300 gold cheaper and gives 10 more AD. Worth considering especially when you're " +
          "not playing into high-HP targets.",
        5: "Serylda's is great if the enemy doesn't have a lot of HP."
      }
    },
    3033: {
      name: 'Mortal Reminder', group: 'lastwhisper',
      notes: {
        4: "Shaco isn't the best at applying anti-heal, but it's still the right " +
          "call in some matchups &ndash; if the enemy has insane healing like Soraka or " +
          "Hecarim. It's my least-bought armor pen item, though.",
        5: "Mortal is fine into heavy healing, but I usually prefer the other options."
      }
    },
    3142: {
      name: "Youmuu's Ghostblade",
      notes: {
        4: {
          default: "Great as a 4th item if you're snowballing hard enough to afford " +
            "another lethality item. The movement speed is always nice to have, but can be " +
            "mandatory into certain comps just so you can actually reach them reliably.",
          afterLDR: "Great as a 4th item option after LDR. The movement speed is always " +
            "nice to have, but can be mandatory into certain comps just so you can " +
            "actually reach them reliably."
        }
      }
    },
    6698: {
      name: 'Profane Hydra',
      notes: {
        4: {
          default: "In some games you're so far ahead that you can afford another " +
            "lethality item at 4th slot &ndash; you still deal true damage in those " +
            "scenarios. Profane is a great pick for this.",
          afterLDR: "Profane is a great choice if you want more damage. It's cheap and " +
            "strong, and as a side effect you can clear minion waves with it."
        },
        5: "A solid last option if you want the most damage after IE. The benefit over " +
          "IE is that it's much cheaper, so in some games you can actually use Profane " +
          "where going IE you might not even finish it."
      }
    },
    // Only worth building once one of the crit-based armour pen items is up
    3031: {
      name: 'Infinity Edge', requires: ['3036', '3033'],
      notes: {
        4: "The most damage item option, great after LDR. If you have enough for a BF " +
          "Sword and don't need the immediate power spike from the other alternatives, " +
          "you can go for this.",
        5: "IE is the most damage you can get. The problem is sometimes not " +
          "having enough money for the BF Sword &ndash; it's really expensive. But once " +
          "you have it, your damage is huge. It's a risk though, since it's so expensive."
      }
    },
    3814: {
      name: 'Edge of Night',
      notes: {
        4: {
          default: "You go Edge of Night 4th when you're really ahead. The spell shield " +
            "and HP can help solidify your lead and protect you from being shut down.",
          afterLDR: "Simply a solid defensive option. The spell shield and HP can help " +
            "protect you from being shut down."
        },
        5: "Getting a defensive item last is always great. In the late game, that extra " +
          "protection can go a long way. Edge of Night is great for that."
      }
    },
    3026: {
      name: 'Guardian Angel',
      notes: {
        4: {
          default: "GA is great if you're ahead as well. Just like other defensive " +
            "options in your 4th slot, it can protect you from being shut down and, when " +
            "you're snowballing, make you feel unkillable. If I can afford a BF Sword, I " +
            "usually consider buying this defensive option &ndash; it's great into AD damage.",
          afterLDR: "Simply a solid defensive option, same as Edge of Night. If I can " +
            "afford a BF Sword, I usually consider buying this defensive option " +
            "&ndash; it's great into AD damage."
        },
        5: "Similar to Edge of Night, GA is another great defensive option. If I " +
          "have enough money for a BF Sword, I go for GA. If I don't and can only afford a " +
          "Serrated Dirk, I go Edge of Night instead."
      }
    },
    3156: {
      name: 'Maw of Malmortius',
      notes: {
        4: "You can also go Maw 4th if you're playing against heavy AP damage as " +
          "your defensive option.",
        5: "Maw is also a good defensive option into heavy AP comps. I mostly buy the " +
          "other alternatives though, since they have stronger effects."
      }
    },
    3046: { name: 'Phantom Dancer' }
  };
  // Order also controls display order within a slot: offensive picks first,
  // defensive ones (Edge of Night, Guardian Angel) last
  const POOL = ['3036', '6694', '3033', '3142', '6698', '3031', '3814', '3026', '3156'];
  const FINAL_ITEM = '3046';   // the 6th slot is fixed, bought by selling boots

  const iconUrl = id => `https://ddragon.leagueoflegends.com/cdn/${PATCH}/img/item/${id}.png`;

  const slot3 = document.getElementById('slot3');
  const hint = document.getElementById('buildHint');
  const picks = [];            // picks[0] is the 3rd item, picks[1] the 4th, ...
  const branches = [slot3];
  const links = [];
  const labels = [slot3.querySelector('.build-col-label')];

  const makeLabel = slot => {
    const label = document.createElement('span');
    label.className = 'build-col-label';
    label.textContent = `${slot}th Item`;
    return label;
  };

  for (let slot = 4; slot <= LAST_SLOT; slot++) {
    const link = document.createElement('span');
    link.className = 'build-link';
    const branch = document.createElement('div');
    branch.className = 'build-branch has-notes';
    branch.dataset.slot = slot;
    const label = makeLabel(slot);
    branch.append(label);
    buildTree.append(link, branch);
    links.push(link);
    branches.push(branch);
    labels.push(label);
  }

  // Fixed final node, shown once every choice above it has been made
  const finalLink = document.createElement('span');
  finalLink.className = 'build-link';
  const finalBranch = document.createElement('div');
  finalBranch.className = 'build-branch collapsed';
  finalBranch.innerHTML =
    `<span class="build-col-label">6th Item</span>` +
    `<div class="build-branch-row"><div class="build-node">` +
    `<img src="${iconUrl(FINAL_ITEM)}" alt="${ITEMS[FINAL_ITEM].name}" ` +
    `title="${ITEMS[FINAL_ITEM].name} (sell your boots)"></div></div>`;
  buildTree.append(finalLink, finalBranch);

  const ordinal = slot => slot + (slot === 3 ? 'rd' : 'th');

  // Once a defensive item or Profane is in the path, the only thing left worth
  // finishing is armor pen &ndash; going back to lethality items or a second
  // defensive item doesn't make sense anymore
  const ARMOR_PEN_LOCK = ['3814', '3026', '3156', '6698'];

  // An item is offered only if no earlier slot took it or its group,
  // and any item it depends on is already in the path
  const availableAt = (id, depth) => {
    const earlier = picks.slice(0, depth);
    if (earlier.includes(id)) return false;

    const { group, requires } = ITEMS[id];
    if (group && earlier.some(pick => ITEMS[pick].group === group)) return false;
    if (requires && !requires.some(req => earlier.includes(req))) return false;
    // The lock only kicks in once one of these is picked at 4th or later &ndash;
    // Profane is also a normal 3rd item choice and shouldn't restrict the 4th slot
    if (earlier.slice(1).some(pick => ARMOR_PEN_LOCK.includes(pick)) && group !== 'lastwhisper') return false;

    return true;
  };

  const choose = (index, id) => {
    const wasPicked = picks[index] === id;
    picks.length = index;      // anything chosen after this slot no longer applies
    if (!wasPicked) picks[index] = id;
    render();
  };

  // Some notes read differently depending on whether the 3rd item was LDR
  // (a scaling/armor pen pick) rather than a lethality item, so a note can
  // either be a plain string or a { default, afterLDR } pair
  const resolveNote = note => {
    if (!note) return null;
    if (typeof note === 'string') return note;
    return picks[0] === '3036' ? (note.afterLDR || note.default) : note.default;
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

    const slotNote = resolveNote(ITEMS[id].notes && ITEMS[id].notes[index + 3]);
    if (slotNote) {
      const note = document.createElement('p');
      note.className = 'build-note';
      note.innerHTML = `<strong>${ITEMS[id].name}</strong>${slotNote}`;
      row.append(note);
    }

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
          branch.replaceChildren(labels[index], ...POOL
            .filter(id => availableAt(id, index))
            .filter(id => !picked || id === picked)
            .map(id => makeRow(index, id)));
        }
      }

      branch.classList.toggle('collapsed', Boolean(picked));
      // Call out the column the visitor is meant to click next
      labels[index].classList.toggle('needs-pick', index === picks.length);
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
