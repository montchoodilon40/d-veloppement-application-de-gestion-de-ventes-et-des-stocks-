import { getInitials } from '../utils/format';

const COLORS = [
  ['#eef2ff', '#4338ca'],
  ['#e0f2fe', '#0369a1'],
  ['#dcfce7', '#15803d'],
  ['#fef3c7', '#b45309'],
  ['#fee2e2', '#b91c1c'],
  ['#f3e8ff', '#7e22ce'],
  ['#ccfbf1', '#0f766e'],
];

function colorFor(name = '') {
  const hash = [...name].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return COLORS[hash % COLORS.length];
}

export default function Avatar({ name = '', size = 'md' }) {
  const [background, color] = colorFor(name);
  return (
    <span className={`avatar avatar-${size}`} style={{ background, color }} title={name}>
      {getInitials(name)}
    </span>
  );
}
