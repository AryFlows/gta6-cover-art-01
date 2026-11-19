// Fixed scenes for screenshots: ?shot=editor shows the page with a sample
// photo loaded; ?shot=cover shows the cover alone (the editor chrome is
// hidden). `photo` picks the sample, `caption` the title words; `layout`,
// `grade` and `size` are honoured by the page itself. window.__shotReady
// is set once the cover is painted and the fonts are in.

export async function runShot(shot, query, load) {
  if (shot === 'cover') document.body.classList.add('shot-cover');
  const photo = query.get('photo') ?? 'pier';
  const caption = query.get('caption') ?? 'Neon Nights';
  await load(`samples/${photo}.jpg`, caption);
  try {
    await document.fonts.ready;
  } catch {
    // A font that never arrives must not block the screenshot.
  }
  // Let the font-load redraw and the grade bake settle before signalling.
  await new Promise((resolve) => setTimeout(resolve, 400));
  requestAnimationFrame(() => requestAnimationFrame(() => {
    window.__shotReady = true;
  }));
}
