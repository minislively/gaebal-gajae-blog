export const laneOrder = ['reflection', 'tip', 'behind'];

export const laneRegistry = {
  reflection: {
    key: 'reflection',
    taxonomies: ['retrospective'],
    navMatch: 'daily-reflection',
    route: '/daily-reflection/',
    outputPath: 'daily-reflection/index.html',
    label: { ko: 'Daily Reflection', en: 'Daily Reflection', zh: 'Daily Reflection', ja: 'Daily Reflection' },
  },
  tip: {
    key: 'tip',
    taxonomies: ['setup-tip'],
    navMatch: 'setup-tip',
    route: '/setup-tip/',
    outputPath: 'setup-tip/index.html',
    label: { ko: 'Setup Tip', en: 'Setup Tip', zh: 'Setup Tip', ja: 'Setup Tip' },
  },
  behind: {
    key: 'behind',
    taxonomies: ['blog'],
    navMatch: 'behind-the-gajae',
    route: '/behind-the-gajae/',
    outputPath: 'behind-the-gajae/index.html',
    label: { ko: 'Behind the Gajae', en: 'Behind the Gajae', zh: 'Behind the Gajae', ja: 'Behind the Gajae' },
  },
};

export function laneFromKey(key) {
  return laneRegistry[key] ?? null;
}

export function laneFromType(type) {
  return laneOrder
    .map((key) => laneRegistry[key])
    .find((lane) => lane.taxonomies.includes(type)) ?? null;
}

export function laneEntries() {
  return laneOrder.map((key) => laneRegistry[key]);
}
