const menu = document.querySelector('.site-menu');
document.querySelector('.menu-toggle').addEventListener('click', () => menu.showModal());
menu.querySelectorAll('nav a').forEach((link) => {
  link.addEventListener('click', () => menu.close());
});

const hero = document.querySelector('.portfolio-hero');
const frames = Array.from(hero.querySelectorAll('.frame'));
const counter = hero.querySelector('#frame-current');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let active = 0;
let transitioning = false;

async function moveFrame(direction) {
  if (transitioning) return;
  transitioning = true;
  hero.classList.add('has-moved');

  const outgoing = frames[active];
  active = (active + direction + frames.length) % frames.length;
  const incoming = frames[active];
  incoming.hidden = false;
  incoming.classList.add('is-entering');
  outgoing.setAttribute('aria-hidden', 'true');
  counter.textContent = String(active + 1).padStart(2, '0');

  if (!reducedMotion.matches) {
    const duration = 1050;
    const easing = 'cubic-bezier(.76,0,.24,1)';
    const enter = incoming.animate([
      { transform: 'translateX(' + direction * 100 + '%)' },
      { transform: 'translateX(0)' }
    ], { duration, easing });
    const exit = outgoing.animate([
      { transform: 'translateX(0)' },
      { transform: 'translateX(' + direction * -36 + '%)' }
    ], { duration, easing, fill: 'forwards' });
    incoming.querySelector('img').animate([
      { transform: 'translateX(' + direction * -28 + '%) scale(1.35)' },
      { transform: 'translateX(0) scale(1)' }
    ], { duration, easing });
    incoming.querySelector('.frame-copy').animate([
      { opacity: 0, translate: direction * 95 + 'px 0' },
      { opacity: 1, translate: '0 0' }
    ], { delay: 310, duration: 740, fill: 'backwards', easing });
    await enter.finished;
    exit.cancel();
  }

  outgoing.hidden = true;
  outgoing.classList.remove('is-current');
  outgoing.removeAttribute('aria-hidden');
  incoming.classList.replace('is-entering', 'is-current');
  transitioning = false;
}

hero.querySelectorAll('[data-direction]').forEach((button) => {
  button.addEventListener('click', () => moveFrame(Number(button.dataset.direction)));
});
hero.addEventListener('keydown', (event) => {
  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
  event.preventDefault();
  moveFrame(event.key === 'ArrowRight' ? 1 : -1);
});

let lastWheel = 0;
let wheelDistance = 0;
hero.addEventListener('wheel', (event) => {
  if (event.ctrlKey || reducedMotion.matches || Math.abs(hero.getBoundingClientRect().top) > 3) return;
  const distance = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
  if (!distance) return;

  const now = performance.now();
  if (now - lastWheel > 160) wheelDistance = 0;
  lastWheel = now;
  const direction = Math.sign(distance);
  if (!transitioning && !wheelDistance && (active + direction < 0 || active + direction >= frames.length)) return;

  event.preventDefault();
  if (transitioning || wheelDistance === Infinity) return;
  wheelDistance += Math.abs(distance) * (event.deltaMode ? 18 : 1);
  if (wheelDistance < 22) return;
  wheelDistance = Infinity;
  moveFrame(direction);
}, { passive: false });

let touchStart;
hero.addEventListener('touchstart', (event) => {
  const touch = event.changedTouches[0];
  touchStart = [touch.clientX, touch.clientY];
}, { passive: true });
hero.addEventListener('touchend', (event) => {
  if (!touchStart) return;
  const touch = event.changedTouches[0];
  const x = touch.clientX - touchStart[0];
  const y = touch.clientY - touchStart[1];
  touchStart = undefined;
  if (Math.abs(x) > 45 && Math.abs(x) > Math.abs(y)) moveFrame(x < 0 ? 1 : -1);
}, { passive: true });

if (!reducedMotion.matches && 'IntersectionObserver' in window) {
  document.documentElement.classList.add('js-motion');
  const reveal = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      reveal.unobserve(entry.target);
    });
  }, { threshold: 0.13 });
  document.querySelectorAll('.reveal').forEach((element) => reveal.observe(element));
}


const contactForm = document.querySelector('.contact-form');
contactForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const fields = new FormData(contactForm);
  const subject = 'Zapytanie o aranżację okien — ' + fields.get('city').trim();
  const body = [
    'Imię i nazwisko: ' + fields.get('name').trim(),
    'E-mail: ' + fields.get('email').trim(),
    'Telefon: ' + (fields.get('phone').trim() || '—'),
    'Miejscowość: ' + fields.get('city').trim(),
    '',
    fields.get('message').trim()
  ].join('\r\n');
  window.location.href = 'mailto:laurales@laurales.pl?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
});

const projectBoard = document.querySelector('.project-board');
const projectNav = document.querySelector('.project-nav');
const projectNumbers = projectNav.querySelector('.project-side-numbers');
const projectActive = projectNav.querySelector('.project-active-number');

projectNav.querySelectorAll('[data-project-shift]').forEach((button) => {
  button.addEventListener('click', () => {
    const projects = Array.from(projectBoard.querySelectorAll('.board-project'));
    const first = projects[0];
    const last = projects.at(-1);
    if (button.dataset.projectShift === '1') {
      projectBoard.append(first);
    } else {
      first.before(last);
    }
    const [left, middle, featured] = projectBoard.querySelectorAll('.board-project');
    projectNumbers.textContent = left.dataset.project + ' ' + middle.dataset.project;
    projectActive.textContent = featured.dataset.project;
  });
});
