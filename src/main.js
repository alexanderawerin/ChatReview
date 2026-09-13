import '@fontsource-variable/inter';
import '@fontsource/caveat/700.css';
import './styles.css';
import mascotUrl from '../assets/roast-cat.png';
import arrow from '@phosphor-icons/core/assets/regular/arrow-right.svg?raw';
import left from '@phosphor-icons/core/assets/regular/arrow-left.svg?raw';
import upload from '@phosphor-icons/core/assets/regular/upload-simple.svg?raw';
import download from '@phosphor-icons/core/assets/regular/download-simple.svg?raw';
import plus from '@phosphor-icons/core/assets/regular/plus.svg?raw';
import close from '@phosphor-icons/core/assets/regular/x.svg?raw';
import { analyzeChat } from './analyzer.js';
import { readExport, loadPhotoUrls, releasePhotoUrls, droppedFiles } from './importer.js';
import { buildSlides, renderSlide } from './slides.js';
import external from '@phosphor-icons/core/assets/regular/browsers.svg?raw';
import help from '@phosphor-icons/core/assets/regular/question.svg?raw';

const $ = (selector) => document.querySelector(selector);
const icons = {
  arrow,
  left,
  right: arrow,
  upload,
  download,
  plus,
  close,
  external,
  help,
};
for (const element of document.querySelectorAll('[data-icon]')) {
  element.innerHTML = icons[element.dataset.icon];
  element.setAttribute('aria-hidden', 'true');
}
const state = {
  tone: 'summary',
  photos: false,
  stats: null,
  files: [],
  jsonFile: null,
  urls: new Map(),
  slides: [],
  index: 0,
  previewIndex: 0,
  demo: false,
  busy: false,
  downloadUrl: null,
};

function message(id, text = '') {
  $(id).textContent = text;
  $(id).hidden = !text;
}
function setBusy(value) {
  state.busy = value;
  for (const element of document.querySelectorAll(
    'button:not(.close-dialog):not(.close-instructions), input, select',
  ))
    element.disabled = value;
}
function options() {
  return {
    tone: state.tone,
    photos: state.photos,
    photoUrls: state.urls,
    demoPhotoUrl: state.demo ? mascotUrl : '',
  };
}
function syncControls() {
  $(`input[name="tone"][value="${state.tone}"]`).checked = true;
  $('#result-tone').value = state.tone;
  $('#photos-toggle').checked = $('#result-photos').checked = state.photos;
  $('#file-choice-label').textContent = state.photos ? 'Выбрать папку с фото' : 'Выбрать файл';
}
const heroScenes = [
  { name: 'calm', label: 'Спокойно', emojis: ['🥱', '🙂'] },
  { name: 'friendly', label: 'Дружески', emojis: ['😶', '🤩'] },
  { name: 'sharp', label: 'Пожёстче', emojis: ['🙄', '😈'] },
];
function renderPreview() {
  state.previewIndex = (state.previewIndex + heroScenes.length) % heroScenes.length;
  const scene = heroScenes[state.previewIndex];
  $('.hero').dataset.scene = scene.name;
  document.querySelectorAll('.headline-emoji').forEach((element, index) => {
    element.textContent = scene.emojis[index];
  });
  $('#preview-count').textContent =
    `${state.previewIndex + 1} / ${heroScenes.length} · ${scene.label}`;
  $('#open-preview').href = `?preview=${state.previewIndex + 1}`;
}
function renderCurrent() {
  $('#slide-view').innerHTML = renderSlide(state.slides[state.index], {
    mascotUrl,
    chatName: state.stats.chatName,
    number: state.index + 1,
    total: state.slides.length,
  });
  $('#slide-count').value = `${state.index + 1} / ${state.slides.length}`;
}
function rebuild() {
  if (!state.stats) return;
  const previousId = state.slides[state.index]?.id;
  state.slides = buildSlides(state.stats, options());
  const retained = state.slides.findIndex((slide) => slide.id === previousId);
  state.index = retained >= 0 ? retained : Math.min(state.index, state.slides.length - 1);
  renderCurrent();
  const hasPhotos = state.slides.some((slide) => slide.kind === 'photo');
  message(
    '#photo-notice',
    state.photos && !hasPhotos
      ? 'Нет доступных фото с реакциями. Добавьте папку этого экспорта с фотографиями; остальные слайды уже готовы.'
      : '',
  );
  $('#add-photos').hidden = state.demo || !state.photos;
}
function changePhotos(value) {
  state.photos = value;
  if (!state.demo) {
    releasePhotoUrls(state.urls);
    if (value && state.jsonFile)
      state.urls = loadPhotoUrls(state.files, state.jsonFile, state.stats);
  }
  syncControls();
  rebuild();
}
function clearDownload() {
  if (state.downloadUrl) URL.revokeObjectURL(state.downloadUrl);
  state.downloadUrl = null;
  $('#download-result').hidden = true;
  $('#download-result').removeAttribute('href');
}
function showResults() {
  $('#settings-dialog').close();
  clearDownload();
  $('#landing').hidden = true;
  $('#results').hidden = false;
  $('#chat-title').textContent = state.stats.chatName;
  syncControls();
  rebuild();
  $('#slide-view').focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: 'instant' });
}
async function importFiles(files) {
  if (state.busy || !files.length) return;
  setBusy(true);
  message('#error');
  message('#status', 'Читаем экспорт и считаем истории…');
  try {
    // Yield a frame so loading feedback appears before the synchronous analysis.
    await new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, 0)));
    const { data, file } = await readExport(files);
    const stats = analyzeChat(data);
    const urls = state.photos ? loadPhotoUrls(files, file, stats) : new Map();
    releasePhotoUrls(state.urls);
    Object.assign(state, {
      stats,
      files: [...files],
      jsonFile: file,
      urls,
      index: 0,
      slides: [],
      demo: false,
    });
    showResults();
  } catch (error) {
    message('#error', error.message || 'Не удалось обработать экспорт. Попробуйте другой файл.');
  } finally {
    message('#status');
    setBusy(false);
    $('#file-input').value = '';
    $('#folder-input').value = '';
  }
}
$('#back-button').addEventListener('click', () => {
  releasePhotoUrls(state.urls);
  Object.assign(state, { stats: null, files: [], jsonFile: null, slides: [], demo: false });
  clearDownload();
  $('#results').hidden = true;
  $('#landing').hidden = false;
  message('#error');
  message('#status');
  renderPreview();
  $('#upload-button').focus();
});
for (const radio of document.querySelectorAll('input[name="tone"]'))
  radio.addEventListener('change', () => {
    state.tone = radio.value;
    syncControls();
    renderPreview();
  });
