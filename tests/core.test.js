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
import { buildSlides, renderSlide, formatDay, escapeHtml } from '../src/slides.js';
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

test('mood selects distinct composition while preserving award facts', () => {
  const stats = analyzeChat(demoChat());
  const versions = ['summary', 'friendly', 'sharp'].map((tone) =>
    buildSlides(stats, { tone }).find((s) => s.id === 'maxStreak'),
  );
  assert.equal(new Set(versions.map((s) => s.value)).size, 1);
  assert.equal(new Set(versions.map((s) => s.name)).size, 1);
  const rendered = versions.map((s) => renderSlide(s));
  assert.ok(!rendered[0].includes('mood-emoji'));
  assert.ok(rendered[1].includes('mood-emoji'));
  assert.ok(rendered[2].includes('roast-emoji'));
  assert.ok(rendered[2].includes('roast-headline'));
  assert.ok(rendered[2].indexOf('roast-headline') < rendered[2].indexOf('award-body'));
});
test('photo slide contains only full-image surface and escaped author credit', () => {
  const html = renderSlide({
    kind: 'photo',
    title: 'Photo',
    name: '<Author>',
    image: 'blob:test',
    caption: '26 reactions',
  });
  assert.ok(html.includes('&lt;Author&gt;'));
  assert.ok(!html.includes('story-header'));
  assert.ok(!html.includes('story-caption'));
  assert.ok(!html.includes('story-footer'));
});

test('day labels use Russian calendar dates independently of the viewer timezone', () => {
  assert.equal(formatDay('2026-09-10'), '10 сентября 2026');
  assert.equal(formatDay('2025-07-02'), '2 июля 2025');
  assert.equal(formatDay('2026-01-01'), '1 января 2026');
  assert.equal(formatDay('unknown'), 'unknown');
  const stats = analyzeChat(demoChat());
  const original = structuredClone(stats.topDays);
  const days = buildSlides(stats, { tone: 'summary' }).find((slide) => slide.id === 'days');
  assert.ok(days.rows.every((row) => /^\d{1,2} [а-я]+ \d{4}$/.test(row.name)));
  assert.deepEqual(stats.topDays, original);
});

test('calm slides lead with facts without repeating their table labels', () => {
  const stats = analyzeChat(demoChat());
  const extra = { ...stats.authors[0], name: 'Пятый участник' };
  stats.authors.push(extra);
  for (const author of stats.authors) {
    author.messages = 100;
    author.uniqueWords = 20 + stats.authors.indexOf(author);
    for (const key of [
      'reactionsGiven',
      'conversationEnds',
      'maxStreak',
      'reactionsReceived',
      'caps',
    ])
      author[key] = 10 + stats.authors.indexOf(author);
  }
  const slides = buildSlides(stats, { tone: 'summary' });
  const overview = renderSlide(slides.find((slide) => slide.id === 'overview'));
  assert.doesNotMatch(overview, /<header class="story-header">Ваш чат в цифрах<\/header>/);
  assert.match(overview, /class="overview-metric"[\s\S]*class="big-number"[\s\S]*class="unit"/);
  assert.ok(overview.indexOf('overview-caption') > overview.indexOf('class="unit"'));
  assert.ok(!overview.includes('story-footer'));
  assert.ok(slides.every((slide) => !renderSlide(slide).includes('story-note')));
  for (const id of ['maxStreak', 'reactionsGiven', 'conversationEnds', 'messages']) {
    const slide = slides.find((item) => item.id === id);
    assert.equal(slide.rows.length, 4, `${id} should show five participants including the leader`);
    assert.equal(slide.caption, '');
  }
  for (const id of ['vocab-min', 'vocab-max']) {
    const slide = slides.find((item) => item.id === id);
    assert.equal(slide.rows.length, 4, `${id} should compare five participants`);
    assert.equal(slide.caption, '');
  }
  assert.equal(slides.find((slide) => slide.id === 'caps').title, 'Кто пишет капсом');
  assert.equal(slides.find((slide) => slide.id === 'caps').note, '');
  for (const id of ['media', 'weekdays', 'words', 'hours', 'reactions', 'days'])
    assert.equal(slides.find((slide) => slide.id === id).caption, '');
});

