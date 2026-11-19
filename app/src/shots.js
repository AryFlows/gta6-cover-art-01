// shots.js — fixed scenes for screenshots: ?shot=editor shows the app with
// photos loaded; ?shot=cover shows a cover alone, full viewport. The query
// picks the layout, grade, photo and caption, so each screenshot is one URL.
// window.__shotReady is set once the scene has painted, so a headless browser
// can wait for it before capturing.

function parseSize(text, fallback) {
  const match = /^(\d+)x(\d+)$/.exec(text ?? '');
  if (!match) return fallback;
  return { w: Number(match[1]), h: Number(match[2]) };
}

function shotReady() {
  requestAnimationFrame(() => requestAnimationFrame(() => {
    window.__shotReady = true;
  }));
}

export async function runShot(shot, query, api) {
  if (shot === 'cover') {
    document.body.classList.add('shot-cover');
    const size = parseSize(query.get('size'), { w: 1920, h: 1080 });
    api.applyPatch({
      layout: query.get('layout') ?? 'nine',
      grade: query.get('grade') ?? 'vice',
      title: query.get('title') ?? 'NEON COAST',
      subtitle: query.get('subtitle') ?? 'Sunset Heist',
      heat: Number(query.get('heat') ?? 4),
      badge: true,
      grain: true,
      vignette: true,
    });
    const photo = query.get('photo') ?? 'pier';
    await api.loadSample(photo);
    await api.loadSample(photo === 'pier' ? 'boulevard' : 'pier');
    api.state.slots = api.state.slots.map((slot, i) => ({ ...slot, photo: i % 2 }));
    api.renderCoverAt(size.w, size.h);
    shotReady();
    return;
  }
  // The editor scene: both sample photos in, nine-panel grid, Vice Sunset.
  await api.loadSample('pier');
  await api.loadSample('boulevard');
  api.applyPatch({
    layout: 'nine',
    grade: 'vice',
    title: 'NEON COAST',
    subtitle: 'Sunset Heist',
    heat: 4,
    badge: true,
    grain: true,
    vignette: true,
    fillOne: false,
    previewSize: 'wide',
  });
  api.state.slots = api.state.slots.map((slot, i) => ({ ...slot, photo: i % 2 }));
  api.redraw();
  shotReady();
}

// The four scenes the screenshots use, as data: the screenshot script reads
// this list instead of hard-coding URLs, so the shots and the app stay in
// agreement about what each one shows.
export function shotScenes() {
  return [
    { name: '1-cover.jpg', query: '?shot=cover&size=1920x1080&layout=nine&grade=vice&photo=pier&title=NEON%20COAST&subtitle=Sunset%20Heist', w: 1280, h: 720 },
    { name: '2-editor.jpg', query: '?shot=editor', w: 1280, h: 720 },
    { name: '3-cover-square.jpg', query: '?shot=cover&size=1080x1080&layout=hero&grade=neon&photo=boulevard&title=NEON%20COAST&subtitle=Boulevard%20Queen', w: 1080, h: 1080 },
    { name: '4-cover-portrait.jpg', query: '?shot=cover&size=1080x1350&layout=tilted&grade=gold&photo=pier&title=NEON%20COAST&subtitle=Golden%20Hour', w: 1024, h: 1280 },
  ];
}
