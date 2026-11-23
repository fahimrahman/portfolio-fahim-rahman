'use strict';
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
if (!reducedMotion.matches) document.documentElement.classList.add('js-motion');

// Choreograph related content as a single, once-only entrance.
function prepareRevealGroup(selector, items, startDelay = 0) {
  document.querySelectorAll(selector).forEach(group => {
    group.classList.add('reveal', 'reveal-group');
    group.querySelectorAll(items).forEach((item, index) => {
      item.classList.remove('reveal');
      item.classList.add('reveal-item');
      item.style.setProperty('--reveal-delay', `${Math.min(startDelay + index * 60, 400)}ms`);
    });
  });
}
prepareRevealGroup('.hero-copy', ':scope > p, :scope > h1, :scope > a');
prepareRevealGroup('.hero-art', ':scope > .art-top, :scope > svg, :scope > .art-bottom', 180);
prepareRevealGroup('.section-heading', '.eyebrow, h2, .section-intro');
prepareRevealGroup('.pipeline', '.pipeline-node');
prepareRevealGroup('.foundation-row', '.foundation-node');
prepareRevealGroup('.ai-principles', ':scope > article');
prepareRevealGroup('.approach-list', ':scope > article');
prepareRevealGroup('.about-layout', ':scope > div, :scope > aside');
prepareRevealGroup('.faq-list', ':scope > details');
prepareRevealGroup('.contact-section', '.eyebrow, h2, .contact-row p, .contact-button, .github-link');

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: .08, rootMargin: '0px 0px -32px 0px' });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

const statement = document.querySelector('[data-word-reveal]');
if (statement) {
  const words = statement.textContent.trim().split(/\s+/);
  statement.setAttribute('aria-label', statement.textContent);
  statement.replaceChildren(...words.flatMap((word, index) => {
    const span = document.createElement('span');
    span.className = 'word';
    span.textContent = word;
    span.dataset.word = word;
    span.setAttribute('aria-hidden', 'true');
    return index ? [document.createTextNode(' '), span] : [span];
  }));
  const wordObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const rowWords = [...statement.querySelectorAll('.word')];
        const position = rowWords.indexOf(entry.target);
        window.setTimeout(() => entry.target.classList.add('active'), position * 60);
        wordObserver.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -20% 0px', threshold: 1 });
  statement.querySelectorAll('.word').forEach(word => wordObserver.observe(word));
}

document.querySelectorAll('.expand-button').forEach(button => {
  button.addEventListener('click', () => {
    const expanded = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', String(!expanded));
    document.getElementById(button.getAttribute('aria-controls')).hidden = expanded;
  });
});

const menuToggle = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('#mobile-menu');
const setMenu = open => {
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  mobileMenu.classList.toggle('open', open);
  mobileMenu.inert = !open;
  document.body.classList.toggle('menu-open', open);
  document.querySelector('main').inert = open;
  document.querySelector('footer').inert = open;
};
menuToggle.addEventListener('click', () => setMenu(menuToggle.getAttribute('aria-expanded') !== 'true'));
mobileMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && mobileMenu.classList.contains('open')) {
    setMenu(false);
    menuToggle.focus();
  }
  if (event.key === 'Tab' && mobileMenu.classList.contains('open')) {
    const focusable = [...document.querySelectorAll('.nav-shell a,.menu-toggle,#mobile-menu a')].filter(el => el.getClientRects().length > 0);
    const current = focusable.indexOf(document.activeElement);
    if (event.shiftKey && current <= 0) { event.preventDefault(); focusable.at(-1).focus(); }
    else if (!event.shiftKey && current === focusable.length - 1) { event.preventDefault(); focusable[0].focus(); }
  }
});
window.matchMedia('(min-width: 761px)').addEventListener('change', event => { if (event.matches) setMenu(false); });

const navigationLinks = document.querySelectorAll('.desktop-nav a,.nav-contact,#mobile-menu a');
const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    navigationLinks.forEach(link => {
      if (link.hash === `#${entry.target.id}`) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  });
}, { rootMargin: '-15% 0px -55% 0px', threshold: 0 });
document.querySelectorAll('main>section[id],#ai').forEach(section => sectionObserver.observe(section));

