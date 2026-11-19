// main.js — Vice Coast Cover Studio boot and editor wiring. Loads the two
// sample photos, builds the layout / grade / size pickers, and re-renders
// the preview canvas on every change. Photos are read on this machine and
// never uploaded; the preview and the export are the same renderCover
// call, so the PNG you share is the poster you see.

import { LAYOUTS, layoutById, layoutPanels, panelAt } from './panel-layouts.js';
import { GRADES, gradeById } from './sunset-grade.js';
import { defaultCrop } from './photo-crop.js';
import { renderCover, exportPNG, EXPORT_SIZES, sizeById } from './cover-export.js';
import { readShotParams, shotIsCover, shotCoverSize } from './shots.js';

const SAMPLES = [
  { id: 'pier', name: 'Pier', src: 'samples/pier.jpg' },
  { id: 'boulevard', name: 'Boulevard', src: 'samples/boulevard.jpg' },
];

const state = {
  layout: 'collage',
  grade: 'vice-sunset',
  caption: 'VICE COAST',
  subcaption: 'a vice city story',
  size: '1920x1080',
  photos: [],
  crops: [],
  selectedPanel: 0,
};

const stage = document.getElementById('stage');
const panelLabel = document.getElementById('panelLabel');
const captionInput = document.getElementById('captionInput');
const subInput = document.getElementById('subInput');
const zoomRange = document.getElementById('zoomRange');
const exportBtn = document.getElementById('exportBtn');
let userPhotoCount = 0;
let shot = null;

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`could not load ${src}`));
    img.src = src;
  });
}

function photoName(id) {
  const photo = state.photos.find((item) => item.id === id);
  return photo ? photo.name : 'none';
}

function rebuildCrops() {
  const count = layoutPanels(state.layout, 100, 100).length;
  const next = [];
  for (let i = 0; i < count; i += 1) {
    const kept = state.crops[i];
    const fallback = state.photos[i % Math.max(1, state.photos.length)];
    next.push({
      photoId: kept?.photoId ?? fallback?.id ?? null,
      crop: kept?.crop ?? defaultCrop(),
    });
  }
  state.crops = next;
  state.selectedPanel = Math.min(state.selectedPanel, count - 1);
}

function render() {
  const size = shot && shotIsCover(shot.shot)
    ? shotCoverSize(shot.shot)
    : sizeById(state.size);
  const cover = renderCover(state, size.w, size.h);
  stage.width = size.w;
  stage.height = size.h;
  const ctx = stage.getContext('2d');
  ctx.drawImage(cover, 0, 0);
  const count = state.crops.length;
  const slot = state.crops[state.selectedPanel];
  panelLabel.textContent = count > 1
    ? `Panel ${state.selectedPanel + 1} of ${count} — ${layoutById(state.layout).name} · photo: ${photoName(slot?.photoId)} — click a panel to select it, drag to move its photo.`
    : `Single panel — ${layoutById(state.layout).name} · photo: ${photoName(slot?.photoId)} — drag to move the photo.`;
  const selectedCrop = slot?.crop;
  if (selectedCrop) zoomRange.value = String(Math.round(selectedCrop.scale * 100));
  exportBtn.textContent = `Export PNG · ${sizeById(state.size).label}`;
}

function buildChoices(container, items, current, onPick) {
  container.replaceChildren();
  for (const item of items) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'choice' + (item.id === current ? ' on' : '');
    btn.textContent = item.name ?? item.label;
    btn.title = item.hint ?? item.label ?? item.name;
    btn.addEventListener('click', () => {
      onPick(item.id);
      for (const child of container.children) child.classList.remove('on');
      btn.classList.add('on');
    });
    container.appendChild(btn);
  }
}

function buildThumbs() {
  const box = document.getElementById('thumbs');
  box.replaceChildren();
  for (const photo of state.photos) {
    const thumb = document.createElement('button');
    thumb.type = 'button';
    thumb.className = 'thumb';
    thumb.title = photo.name;
    const img = document.createElement('img');
    img.src = photo.img.src;
    img.alt = photo.name;
    thumb.appendChild(img);
    const tag = document.createElement('span');
    tag.textContent = photo.name;
    thumb.appendChild(tag);
    thumb.addEventListener('click', () => {
      state.crops[state.selectedPanel].photoId = photo.id;
      render();
    });
    box.appendChild(thumb);
  }
}

function assignPhotoToSelected(id) {
  if (!state.crops[state.selectedPanel]) return;
  state.crops[state.selectedPanel].photoId = id;
  render();
}

async function addUserPhotos(files) {
  for (const file of files) {
    if (!file.type.startsWith('image/')) continue;
    userPhotoCount += 1;
    const dataUrl = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });
    try {
      const img = await loadImage(dataUrl);
      state.photos.push({ id: `user-${userPhotoCount}`, name: file.name.replace(/\.[^.]+$/, ''), img });
    } catch {
      // A file that is not a readable image is skipped, not fatal.
    }
  }
  buildThumbs();
  render();
}

