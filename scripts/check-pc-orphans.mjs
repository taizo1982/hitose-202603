import puppeteer from 'puppeteer';

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();

// Check at both PC and SP widths
const viewports = [
  { name: 'PC', width: 1200, height: 900 },
  { name: 'SP', width: 375, height: 812 },
];

const selectors = [
  '.value-description',
  '.value-title',
  '.section-title',
  '.sauna-lead',
  '.sauna-description',
  '.private-design-lead',
  '.private-design-description',
  '.bbq-nabe-description',
  '.bbq-nabe-closing',
  '.kitchen-lead',
  '.kitchen-closing',
  '.features-lead',
  '.amenities-lead',
  '.nearby-lead',
  '.nearby-closing',
  '.pricing-tagline',
  '.pricing-note',
  '.hero-description',
  '.benefits-note',
  '.testimonials-lead',
];

for (const vp of viewports) {
  console.log(`\n========== ${vp.name} (${vp.width}px) ==========\n`);
  await page.setViewport({ width: vp.width, height: vp.height });
  await page.goto('http://localhost:3456', { waitUntil: 'networkidle0' });

  for (const sel of selectors) {
    const els = await page.$$(sel);
    for (let i = 0; i < els.length; i++) {
      const result = await els[i].evaluate((e) => {
        // Use Range API to get actual rendered line rects
        const text = e.textContent || '';
        const textNode = findTextNodes(e);
        const lines = getRenderedLines(e);
        return { lines, containerWidth: Math.round(e.clientWidth) };

        function findTextNodes(node) {
          const nodes = [];
          const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
          while (walker.nextNode()) nodes.push(walker.currentNode);
          return nodes;
        }

        function getRenderedLines(element) {
          const textNodes = findTextNodes(element);
          if (textNodes.length === 0) return [];

          const range = document.createRange();
          const lines = [];
          let currentLineTop = null;
          let currentLineText = '';

          for (const textNode of textNodes) {
            for (let i = 0; i < textNode.length; i++) {
              range.setStart(textNode, i);
              range.setEnd(textNode, i + 1);
              const rect = range.getBoundingClientRect();
              const charTop = Math.round(rect.top);
              const char = textNode.textContent[i];

              if (char.trim() === '' && currentLineText === '') continue;

              if (currentLineTop === null) {
                currentLineTop = charTop;
                currentLineText = char;
              } else if (Math.abs(charTop - currentLineTop) > 2) {
                if (currentLineText.trim()) lines.push(currentLineText.trim());
                currentLineTop = charTop;
                currentLineText = char;
              } else {
                currentLineText += char;
              }
            }
          }
          if (currentLineText.trim()) lines.push(currentLineText.trim());
          return lines;
        }
      });

      if (result.lines.length > 1) {
        const lastLine = result.lines[result.lines.length - 1];
        if (lastLine.length <= 3) {
          console.log(`ORPHAN [${sel}${els.length > 1 ? `[${i}]` : ''}] (width: ${result.containerWidth}px)`);
          result.lines.forEach((l, j) => console.log(`  L${j + 1}: "${l}" (${l.length}文字)`));
          console.log();
        }
      }
    }
  }
}

await browser.close();