test('every factual slide keeps participants and limitations across all moods', () => {
  const stats = analyzeChat(demoChat());
  stats.authors.forEach((author, i) => {
    author.messages = 65 + i;
    author.uniqueWords = 25 + i * 12;
    for (const key of ['morning', 'voice', 'stickers', 'forwards']) author[key] = 12 - i;
  });
  const versions = ['summary', 'friendly', 'sharp'].map((tone) => buildSlides(stats, { tone }));
  for (const base of versions[0]) {
    const slides = versions.map((list) => list.find((s) => s.id === base.id));
    for (const [toneIndex, slide] of slides.entries()) {
      for (const field of ['name', 'value', 'unit', 'rows', 'note']) {
        assert.deepEqual(slide[field], base[field], `${base.id}: ${field}`);
      }
      const html = renderSlide(slide);
      assert.ok(!html.includes('story-footer'), `${base.id} should not show a footer`);
      for (const row of slide.rows || []) assert.ok(html.includes(escapeHtml(row.name)));
      if (slide.note && toneIndex === 2) {
        assert.ok(!html.includes(escapeHtml(slide.note)));
        assert.ok(!html.includes('story-note'));
      }
    }
    const html = slides.map((s) => renderSlide(s));
    assert.ok(!/class="(?:mood|roast)-emoji"/.test(html[0]));
    if (base.kind !== 'chart') {
      const friendly = html[1].match(/class="mood-emoji"[^>]*>([^<]+)/)?.[1];
      const sharp = html[2].match(/class="roast-emoji"[^>]*>([^<]+)/)?.[1];
      if (base.id === 'media') assert.match(html[1], /class="row-icon"/);
      else if (['days', 'longest', 'mostReacted'].includes(base.id))
        assert.ok(!html[1].includes('mood-emoji'), `Unexpected friendly emoji on ${base.id}`);
      else assert.ok(friendly, `Missing friendly emoji on ${base.id}`);
      assert.ok(sharp, `Missing roast emoji on ${base.id}`);
      if (!['days', 'longest', 'mostReacted'].includes(base.id))
        assert.notEqual(friendly, sharp, `Shared mood emoji on ${base.id}`);
    }
    if (base.kind === 'award') assert.ok(html[0].includes('fact-table'));
  }
});

test('friendly flow opens with the overview and keeps its card order intentional', () => {
  const stats = analyzeChat(demoChat());
  const slides = buildSlides(stats, { tone: 'friendly' });
  assert.equal(slides[0].id, 'overview');
  const overview = renderSlide(slides[0]);
  assert.ok(overview.indexOf('<h3') < overview.indexOf('mood-emoji'));
  assert.ok(overview.indexOf('mood-emoji') < overview.indexOf('big-number'));
  assert.ok(overview.indexOf('class="unit"') < overview.indexOf('friendly-overview-context'));
  assert.ok(!overview.includes('story-footer'));
  const award = renderSlide(slides.find((slide) => slide.id === 'maxStreak'));
  assert.ok(award.indexOf('mood-emoji') < award.indexOf('big-number'));
  assert.ok(award.indexOf('mood-emoji') < award.indexOf('<h3'));
  assert.ok(award.indexOf('<h3') < award.indexOf('big-number'));
  assert.ok(award.indexOf('big-number') < award.indexOf('class="unit"'));
  assert.ok(!award.includes('story-note'));
  const support = renderSlide(slides.find((slide) => slide.id === 'reactionsGiven'));
  assert.ok(!support.includes('story-note'));
  const wordsNote = renderSlide(slides.find((slide) => slide.id === 'words'));
  assert.ok(!wordsNote.includes('story-note'));
  const words = wordsNote;
  assert.ok(words.indexOf('mood-emoji') < words.indexOf('story-content'));
  const media = renderSlide(slides.find((slide) => slide.id === 'media'));
  assert.ok(!media.includes('mood-emoji'));
  assert.match(media, /class="row-icon"/);
  const reactions = renderSlide(slides.find((slide) => slide.id === 'reactions'));
  assert.match(reactions, /❤️/);
  const days = renderSlide(slides.find((slide) => slide.id === 'days'));
  assert.ok(!days.includes('mood-emoji'));
  assert.ok(!renderSlide(slides.find((slide) => slide.id === 'longest')).includes('mood-emoji'));
  assert.ok(
    !renderSlide(slides.find((slide) => slide.id === 'mostReacted')).includes('mood-emoji'),
  );
});

test('sharp flow removes supporting copy and keeps quote metadata with its author', () => {
  const slides = buildSlides(analyzeChat(demoChat()), { tone: 'sharp' });
  const renderSharp = (slide) => renderSlide(slide);
  const overview = renderSharp(slides.find((slide) => slide.id === 'overview'));
  assert.ok(!overview.includes('Product Design'));
  assert.ok(!overview.includes('story-caption'));
  assert.ok(!overview.includes('1 / 32'));
  assert.ok(!overview.includes('story-note'));

  for (const slide of slides) {
    const html = renderSharp(slide);
    assert.ok(!html.includes('story-note'), `${slide.id} should not show a sharp note`);
    assert.ok(!html.includes('story-caption'), `${slide.id} should not show a sharp caption`);
    assert.ok(!html.includes('story-footer'), `${slide.id} should not show a footer`);
    assert.ok(!html.includes('1 / 32'), `${slide.id} should not show the sharp counter`);
  }

  const quote = renderSharp(slides.find((slide) => slide.id === 'longest'));
  assert.match(quote, /class="quote-author"[^>]*>[^<]+<span class="quote-meta">/);
  assert.match(quote, /151 символов/);
  assert.ok(!quote.includes('показано начало сообщения'));

  const reactions = renderSharp(slides.find((slide) => slide.id === 'reactions'));
  assert.match(reactions, /❤️/);
});
