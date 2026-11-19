// shots.js — screenshot mode. The maker drives the app with URL params so
// the four screenshots are the app's own drawing, never an edit or a
// composite: ?shot=cover&photo=pier&caption=VICE%20COAST draws the wide
// cover alone; ?shot=editor shows the full editor with a photo loaded;
// ?shot=square and ?shot=portrait draw the other two post sizes.

export function readShotParams() {
  const q = new URLSearchParams(window.location.search);
  return {
    shot: q.get('shot') || '',
    photo: q.get('photo') || '',
    caption: q.get('caption') || '',
    subcaption: q.get('subcaption') || '',
    layout: q.get('layout') || '',
    grade: q.get('grade') || '',
    size: q.get('size') || '',
  };
}

export function shotIsCover(shot) {
  return shot === 'cover' || shot === 'square' || shot === 'portrait';
}

// The four shots this entry ships, in the order shots.json lists them.
// Anything else falls back to the plain editor with no shot applied.
export function knownShot(shot) {
  return shot === 'cover' || shot === 'editor' || shot === 'square' || shot === 'portrait';
}

// The cover size a cover shot renders at. The screenshot window is opened
// at the same aspect, so the cover fills the frame exactly.
export function shotCoverSize(shot) {
  if (shot === 'square') return { w: 1080, h: 1080 };
  if (shot === 'portrait') return { w: 1080, h: 1350 };
  return { w: 1920, h: 1080 };
}
