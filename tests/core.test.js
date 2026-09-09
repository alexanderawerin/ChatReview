import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeChat, extractText } from '../src/analyzer.js';
import {
  normalizePath,
  readExport,
  selectJsonFile,
  loadPhotoUrls,
  releasePhotoUrls,
} from '../src/importer.js';
import { buildSlides, renderSlide } from '../src/slides.js';
import { demoChat } from '../src/demo.js';
const msg = (id, from, extra = {}) => ({
  id,
  type: 'message',
  from,
  date: `2026-01-01T12:${String(id).padStart(2, '0')}:00`,
  text: 'прекрасный разговор',
  ...extra,
});

test('analyzes actual Telegram messages, mixed text, replies and reactions', () => {
  const data = {
    name: 'Чат',
    messages: [
      null,
      { type: 'service' },
      msg(1, 'Аня', { text: ['Спасибо ', { type: 'bold', text: 'друг' }] }),
      msg(2, 'Борис', {
        reply_to_message_id: 1,
        reactions: [{ emoji: '❤', count: 3, recent: [{ from: 'Аня' }] }],
      }),
    ],
  };
  const original = JSON.stringify(data);
  const stats = analyzeChat(data);
  assert.equal(stats.totalMessages, 2);
  assert.equal(stats.totalParticipants, 2);
  assert.equal(stats.totalReactions, 3);
  assert.equal(stats.authors.find((a) => a.name === 'Аня').replies, 1);
  assert.equal(stats.authors.find((a) => a.name === 'Аня').reactionsGiven, 1);
  assert.equal(extractText(data.messages[2]), 'Спасибо друг');
  assert.equal(JSON.stringify(data), original);
});
test('identity uses stable IDs; prototype names and malformed fields are harmless', () => {
  const stats = analyzeChat({
    messages: [
      msg(1, '__proto__', { from_id: 'user1', media_type: '__proto__' }),
      msg(2, 'new name', { from_id: 'user1', reactions: [null, { count: -2 }, { count: '100' }] }),
      msg(3, 'constructor', { from_id: 'user2', date: 'bad' }),
    ],
  });
  assert.equal(stats.totalParticipants, 2);
  assert.equal(stats.authors[0].name, 'new name');
  assert.equal(stats.totalReactions, 0);
  assert.equal(Object.values(stats.media).every(Number.isFinite), true);
  assert.equal(stats.activeDays, 1);
});
test('validates schema, empty exports and year filter', () => {
  for (const data of [null, {}, { messages: [] }, { messages: [{ type: 'service' }] }])
    assert.throws(() => analyzeChat(data));
  assert.throws(() => analyzeChat({ messages: [msg(1, 'Аня')] }, 2025));
  assert.equal(analyzeChat({ messages: [msg(1, 'Аня')] }, 2026).totalMessages, 1);
});
test('flow awards count chronological streaks and pauses', () => {
  const stats = analyzeChat({
    messages: [
      msg(3, 'Аня'),
      msg(1, 'Аня'),
      msg(4, 'Борис', { date: '2026-01-01T15:00:00' }),
      msg(2, 'Аня'),
    ],
  });
  assert.equal(stats.authors.find((a) => a.name === 'Аня').maxStreak, 3);
  assert.equal(stats.authors.find((a) => a.name === 'Борис').silenceBreaks, 1);
});
test('all six tone/photo combinations share facts and gate actual photo slides', () => {
  const stats = analyzeChat(demoChat());
  for (const tone of ['summary', 'friendly', 'sharp']) {
    for (const photos of [false, true]) {
      const slides = buildSlides(stats, {
        tone,
        photos,
        photoUrls: new Map([['photos/demo.jpg', 'blob:test']]),
      });
      assert.equal(slides.find((s) => s.id === 'overview').value, 102);
      assert.equal(slides.find((s) => s.id === 'maxStreak').value, 17);
      assert.equal(
        slides.some((s) => s.kind === 'photo'),
        photos,
      );
      assert.equal(new Set(slides.map((s) => s.id)).size, slides.length);
    }
  }
  assert.equal(
    buildSlides(stats, { photos: true }).some((s) => s.kind === 'photo'),
    false,
  );
  assert.equal(
    buildSlides(stats, {
      photos: true,
      photoUrls: new Map([['photos/demo.jpg', 'https://evil.example/photo']]),
    }).some((s) => s.kind === 'photo'),
    false,
  );
});
test('rendering escapes names, quotes and attributes', () => {
  const html = renderSlide(
    {
      kind: 'quote',
      title: '<script>alert(1)</script>',
      name: '<img src=x onerror=alert(1)>',
      text: '<svg onload=alert(1)>',
      caption: '"quoted"',
    },
    { chatName: '<iframe>' },
  );
  assert.equal(html.includes('<script>'), false);
  assert.equal(html.includes('<img'), false);
  assert.equal(html.includes('<svg'), false);
  assert.match(html, /&lt;iframe&gt;/);
});
test('single-message chats produce usable slides without invented awards', () => {
  const slides = buildSlides(analyzeChat({ messages: [msg(1, 'Один', { text: '' })] }));
  assert.ok(slides.length >= 2);
  assert.equal(
    slides.some((s) => s.id === 'maxStreak'),
    false,
  );
});
test('import paths reject traversal and remote URLs', () => {
  for (const value of ['../a.jpg', '/a.jpg', 'https://x/a.jpg', 'C:\\a.jpg', 'photos/../../a.jpg'])
    assert.equal(normalizePath(value), null);
  assert.equal(normalizePath('photos\\a.jpg'), 'photos/a.jpg');
});
test('JSON selection refuses ambiguous exports and reads BOM', async () => {
  assert.throws(() => selectJsonFile([{ name: 'a.json' }, { name: 'b.json' }]));
  assert.throws(() => selectJsonFile([{ name: 'result.json' }, { name: 'result.json' }]));
  const file = { name: 'result.json', size: 20, text: async () => '\uFEFF{"messages":[]}' };
  assert.equal(selectJsonFile([file, { name: 'other.json' }]), file);
  assert.deepEqual((await readExport([file])).data, { messages: [] });
  await assert.rejects(readExport([{ ...file, size: 151 * 1024 * 1024 }]));
  await assert.rejects(readExport([{ ...file, text: async () => '<html>' }]));
});
test('photos resolve only selected matching relative files and release blobs', () => {
  const photo = new Blob(['fake pixels'], { type: 'image/jpeg' });
  Object.defineProperties(photo, {
    name: { value: 'a.jpg' },
    webkitRelativePath: { value: 'export/photos/a.jpg' },
  });
  const empty = new Blob([]);
  Object.defineProperties(empty, {
    name: { value: 'empty.jpg' },
    webkitRelativePath: { value: 'export/photos/empty.jpg' },
  });
  const stats = {
    topPhotos: [
      { path: 'photos/a.jpg' },
      { path: 'photos/empty.jpg' },
      { path: '../a.jpg' },
      { path: 'https://evil.example/a.jpg' },
    ],
  };
  const urls = loadPhotoUrls(
    [photo, empty],
    { name: 'result.json', webkitRelativePath: 'export/result.json' },
    stats,
  );
  assert.equal(urls.size, 1);
  assert.match(urls.get('photos/a.jpg'), /^blob:/);
  releasePhotoUrls(urls);
  assert.equal(urls.size, 0);
  assert.equal(
    loadPhotoUrls(
      [photo, photo],
      { name: 'result.json', webkitRelativePath: 'export/result.json' },
      stats,
    ).size,
    0,
  );
});

test('bundled demo photo remains available when Vite resolves an absolute asset URL', () => {
  const stats = analyzeChat(demoChat());
  const demoPhotoUrl = 'http://127.0.0.1:4173/assets/roast-cat-hash.png';
  const options = { photos: true, photoUrls: new Map([['photos/demo.jpg', demoPhotoUrl]]) };
  assert.equal(
    buildSlides(stats, options).some((slide) => slide.kind === 'photo'),
    false,
  );
  assert.equal(
    buildSlides(stats, { ...options, demoPhotoUrl }).some((slide) => slide.kind === 'photo'),
    true,
  );
});

test('reaction-only readers participate in reaction awards without inflating message participants', () => {
  const stats = analyzeChat({
    messages: [
      msg(1, 'Автор', {
        from_id: 'user1',
        reactions: [{ emoji: '👍', count: 1, recent: [{ from: 'Читатель', from_id: 'user2' }] }],
      }),
    ],
  });
  assert.equal(stats.totalParticipants, 1);
  assert.equal(buildSlides(stats).find((slide) => slide.id === 'reactionsGiven').name, 'Читатель');
});
