// One-off converter: landing-source.html -> JSX section components.
import fs from 'node:fs';
import { parse } from 'node-html-parser';

const root = parse(fs.readFileSync('tools/landing-source.html', 'utf8'));
const body = root.querySelector('body');
const VOID = new Set(['img', 'br', 'hr', 'input']);
const ATTR = { class: 'className', for: 'htmlFor', tabindex: 'tabIndex', crossorigin: 'crossOrigin', viewbox: 'viewBox' };
const camel = (s) => s.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
const REVEAL = ['feature-row', 'case-card', 'process-card', 'pricing-panel', 'principle-grid', 'compare-board', 'section-head',
  'signal-strip', 'signal-node', 'pillar', 'editorial-photo', 'feature-art', 'compare-card', 'marquee-band', 'faq-layout', 'final-inner'];
const DELAYED = ['signal-strip', 'signal-node', 'pillar', 'editorial-photo', 'feature-art', 'compare-card', 'marquee-band', 'faq-layout', 'final-inner'];
const TILT = ['case-card', 'process-card', 'signal-node', 'pricing-panel'];
const EXTRA = { hero: '{...heroProps}', 'dablo-orbit-scene': 'ref={sceneRef}', dashboard: 'ref={dashRef}' };

let delayIndex = 0;
let usesOpen = false;

function styleObj(css) {
  const o = {};
  css.split(';').map((s) => s.trim()).filter(Boolean).forEach((d) => {
    const i = d.indexOf(':');
    const k = d.slice(0, i).trim();
    o[k.startsWith('--') ? k : camel(k)] = d.slice(i + 1).trim();
  });
  return `style={${JSON.stringify(o)}}`;
}

function attrs(node, extra = []) {
  const out = [];
  for (const [k, v] of Object.entries(node.attributes)) {
    if (k === 'data-open') { out.push('onClick={openApp}'); usesOpen = true; continue; }
    if (k === 'style') { out.push(styleObj(v)); continue; }
    const name = ATTR[k.toLowerCase()] || (k.startsWith('aria-') || k.startsWith('data-') ? k : camel(k));
    out.push(`${name}=${JSON.stringify(v)}`);
  }
  return [...out, ...extra].join(' ');
}

function ser(node) {
  if (node.nodeType === 3) {
    const t = node.rawText;
    if (!t.trim()) return t.includes('\n') ? '' : ' ';
    return t.replace(/[{}]/g, (c) => `{'${c}'}`);
  }
  if (node.nodeType !== 1) return '';
  const tag = node.rawTagName;
  const cls = (node.getAttribute('class') || '').split(/\s+/);
  const has = (c) => cls.includes(c);

  if (has('platform-token')) {
    return `<TrackballToken ${attrs(node)}>${node.childNodes.map(ser).join('')}</TrackballToken>`;
  }
  if (has('dablo-mascot')) {
    return `<Mascot ${attrs(node)}>${node.childNodes.map(ser).join('')}</Mascot>`;
  }
  if (has('word-tile')) {
    const words = node.querySelectorAll('span').map((s) => s.text);
    return `<WordTile ${attrs(node)} words={${JSON.stringify(words)}} />`;
  }
  if (node.getAttribute('id') === 'storyLines') {
    const lines = node.querySelectorAll('.sl').map((s) => s.text);
    return `<StoryLines lines={${JSON.stringify(lines)}} />`;
  }

  let name = tag;
  const extra = [];
  const revealCls = REVEAL.find((c) => has(c));
  if (revealCls && !has('hero')) {
    name = 'Reveal';
    extra.push(`as="${tag}"`);
    if (TILT.some(has)) extra.push('tilt');
    if (DELAYED.some(has)) extra.push(`delay={${Math.min((delayIndex++ % 4) * 70, 210)}}`);
  }
  for (const c of cls) if (EXTRA[c]) extra.push(EXTRA[c]);

  const a = attrs(node, extra);
  if (VOID.has(tag)) return `<${name} ${a} />`;
  const kids = node.childNodes.map(ser).join('');
  return `<${name}${a ? ' ' + a : ''}>${kids}</${name}>`;
}

const sections = [
  ['Hero', 'header.hero'],
  ['SignalStrip', 'section.signal-strip'],
  ['Story', 'section.story-section'],
  ['Pillars', 'section.pillars'],
  ['Product', 'section.product-section'],
  ['Why', 'section.why-section'],
  ['UseCases', 'section.usecases'],
  ['MarqueeBand', 'div.marquee-band'],
  ['Testimonials', 'section.testimonials-section'],
  ['Principle', 'section.principle-section'],
  ['Process', 'section.process-section'],
  ['Pricing', 'section.pricing-section'],
  ['Faq', 'section.faq-section'],
  ['FinalCta', 'section.final-cta'],
  ['Footer', 'footer'],
];

for (const [name, sel] of sections) {
  usesOpen = false;
  const el = body.querySelector(sel);
  const jsx = ser(el);
  const isHero = name === 'Hero';
  const imports = [
    jsx.includes('<Reveal') && `import Reveal from '../../components/Reveal'`,
    jsx.includes('<Mascot') && `import Mascot from '../../components/Mascot'`,
    jsx.includes('<TrackballToken') && `import TrackballToken from '../../components/TrackballToken'`,
    jsx.includes('<WordTile') && `import WordTile from '../../components/WordTile'`,
    jsx.includes('<StoryLines') && `import StoryLines from '../../components/StoryLines'`,
    usesOpen && `import { useOpenApp } from '../useOpenApp'`,
    isHero && `import useHeroParallax from '../../hooks/useHeroParallax'`,
  ].filter(Boolean).join('\n');
  const pre = [
    usesOpen && 'const openApp = useOpenApp()',
    isHero && 'const { heroProps, sceneRef, dashRef } = useHeroParallax()',
  ].filter(Boolean).join('\n  ');
  const code = `${imports}\n\nexport default function ${name}() {\n  ${pre}\n  return (\n${jsx}\n  )\n}\n`;
  fs.writeFileSync(`src/landing/sections/${name}.jsx`, code);
  console.log(name, code.length);
}
