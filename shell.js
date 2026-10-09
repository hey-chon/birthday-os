export const SITE_URL = 'https://birthday-website.netlify.app';
export const BIRTHDAY = '2026-10-17T00:00:00+08:00';
export const COMMANDS = ['guide', 'help', 'neofetch', 'pkg install birthday-os', 'pkg list', 'countdown', 'ls', 'cat letter.txt', 'open birthday', 'whoami', 'date', 'pwd', 'clear', 'history', 'reboot', 'echo', 'uname', 'love'];
export const ASCII = String.raw`████  █████ ████  █████ █   █ ████   ███  █   █
█   █   █   █   █   █   █   █ █   █ █   █  █ █
████    █   ████    █   █████ █   █ █████   █
█   █   █   █  █    █   █   █ █   █ █   █   █
████  █████ █   █   █   █   █ ████  █   █   █

                   ███   ████
                  █   █ █
                  █   █  ███
                  █   █     █
                   ███  ████`;
export const FILES = {
  'letter.txt': ['Dear bebii,', '', 'This little universe was made just for you.', 'Every command, every tiny detail — all for your smile.', '', 'Happy birthday, bebii. You are my favorite person.', 'Here’s to more memories, more laughter, and more us.', '', 'With all my love,', 'Your bebii ♡'],
  'birthday.conf': ['name = "Jera"', 'call_sign = "bebii"', 'birthday = "2026-10-17"', 'timezone = "Asia/Manila"', `website = "${SITE_URL}"`],
  'readme.txt': ['bebii-os / birthday edition', '', 'pkg install birthday-os    Install the birthday package', 'open birthday             Visit your birthday website', 'cat letter.txt            A little something for bebii', 'help                      All available commands'],
};
export function countdown(now = new Date()) {
  const remaining = Math.max(0, new Date(BIRTHDAY).getTime() - now.getTime());
  const days = Math.floor(remaining / 86400000);
  const hours = Math.floor(remaining / 3600000) % 24;
  const minutes = Math.floor(remaining / 60000) % 60;
  const seconds = Math.floor(remaining / 1000) % 60;
  return { days, hours, minutes, seconds, complete: remaining === 0 };
}
export function tokenize(input) {
  const tokens = [];
  let current = '', quote = null, started = false;
  for (const char of input.trim()) {
    if (quote) { if (char === quote) quote = null; else current += char; started = true; }
    else if (char === '"' || char === "'") { quote = char; started = true; }
    else if (/\s/.test(char)) { if (started) { tokens.push(current); current = ''; started = false; } }
    else { current += char; started = true; }
  }
  if (quote) return { error: 'Unclosed quote. Close the quote and try again, bebii.' };
  if (started) tokens.push(current);
  return { tokens };
}
export function runCommand(input, state = {}, now = new Date()) {
  const parsed = tokenize(input);
  if (parsed.error) return { lines: [parsed.error], tone: 'error' };
  const [command, ...args] = parsed.tokens;
  const text = args.join(' ');
  if (!command) return { lines: [] };
  switch (command.toLowerCase()) {
    case 'help': return { kind: 'help' };
    case 'guide': return { kind: 'guide' };
    case 'neofetch': case 'about': return state.installed ? { kind: 'neofetch' } : { lines: ['Install birthday-os first, bebii: pkg install birthday-os'], tone: 'plain' };
    case 'clear': return { kind: 'clear' };
    case 'reboot': return { kind: 'reboot' };
    case 'whoami': return { lines: ['bebii (Jera) — the birthday girl ♡'], tone: 'success' };
    case 'pwd': return { lines: ['/home/bebii'] };
    case 'ls': return { lines: [Object.keys(FILES).join('    ')], tone: 'cyan' };
    case 'cat': return FILES[text.replace(/^\.\//, '')] ? { lines: FILES[text.replace(/^\.\//, '')], tone: text.includes('letter') ? 'pink' : 'plain' } : { lines: [`cat: ${text || '(missing filename)'}: No such file`], tone: 'error' };
    case 'echo': return { lines: [text] };
    case 'uname': return { lines: ['BebiiOS 1.0.0 birthday-edition / browser-shell'] };
    case 'date': return { lines: [now.toLocaleString('en-PH', { timeZone: 'Asia/Manila', dateStyle: 'full', timeStyle: 'long' })] };
    case 'history': return { lines: (state.history || []).map((item, index) => `${String(index + 1).padStart(3)}  ${item}`) };
    case 'countdown': return { kind: 'countdown' };
    case 'love': return { lines: ['♡  I love you, bebii. More than words (or commands) can say.'], tone: 'pink' };
    case 'open': case 'birthday': {
      if (command === 'open' && !['birthday', 'website', 'birthday-website'].includes(text)) return { lines: ['Usage: open birthday'], tone: 'error' };
      if (!state.installed) return { lines: ['birthday-os is not installed yet, bebii.', 'Run: pkg install birthday-os'], tone: 'error' };
      return { kind: 'open', lines: ['Opening your birthday universe, bebii…', SITE_URL], tone: 'success' };
    }
    case 'pkg': {
      if (args[0] === 'install' && args[1] === 'birthday-os' && args.length === 2) return state.installed ? { lines: ['birthday-os 1.0.0 is already installed, bebii.', 'Your birthday is ready. Run: open birthday'], tone: 'success' } : { kind: 'install' };
      if (args[0] === 'list') return { lines: [`birthday-os/stable 1.0.0 ${state.installed ? '[installed]' : '[available]'}`, 'love-notes/stable 1.0.0 [built-in]', 'countdown/stable 1.0.0 [built-in]'], tone: 'cyan' };
      if (args[0] === 'update') return { lines: ['Hit:1 repo.bebii.os birthday InRelease', 'All packages are up to date, bebii.'], tone: 'success' };
      return { lines: ['Usage: pkg install birthday-os | pkg list | pkg update', 'Only birthday-os is available in this simulated repository.'], tone: 'error' };
    }
    case 'sudo': return { lines: ['bebii already has all the love permissions. No sudo needed.'], tone: 'pink' };
    case 'cd': return ['', '~', '/home/bebii', '.'].includes(text) ? { lines: [] } : { lines: [`cd: ${text}: No such directory`], tone: 'error' };
    default: return { lines: [`${command}: command not found`, 'Type guide to see the available commands, bebii.'], tone: 'error' };
  }
}