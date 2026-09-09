const imageExtension = /\.(png|jpe?g|webp|gif)$/i;
const MAX_JSON_BYTES = 150 * 1024 * 1024;
const MAX_IMAGE_BYTES = 30 * 1024 * 1024;

export function normalizePath(path) {
  if (typeof path !== 'string') return null;
  const normalized = path.replace(/\\/g, '/').replace(/^\.\//, '');
  if (!normalized || normalized.startsWith('/') || /^[a-z]+:/i.test(normalized)) return null;
  if (normalized.split('/').some((part) => part === '..' || part === '.')) return null;
  return normalized;
}

export function selectJsonFile(files) {
  const candidates = [...files].filter((file) => /\.json$/i.test(file.name));
  const resultFiles = candidates.filter((file) => file.name.toLowerCase() === 'result.json');
  if (resultFiles.length === 1) return resultFiles[0];
  if (resultFiles.length > 1 || candidates.length > 1) {
    throw new Error('Здесь несколько экспортов. Выберите папку одного чата.');
  }
  if (!candidates.length) throw new Error('Не найден JSON-файл. Экспортируйте чат в формате JSON.');
  return candidates[0];
}

export async function readExport(files) {
  const file = selectJsonFile(files);
  if (file.size > MAX_JSON_BYTES)
    throw new Error('JSON больше 150 МБ. Экспортируйте более короткий период.');
  let data;
  try {
    data = JSON.parse((await file.text()).replace(/^\uFEFF/, ''));
  } catch {
    throw new Error('Не удалось прочитать JSON. Нужен исходный экспорт Telegram, а не HTML.');
  }
  return { data, file };
}

/** Only selected, local photos are decoded; paths from the JSON never become network URLs. */
export function loadPhotoUrls(files, jsonFile, stats) {
  const jsonPath = jsonFile.webkitRelativePath || jsonFile.name;
  const root = jsonPath.includes('/') ? jsonPath.slice(0, jsonPath.lastIndexOf('/') + 1) : '';
  const available = new Map();
  for (const file of files) {
    if (!imageExtension.test(file.name) || file.size > MAX_IMAGE_BYTES || file.size === 0) continue;
    const path = normalizePath(file.webkitRelativePath || file.name);
    if (!path) continue;
    const relative = root && path.startsWith(root) ? path.slice(root.length) : path;
    // Ambiguous file paths cannot safely be matched to a photo from the export.
    if (available.has(relative)) available.set(relative, null);
    else available.set(relative, file);
  }
  const photos = [...stats.topPhotos, stats.funniestPhoto, stats.saddestPhoto].filter(Boolean);
  const urls = new Map();
  try {
    for (const photo of photos) {
      const path = normalizePath(photo.path);
      if (!path || urls.has(path)) continue;
      const file = available.get(path);
      if (file) urls.set(path, URL.createObjectURL(file));
    }
  } catch (error) {
    releasePhotoUrls(urls);
    throw error;
  }
  return urls;
}

export function releasePhotoUrls(urls) {
  for (const url of new Set(urls.values())) URL.revokeObjectURL(url);
  urls.clear();
}

async function readEntry(entry, parent = '') {
  if (entry.isFile) {
    const file = await new Promise((resolve, reject) => entry.file(resolve, reject));
    Object.defineProperty(file, 'webkitRelativePath', {
      value: parent + file.name,
      configurable: true,
    });
    return [file];
  }
  if (!entry.isDirectory) return [];
  const reader = entry.createReader();
  const files = [];
  for (;;) {
    const entries = await new Promise((resolve, reject) => reader.readEntries(resolve, reject));
    if (!entries.length) break;
    for (const child of entries) files.push(...(await readEntry(child, parent + entry.name + '/')));
  }
  return files;
}

export async function droppedFiles(dataTransfer) {
  const entries = [...(dataTransfer.items || [])]
    .filter((item) => item.kind === 'file')
    .map((item) => item.webkitGetAsEntry?.());
  // Read entries synchronously while the browser still exposes the drop's DataTransfer.
  const fallback = [...dataTransfer.files];
  if (entries.some((entry) => entry?.isDirectory)) {
    const files = [];
    for (const entry of entries) if (entry) files.push(...(await readEntry(entry)));
    return files;
  }
  return fallback;
}
