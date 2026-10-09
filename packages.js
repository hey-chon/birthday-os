// All repository traffic and package operations below are fictional session logs.
export const BIRTHDAY_PACKAGES = [
  'birthday-keyring', 'bebii-base', 'love-lib', 'memory-cache',
  'smile-engine', 'hug-protocol', 'pink-palette', 'heart-fonts',
  'wish-daemon', 'cake-utils', 'candle-driver', 'surprise-core',
  'october-clock', 'letter-archive', 'birthday-launcher', 'birthday-os',
];
export const ART_PACKAGES = ['ascii-keyring', 'text-renderer', 'portrait-archive', 'ascii.art'];
const REPO = 'https://repo.bebii.os/termux';
export function packageLog(kind) {
  const steps = [];
  const add = (message, tone = '', delay = 180) => steps.push({ message, tone, delay });
  add(`Checking availability of current mirror:\n[*] ${REPO}: ok`, 'muted', 420);
  add(`Get:1 ${REPO} birthday InRelease [14.2 kB]`);
  add(`Get:2 ${REPO} birthday/main all Packages [86.4 kB]`);
  add('Fetched 100.6 kB in 1s (100.6 kB/s)');
  add('Reading package lists... Done');
  add('Building dependency tree... Done');
  add('Reading state information... Done');
  add('Checking repository signatures... OK', 'success');
  if (kind === 'update') {
    add('Comparing installed versions with repository candidates...');
    add('All packages are up to date, bebii.', 'success');
    return steps;
  }
  const packages = kind === 'install-art' ? ART_PACKAGES : BIRTHDAY_PACKAGES;
  const target = packages.at(-1);
  const sizes = packages.map((_, index) => 128 + index * 73);
  const total = sizes.reduce((sum, size) => sum + size, 0);
  add(`The following additional packages will be installed:\n  ${packages.slice(0, -1).join('  ')}`);
  add(`The following NEW packages will be installed:\n  ${packages.join('  ')}`);
  add(`0 upgraded, ${packages.length} newly installed, 0 to remove and 0 not upgraded.\nNeed to get ${total.toLocaleString('en-US')} kB of archives.\nAfter this operation, ${(total * 2.8 / 1024).toFixed(1)} MB of additional disk space will be used.`);
  add('Starting automatic birthday-session installation...', 'muted', 500);
  packages.forEach((name, index) => {
    add(`Get:${index + 1} ${REPO} birthday/main all ${name} 1.0.0 [${sizes[index]} kB]`);
    add(`  Downloading ${name}_1.0.0_all.deb ... ${sizes[index]} kB / ${sizes[index]} kB (100%)`, 'muted');
    add(`  [██████████] ${String(index + 1).padStart(2, '0')}/${packages.length} archives received`, 'progress');
  });
  add(`Fetched ${total.toLocaleString('en-US')} kB of archives.\nVerifying SHA256 checksums... Done\nAuthenticating package archives... Done`, 'success', 400);
  add('(Reading database ... 247 files and directories currently installed.)');
  packages.forEach(name => {
    add(`Selecting previously unselected package ${name}.`);
    add(`Preparing to unpack .../${name}_1.0.0_all.deb ...`, 'muted');
    add(`Unpacking ${name} (1.0.0) ...`);
  });
  packages.forEach(name => {
    add(`Setting up ${name} (1.0.0) ...`);
    if (name === 'birthday-keyring' || name === 'ascii-keyring') add('  Registering trusted birthday repository keys... OK', 'muted');
    if (name === 'portrait-archive') add('  Indexing artwork: 1 / bebii ... OK', 'muted');
    if (name === 'birthday-launcher') add('  Registering birthday website launcher... OK', 'muted');
  });
  add('Processing triggers for terminal-command-cache (1.0.0) ...');
  add('Processing triggers for birthday-session (1.0.0) ...');
  add('Updating command index... Done\nChecking package dependencies... Done\nNo broken packages found.', 'muted', 400);
  add(`${target} installed, bebii.`, 'success');
  return steps;
}