$('#result-tone').addEventListener('change', (event) => {
  state.tone = event.target.value;
  syncControls();
  rebuild();
  renderPreview();
});
$('#photos-toggle').addEventListener('change', (event) => changePhotos(event.target.checked));
$('#result-photos').addEventListener('change', (event) => changePhotos(event.target.checked));
$('#upload-button').addEventListener('click', () => $('#settings-dialog').showModal());
$('#folder-button').addEventListener('click', () =>
  $(state.photos ? '#folder-input' : '#file-input').click(),
);
$('#add-photos').addEventListener('click', () => $('#folder-input').click());
for (const id of ['#file-input', '#folder-input'])
  $(id).addEventListener('change', (event) => importFiles(event.target.files));
for (const [id, direction] of [
  ['#preview-prev', -1],
  ['#preview-next', 1],
])
  $(id).addEventListener('click', () => {
    state.previewIndex += direction;
    renderPreview();
  });
function move(direction) {
  if (state.busy) return;
  state.index = (state.index + direction + state.slides.length) % state.slides.length;
  renderCurrent();
}
$('#prev-slide').addEventListener('click', () => move(-1));
$('#next-slide').addEventListener('click', () => move(1));
$('#slide-view').addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault();
    move(event.key === 'ArrowLeft' ? -1 : 1);
  }
});
let touchStart = null;
$('#slide-view').addEventListener(
  'touchstart',
  (event) => {
    touchStart = event.changedTouches[0].clientX;
  },
  { passive: true },
);
$('#slide-view').addEventListener(
  'touchend',
  (event) => {
    const distance = event.changedTouches[0].clientX - touchStart;
    if (touchStart !== null && Math.abs(distance) > 60) move(distance > 0 ? -1 : 1);
    touchStart = null;
  },
  { passive: true },
);
for (const button of document.querySelectorAll('.close-settings'))
  button.addEventListener('click', () => $('#settings-dialog').close());
for (const button of document.querySelectorAll('.close-dialog, .close-instructions'))
  button.addEventListener('click', () => $('#instructions').close());
document.addEventListener('dragover', (event) => {
  if ([...event.dataTransfer.types].includes('Files')) {
    event.preventDefault();
    document.body.classList.add('dragging');
  }
});
document.addEventListener('dragleave', (event) => {
  if (!event.relatedTarget) document.body.classList.remove('dragging');
});
document.addEventListener('drop', async (event) => {
  event.preventDefault();
  document.body.classList.remove('dragging');
  if (state.busy) return;
  try {
    await importFiles(await droppedFiles(event.dataTransfer));
  } catch (error) {
    message('#error', error.message || 'Не удалось прочитать папку. Используйте кнопку загрузки.');
  }
});
async function save(all) {
  if (state.busy || !state.stats) return;
  setBusy(true);
  message('#error');
  message('#status', 'Готовим изображения…');
  try {
    const { exportSlides } = await import('./export.js');
    const result = await exportSlides(all ? state.slides : [state.slides[state.index]], {
      mascotUrl,
      chatName: state.stats.chatName,
      startIndex: all ? 0 : state.index,
      total: state.slides.length,
      zip: all,
      onProgress: (done, total) => message('#status', `Сохраняем слайды: ${done} из ${total}…`),
    });
    clearDownload();
    state.downloadUrl = URL.createObjectURL(result.blob);
    const link = $('#download-result');
    link.href = state.downloadUrl;
    link.download = result.filename;
    link.textContent = all ? 'Скачать готовый ZIP' : 'Скачать готовый PNG';
    link.hidden = false;
    link.click();
    message('#status', 'Файл готов. Если скачивание не началось, воспользуйтесь ссылкой ниже.');
  } catch (error) {
    message('#status');
    message('#error', `Не удалось сохранить: ${error.message}`);
  } finally {
    setBusy(false);
  }
}
$('#save-png').addEventListener('click', () => save(false));
$('#save-zip').addEventListener('click', () => save(true));
// The browser releases object URLs on document disposal; retain them for back-forward cache.
renderPreview();

if (new URLSearchParams(location.search).has('preview')) {
  const selected = Number(new URLSearchParams(location.search).get('preview'));
  const scene = heroScenes[selected - 1] || heroScenes[0];
  document.querySelector('.page-shell').innerHTML =
    `<main class="hero scene-preview" data-scene="${scene.name}"><h1>${scene.emojis[1]}</h1><p class="intro">${scene.label}</p><a href="./">На главную</a></main>`;
}