function wireEvents() {
  buildChoices(
    document.getElementById('layoutRow'),
    LAYOUTS.map((entry) => ({ id: entry.id, name: entry.name, hint: entry.hint })),
    state.layout,
    (id) => { state.layout = id; rebuildCrops(); render(); },
  );
  buildChoices(
    document.getElementById('gradeRow'),
    GRADES.map((entry) => ({ id: entry.id, name: entry.name })),
    state.grade,
    (id) => { state.grade = id; render(); },
  );
  buildChoices(
    document.getElementById('sizeRow'),
    EXPORT_SIZES.map((entry) => ({ id: entry.id, label: entry.label })),
    state.size,
    (id) => { state.size = id; render(); },
  );

  captionInput.addEventListener('input', () => { state.caption = captionInput.value; render(); });
  subInput.addEventListener('input', () => { state.subcaption = subInput.value; render(); });
  zoomRange.addEventListener('input', () => {
    const slot = state.crops[state.selectedPanel];
    if (slot) {
      slot.crop.scale = Number(zoomRange.value) / 100;
      render();
    }
  });
  document.getElementById('fitBtn').addEventListener('click', () => {
    const slot = state.crops[state.selectedPanel];
    if (slot) { slot.crop = defaultCrop(); render(); }
  });
  document.getElementById('fillBtn').addEventListener('click', () => {
    const id = state.crops[state.selectedPanel]?.photoId;
    if (!id) return;
    for (const slot of state.crops) slot.photoId = id;
    render();
  });
  document.getElementById('photoInput').addEventListener('change', (event) => {
    addUserPhotos(event.target.files);
    event.target.value = '';
  });
  document.getElementById('samplePier').addEventListener('click', () => assignPhotoToSelected('pier'));
  document.getElementById('sampleBoulevard').addEventListener('click', () => assignPhotoToSelected('boulevard'));
  exportBtn.addEventListener('click', async () => {
    exportBtn.disabled = true;
    exportBtn.textContent = 'Drawing your cover…';
    await exportPNG(state, state.size);
    exportBtn.disabled = false;
    render();
  });

  // Click a panel to select it; drag to pan its photo.
  let drag = null;
  stage.addEventListener('pointerdown', (event) => {
    const rect = stage.getBoundingClientRect();
    const sx = stage.width / rect.width;
    const sy = stage.height / rect.height;
    const px = (event.clientX - rect.left) * sx;
    const py = (event.clientY - rect.top) * sy;
    const hit = panelAt(state.layout, stage.width, stage.height, px, py);
    if (hit >= 0) {
      state.selectedPanel = hit;
      drag = { x: px, y: py, ox: state.crops[hit].crop.ox, oy: state.crops[hit].crop.oy };
      stage.setPointerCapture(event.pointerId);
      render();
    }
  });
  stage.addEventListener('pointermove', (event) => {
    if (!drag) return;
    const rect = stage.getBoundingClientRect();
    const sx = stage.width / rect.width;
    const sy = stage.height / rect.height;
    const slot = state.crops[state.selectedPanel];
    slot.crop.ox = drag.ox + (event.clientX - rect.left) * sx - drag.x;
    slot.crop.oy = drag.oy + (event.clientY - rect.top) * sy - drag.y;
    render();
  });
  stage.addEventListener('pointerup', () => { drag = null; });
  stage.addEventListener('pointercancel', () => { drag = null; });
}

function applyShotParams(params) {
  shot = params;
  if (params.layout && layoutById(params.layout)) state.layout = params.layout;
  if (params.grade && gradeById(params.grade)) state.grade = params.grade;
  if (params.caption) { state.caption = params.caption; captionInput.value = params.caption; }
  if (params.subcaption) { state.subcaption = params.subcaption; subInput.value = params.subcaption; }
  if (params.size && sizeById(params.size)) state.size = params.size;
  if (shotIsCover(params.shot)) document.body.classList.add('shot-cover');
  // A cover shot shows one photo big; an editor shot shows the editor.
  if (params.photo) {
    const wanted = state.photos.find((item) => item.id === params.photo);
    if (wanted) {
      state.photos = [wanted, ...state.photos.filter((item) => item.id !== params.photo)];
    }
  }
}

async function boot() {
  const params = readShotParams();
  // Samples first, so the editor is never empty.
  for (const sample of SAMPLES) {
    try {
      const img = await loadImage(sample.src);
      state.photos.push({ id: sample.id, name: sample.name, img });
    } catch {
      // A missing sample leaves an empty panel, never a crash.
    }
  }
  rebuildCrops();
  // Shot params go in BEFORE the choice buttons are built, so the
  // highlighted layout, grade and size always match what the shot shows.
  applyShotParams(params);
  wireEvents();
  buildThumbs();
  rebuildCrops();
  render();
  try {
    await Promise.all([
      document.fonts.load('100px BebasNeue'),
      document.fonts.load('100px Anton'),
      document.fonts.load('40px Pacifico'),
    ]);
  } catch {
    // System fallbacks already render; the canvas redraws when fonts land.
  }
  document.fonts.ready.then(render);
  render();
}

boot();
