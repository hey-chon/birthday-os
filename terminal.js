import { ASCII, COMMANDS, SITE_URL, countdown, runCommand } from './shell.js';

const output = document.getElementById('output');
const field = document.getElementById('command');
const welcome = document.getElementById('welcome');
const form = document.getElementById('command-form');
const label = form.querySelector('label');
const history = [];
let installed = false, job = null, historyIndex = -1, draft = '';
const PACKAGES = [
  'birthday-keyring', 'bebii-base', 'love-lib', 'memory-cache',
  'smile-engine', 'hug-protocol', 'pink-palette', 'heart-fonts',
  'wish-daemon', 'cake-utils', 'candle-driver', 'surprise-core',
  'october-clock', 'letter-archive', 'birthday-launcher', 'birthday-os',
];
const HELP = [
  'guide / help             show the commands',
  'pkg install birthday-os   install the birthday package',
  'open birthday            open your birthday website',
  'neofetch                 show Birthday OS',
  'countdown                time until October 17',
  'ls                       list files',
  'cat letter.txt           read your letter',
  'cat birthday.conf        birthday details',
  'whoami / date / pwd      you / Manila time / directory',
  'echo <text>              print a message',
  'love                     a little reminder',
  'pkg list / pkg update    packages / refresh repository',
  'history                  previous commands',
  'clear / reboot           clear screen / restart',
].join('\n');
function text(parent, value, className = 'output') {
  const element = document.createElement('div');
  element.className = className;
  element.textContent = value;
  parent.append(element);
  return element;
}
function logo(parent) {
  const art = document.createElement('pre');
  art.className = 'ascii'; art.textContent = ASCII; art.setAttribute('aria-label', 'Birthday OS ASCII logo');
  parent.append(art);
  text(parent, 'Birthday OS 1.0.0\nOctober 17, 2026 · for bebii');
}
function focus() { field.focus({ preventScroll: true }); }
function scroll() { form.scrollIntoView({ block: 'nearest' }); }
function reset() { output.replaceChildren(); welcome.hidden = true; }
function render(parent, result) {
  if (result.kind === 'neofetch') return logo(parent);
  if (result.kind === 'guide') return text(parent, 'Here’s how to start, bebii:\n\n1. Type: pkg install birthday-os\n   Press Enter and wait for all 16 packages to finish.\n2. Type: open birthday\n   Press Enter to visit your birthday website.\n\nYou can also try:\n\n' + HELP + '\n\nType one command at a time, then press Enter.');
  if (result.kind === 'help') return text(parent, HELP);
  if (result.kind === 'countdown') {
    const time = countdown();
    return text(parent, time.complete ? 'Happy birthday, bebii! ♡' : `${time.days}d ${time.hours}h ${time.minutes}m ${time.seconds}s until your birthday, bebii.`);
  }
  text(parent, result.lines?.join('\n') || '', `output ${result.tone || ''}`);
  if (result.kind === 'open') {
    const link = document.createElement('a');
    link.href = SITE_URL; link.target = '_blank'; link.rel = 'noopener noreferrer';
    link.textContent = 'Open your birthday website ↗'; parent.append(link);
    window.open(SITE_URL, '_blank', 'noopener,noreferrer');
  }
}
function execute(raw) {
  if (job) return;
  const command = raw.trim();
  if (!command) return;
  history.push(command); historyIndex = -1; draft = ''; field.value = '';
  const result = runCommand(command, { installed, history });
  if (result.kind === 'clear' || result.kind === 'reboot') {
    reset();
    if (result.kind === 'reboot') { installed = false; welcome.hidden = false; label.textContent = 'bebii@termux:~ $'; }
    focus(); return;
  }
  const entry = document.createElement('div'); entry.className = 'entry'; output.append(entry);
  text(entry, `${label.textContent} ${command}`, 'prompt');
  if (result.kind === 'install') {
    text(entry, 'Reading package lists… Done\nResolving dependencies… Done\n16 packages to install.\n', 'output muted');
    let stage = 0, percent = 0;
    let row = text(entry, '', 'package');
    const update = () => {
      row.textContent = `${String(stage + 1).padStart(2, '0')}/16  ${PACKAGES[stage]}\n`;
      text(row, `[${'█'.repeat(Math.floor(percent / 10))}${'░'.repeat(10 - Math.floor(percent / 10))}] ${percent}%`, 'progress');
    };
    update();
    field.readOnly = true;
    job = { entry, timer: setInterval(() => {
      percent = Math.min(100, percent + 34); update();
      if (percent === 100) {
        stage++;
        if (stage === PACKAGES.length) {
          clearInterval(job.timer); job = null; installed = true; field.readOnly = false;
          text(entry, '\nVerifying packages… Done\nSetting up birthday-os… Done\nbirthday-os installed, bebii.', 'output success');
          logo(entry);
          text(entry, '\nopen birthday', 'output muted');
          label.textContent = 'bebii@birthday-os:~ $'; focus();
        } else { percent = 0; row = text(entry, '', 'package'); update(); }
      }
      scroll();
    }, 260) };
  } else render(entry, result);
  scroll(); focus();
}
function cancel() {
  if (job) {
    clearInterval(job.timer); text(job.entry, '^C\nInstallation cancelled, bebii.', 'output muted');
    job = null; field.readOnly = false;
  } else if (field.value) text(output, `${label.textContent} ${field.value}\n^C`, 'entry');
  field.value = ''; historyIndex = -1; scroll(); focus();
}
form.addEventListener('submit', event => { event.preventDefault(); execute(field.value); });
field.addEventListener('keydown', event => {
  if (event.ctrlKey && event.key.toLowerCase() === 'c') { event.preventDefault(); cancel(); return; }
  if (event.ctrlKey && event.key.toLowerCase() === 'l') { event.preventDefault(); if (!job) reset(); return; }
  if (job) { event.preventDefault(); return; }
  if (event.key === 'ArrowUp') {
    event.preventDefault(); if (!history.length) return;
    if (historyIndex === -1) draft = field.value;
    historyIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
    field.value = history[historyIndex];
  } else if (event.key === 'ArrowDown') {
    event.preventDefault(); if (historyIndex === -1) return;
    historyIndex++;
    if (historyIndex === history.length) { historyIndex = -1; field.value = draft; }
    else field.value = history[historyIndex];
  } else if (event.key === 'Tab') {
    event.preventDefault(); const matches = COMMANDS.filter(command => command.startsWith(field.value));
    if (matches.length === 1) field.value = matches[0];
    else if (matches.length > 1 && field.value) text(output, matches.join('    '), 'entry muted');
  }
});
document.addEventListener('click', event => {
  if (!event.target.closest('a') && !window.getSelection()?.toString()) focus();
});