const stages = {
  interface: { kicker: 'The entry point', title: 'Make the request understandable.', description: 'Capture the request and relevant conversation context. Keep the interface separate from the orchestration layer, so the same capabilities can support different channels.' },
  orchestration: { kicker: 'The coordination layer', title: 'Give the workflow a clear shape.', description: 'Route requests through explicit steps, maintain state, and coordinate specialised agents where they add value. Define how the workflow handles missing context, tool failures, and handoffs.' },
  knowledge: { kicker: 'The connection to real systems', title: 'Ground answers. Bound actions.', description: 'Retrieve relevant knowledge and expose services through defined tool contracts. Validate inputs, apply access checks, and distinguish reading information from taking an action.' },
  response: { kicker: 'The result', title: 'Return something people can use.', description: 'Assemble a response from the available evidence and tool results. Make uncertainty clear and give the user a useful next step when the request cannot be completed.' },
  security: { kicker: 'A foundation across every layer', title: 'Identity stays with the request.', description: 'Carry user and service identity across system boundaries. Apply authorisation at the integration layer, limit tool access, and keep sensitive credentials outside model context.' },
  evaluation: { kicker: 'A foundation across every layer', title: 'Make behaviour measurable.', description: 'Evaluate retrieval quality, intent handling, tool selection, and end to end outcomes. Connect agent traces to API telemetry so failures, latency, and cost can be investigated.' },
  runtime: { kicker: 'A foundation across every layer', title: 'Design for the day after release.', description: 'Use repeatable deployments, health checks, timeouts, and clear recovery paths. Consider availability, concurrency, and operational ownership alongside model behaviour.' }
};
let activeStage = 'interface';
let activeMode = 'text';
const stageButtons = document.querySelectorAll('[data-stage]');
function showStage(stage) {
  activeStage = stage;
  let content = stages[stage];
  if (activeMode === 'voice' && stage === 'interface') content = { kicker: 'The voice entry point', title: 'A natural conversation needs control.', description: 'Manage audio sessions, turn taking, interruptions, and streaming responses. Keep voice session handling separate from the agent workflow, with clear cancellation and recovery when a conversation is interrupted.' };
  if (activeMode === 'voice' && stage === 'response') content = { kicker: 'The spoken result', title: 'Respond at the pace of a conversation.', description: 'Stream concise spoken responses and handle interruption cleanly. Coordinate audio output with workflow state so a cancelled turn does not leave unintended actions running.' };
  document.getElementById('stage-kicker').textContent = content.kicker;
  document.getElementById('stage-title').textContent = content.title;
  document.getElementById('stage-description').textContent = content.description;
  stageButtons.forEach(button => {
    const selected = button.dataset.stage === stage;
    button.classList.toggle('selected', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
}
stageButtons.forEach(button => button.addEventListener('click', () => showStage(button.dataset.stage)));
const modeTabs = [...document.querySelectorAll('[data-mode]')];
function setMode(mode) {
  activeMode = mode;
  modeTabs.forEach(button => {
    const selected = button.dataset.mode === mode;
    button.setAttribute('aria-selected', String(selected));
    button.tabIndex = selected ? 0 : -1;
  });
  document.getElementById('architecture-panel').setAttribute('aria-labelledby', `tab-${mode}`);
  document.getElementById('request-label').textContent = mode === 'voice' ? 'Illustrative voice request' : 'Illustrative text request';
  document.getElementById('request-copy').textContent = mode === 'voice' ? '“Talk me through the latest service report. What should I look at first?”' : '“Find the latest service report and summarise what needs attention.”';
  document.getElementById('request-note').textContent = mode === 'voice' ? 'A visual example only. No microphone or audio recording.' : 'An example flow, independent of any employer system.';
  document.getElementById('interface-node-title').textContent = mode === 'voice' ? 'Voice interface' : 'Text interface';
  document.getElementById('voice-wave').hidden = mode !== 'voice';
  showStage(activeStage);
}
modeTabs.forEach((button,index) => {
  button.addEventListener('click', () => setMode(button.dataset.mode));
  button.addEventListener('keydown', event => {
    if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? modeTabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + modeTabs.length) % modeTabs.length;
    setMode(modeTabs[next].dataset.mode);
    modeTabs[next].focus();
  });
});

document.querySelectorAll('[data-dialog]').forEach(button => {
  button.addEventListener('click', () => document.getElementById(button.dataset.dialog).showModal());
});
document.querySelectorAll('dialog').forEach(dialog => {
  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    const box = dialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
  });
});
reducedMotion.addEventListener('change', event => document.documentElement.classList.toggle('js-motion', !event.matches));
