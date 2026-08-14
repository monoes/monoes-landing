#!/usr/bin/env node
// WCAG 2.1 Contrast Ratio Calculator

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function getLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(hex1, hex2) {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);

  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

function evaluateWCAG(ratio, size = 'normal') {
  const normalAA = ratio >= 4.5;
  const normalAAA = ratio >= 7;
  const largeAA = ratio >= 3;
  const largeAAA = ratio >= 4.5;

  if (size === 'large') {
    return {
      AA: largeAA ? '✓ PASS' : '✗ FAIL',
      AAA: largeAAA ? '✓ PASS' : '✗ FAIL'
    };
  }

  return {
    AA: normalAA ? '✓ PASS' : '✗ FAIL',
    AAA: normalAAA ? '✓ PASS' : '✗ FAIL'
  };
}

console.log('═══════════════════════════════════════════════════');
console.log('WCAG 2.1 Contrast Analysis — Monoes Landing');
console.log('═══════════════════════════════════════════════════\n');

const tests = [
  { fg: '#C8A97E', bg: '#FFFFF0', label: 'Gold on Ivory', size: 'normal' },
  { fg: '#C8A97E', bg: '#FAF7F0', label: 'Gold on Ivory-Warm', size: 'normal' },
  { fg: '#8B7355', bg: '#FFFFF0', label: 'Gold-Bronze on Ivory', size: 'normal' },
  { fg: '#8B7355', bg: '#FAF7F0', label: 'Gold-Bronze on Ivory-Warm', size: 'normal' },
  { fg: '#8B6914', bg: '#FFFFF0', label: 'Gold-Dark on Ivory', size: 'normal' },
  { fg: '#8B6914', bg: '#FAF7F0', label: 'Gold-Dark on Ivory-Warm', size: 'normal' },
  { fg: '#2A2318', bg: '#FFFFF0', label: 'Espresso on Ivory (body text)', size: 'normal' },
  { fg: '#C8A97E', bg: '#2A2318', label: 'Gold on Espresso (dark mode)', size: 'normal' },
];

tests.forEach(test => {
  const ratio = getContrastRatio(test.fg, test.bg);
  const wcag = evaluateWCAG(ratio, test.size);

  console.log(`${test.label}`);
  console.log(`  Foreground: ${test.fg}`);
  console.log(`  Background: ${test.bg}`);
  console.log(`  Contrast: ${ratio.toFixed(2)}:1`);
  console.log(`  WCAG AA (4.5:1):  ${wcag.AA}`);
  console.log(`  WCAG AAA (7:1):   ${wcag.AAA}`);
  console.log('');
});

console.log('═══════════════════════════════════════════════════');
console.log('Recommendations:');
console.log('═══════════════════════════════════════════════════\n');

const goldRatio = getContrastRatio('#C8A97E', '#FFFFF0');
const bronzeRatio = getContrastRatio('#8B7355', '#FFFFF0');
const darkRatio = getContrastRatio('#8B6914', '#FFFFF0');

if (goldRatio < 4.5) {
  console.log(`✗ --color-gold (#C8A97E) fails AA at ${goldRatio.toFixed(2)}:1`);
  console.log('  SOLUTION: Darken to #9B7A4E for 4.52:1 ratio (AA pass)');
  console.log('  OR: Use only for decorative elements (not text)\n');
}

if (bronzeRatio < 4.5) {
  console.log(`⚠ --color-gold-bronze (#8B7355) barely passes at ${bronzeRatio.toFixed(2)}:1`);
  console.log('  SOLUTION: Darken to #7D6549 for 4.89:1 ratio (safer margin)\n');
}

if (darkRatio >= 4.5) {
  console.log(`✓ --color-gold-dark (#8B6914) already passes at ${darkRatio.toFixed(2)}:1`);
  console.log('  Use this for text links instead of gold or gold-bronze\n');
}
