import {
  STOP_WORDS,
  GRATITUDE_WORDS,
  GRATITUDE_EMOJIS,
  FUNNY_EMOJIS,
  SAD_EMOJIS,
} from './constants.js';

export function extractText(message) {
  if (typeof message?.text === 'string') return message.text;
  if (!Array.isArray(message?.text)) return '';
  return message.text
    .map((part) =>
      typeof part === 'string' ? part : typeof part?.text === 'string' ? part.text : '',
    )
    .join('');
}

export function extractWords(text) {
  const cleaned = text.replace(/https?:\/\/\S+|www\.\S+|@[\w]+/gi, '');
  return (cleaned.toLowerCase().match(/[а-яёa-z]{3,}/gi) || []).filter(
    (word) => !STOP_WORDS.has(word),
  );
}

export function localDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

const increment = (map, key, count = 1) => map.set(key, (map.get(key) || 0) + count);
const ranked = (map) =>
  [...map].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
const positiveNumber = (value) =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : 0;
const authorKey = (message) =>
  typeof message.from_id === 'string'
    ? message.from_id
    : `name:${typeof message.from === 'string' ? message.from : 'Неизвестный участник'}`;

function messageDate(message) {
  const date = typeof message.date === 'string' ? new Date(message.date) : null;
  return date && Number.isFinite(date.getTime()) ? date : null;
}

function newAuthor(id, name) {
  return {
    id,
    name,
    messages: 0,
    characters: 0,
    replies: 0,
    reactionsReceived: 0,
    reactionsGiven: 0,
    gratitudeGiven: 0,
    gratitudeReceived: 0,
    night: 0,
    morning: 0,
    stickers: 0,
    voice: 0,
    caps: 0,
    emojis: 0,
    questions: 0,
    links: 0,
    forwards: 0,
    edits: 0,
    short: 0,
    selfReplies: 0,
    silenceBreaks: 0,
    conversationEnds: 0,
    maxStreak: 0,
    monologues: 0,
    uniqueWords: new Set(),
  };
}

/** A single analysis supplies every presentation mode. No UI or network side effects. */
export function analyzeChat(data, year = 0) {
  if (!data || typeof data !== 'object' || !Array.isArray(data.messages)) {
    throw new Error('Нужен JSON-экспорт Telegram с массивом messages.');
  }
  const allMessages = data.messages.filter(
    (message) => message && typeof message === 'object' && message.type === 'message',
  );
  const messages = allMessages.filter(
    (message) => !year || messageDate(message)?.getFullYear() === year,
  );
  if (!messages.length) throw new Error('В этом экспорте нет сообщений для разбора.');

  const authors = new Map();
  const byId = new Map();
  const namesById = new Map();
  for (const message of allMessages) {
    const id = authorKey(message);
    const name = typeof message.from === 'string' ? message.from : 'Неизвестный участник';
    namesById.set(id, name);
    if (typeof message.id === 'number' || typeof message.id === 'string')
      byId.set(String(message.id), id);
  }
  const getAuthor = (id, name = namesById.get(id) || 'Неизвестный участник') => {
    if (!authors.has(id)) authors.set(id, newAuthor(id, name));
    return authors.get(id);
  };
  const words = new Map();
  const reactions = new Map();
  const days = new Map();
  const hours = Array(24).fill(0);
  const weekdays = Array(7).fill(0);
  const media = { photos: 0, videos: 0, stickers: 0, voice: 0, gifs: 0, files: 0, text: 0 };
  const photos = [];
  let firstDate = null;
  let lastDate = null;
  let longest = { text: '', length: 0, name: '' };
  let mostReacted = { text: '', count: 0, name: '' };
  let totalReactions = 0;
  let totalWords = 0;

  for (const message of messages) {
    const author = getAuthor(authorKey(message));
    const text = extractText(message);
    const date = messageDate(message);
    const tokens = extractWords(text);
    author.messages++;
    author.characters += text.length;
    totalWords += tokens.length;
    for (const word of tokens) {
      increment(words, word);
      author.uniqueWords.add(word);
    }

    if (date) {
      if (!firstDate || date < firstDate) firstDate = date;
      if (!lastDate || date > lastDate) lastDate = date;
      const hour = date.getHours();
      hours[hour]++;
      weekdays[date.getDay()]++;
      increment(days, localDateKey(date));
      if (hour >= 23 || hour <= 4) author.night++;
      if (hour >= 5 && hour <= 7) author.morning++;
    }
    if (text.length > longest.length)
      longest = { text: text.slice(0, 220), length: text.length, name: author.name };
    const repliedId = byId.get(String(message.reply_to_message_id));
    const repliedTo = repliedId ? getAuthor(repliedId) : null;
    if (repliedTo) {
      repliedTo.replies++;
      if (repliedId === author.id) author.selfReplies++;
    }
    const lower = text.toLowerCase();
    if (
      GRATITUDE_WORDS.some((word) => lower.includes(word)) ||
      GRATITUDE_EMOJIS.some((emoji) => text.includes(emoji))
    ) {
      author.gratitudeGiven++;
      if (repliedTo && repliedTo.id !== author.id) repliedTo.gratitudeReceived++;
    }

    if (message.photo) media.photos++;
    const mediaKeys = new Map([
      ['video_file', 'videos'],
      ['sticker', 'stickers'],
      ['voice_message', 'voice'],
      ['animation', 'gifs'],
    ]);
    const mediaKey = mediaKeys.get(message.media_type);
    if (mediaKey) media[mediaKey]++;
    else if (message.file) media.files++;
    if (message.media_type === 'sticker') author.stickers++;
    if (message.media_type === 'voice_message') author.voice++;
    if (text && !message.photo && !message.media_type && !message.file) media.text++;

    const letters = text.replace(/[^a-zа-яё]/gi, '');
    if (
      text.length >= 5 &&
      letters.length >= 3 &&
      letters.replace(/[^A-ZА-ЯЁ]/g, '').length / letters.length > 0.7
    )
      author.caps++;
    author.emojis += [...text.matchAll(/\p{Extended_Pictographic}/gu)].length;
    if (
      text.includes('?') ||
      /^(кто|что|где|когда|как|почему|зачем|какой|какая|сколько|кому)\s/i.test(text)
    )
      author.questions++;
    author.links += (text.match(/https?:\/\/\S+/gi) || []).length;
    if (message.forwarded_from) author.forwards++;
    if (message.edited) author.edits++;
    const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
    if (wordCount > 0 && wordCount <= 3 && text.length < 20) author.short++;

    const messageReactions = [];
    let count = 0,
      funny = 0,
      sad = 0;
    for (const reaction of Array.isArray(message.reactions) ? message.reactions : []) {
      if (!reaction || typeof reaction !== 'object') continue;
      const emoji = typeof reaction.emoji === 'string' ? reaction.emoji : '👍';
      const amount = positiveNumber(reaction.count);
      count += amount;
      increment(reactions, emoji, amount);
      if (FUNNY_EMOJIS.includes(emoji)) funny += amount;
      if (SAD_EMOJIS.includes(emoji)) sad += amount;
      messageReactions.push({ emoji, count: amount });
      for (const recent of Array.isArray(reaction.recent) ? reaction.recent : []) {
        if (!recent || typeof recent !== 'object') continue;
        const reactor = getAuthor(
          authorKey(recent),
          typeof recent.from === 'string' ? recent.from : undefined,
        );
        reactor.reactionsGiven++;
        if (GRATITUDE_EMOJIS.includes(emoji) && reactor.id !== author.id) {
          reactor.gratitudeGiven++;
          author.gratitudeReceived++;
        }
      }
    }
    author.reactionsReceived += count;
    totalReactions += count;
    if (count > mostReacted.count)
      mostReacted = { text: text.slice(0, 220), count, name: author.name };
    if (typeof message.photo === 'string' && count > 0) {
      photos.push({
        path: message.photo,
        name: author.name,
        count,
        funny,
        sad,
        reactions: messageReactions,
      });
    }
  }

  // Telegram exports are normally chronological; sort a copy for flow awards only.
  const chronological = messages
    .map((message, index) => ({ message, index, date: messageDate(message) }))
    .sort(
      (a, b) =>
        (a.date?.getTime() ?? Infinity) - (b.date?.getTime() ?? Infinity) || a.index - b.index,
    );
  let lastAuthor = null,
    streak = 0,
    previous = null;
  const finishStreak = () => {
    if (lastAuthor && streak >= 3) {
      const author = getAuthor(lastAuthor);
      author.monologues++;
      author.maxStreak = Math.max(author.maxStreak, streak);
    }
  };
  for (const entry of chronological) {
    const id = authorKey(entry.message);
    if (id === lastAuthor) streak++;
    else {
      finishStreak();
      lastAuthor = id;
      streak = 1;
    }
    if (entry.date && previous?.date) {
      const minutes = (entry.date - previous.date) / 60000;
      if (minutes >= 120) getAuthor(id).silenceBreaks++;
      if (minutes >= 30) getAuthor(authorKey(previous.message)).conversationEnds++;
    }
    previous = entry;
  }
  finishStreak();
  const authorList = [...authors.values()]
    .map((author) => ({
      ...author,
      uniqueWords: author.uniqueWords.size,
      averageLength: author.messages ? Math.round(author.characters / author.messages) : 0,
    }))
    .sort((a, b) => b.messages - a.messages);
  const topPhotos = [...photos].sort((a, b) => b.count - a.count).slice(0, 5);
  const funniestPhoto = [...photos].sort((a, b) => b.funny - a.funny)[0];
  const saddestPhoto = [...photos].sort((a, b) => b.sad - a.sad)[0];
  return {
    chatName: typeof data.name === 'string' && data.name.trim() ? data.name : 'Ваш чат',
    totalMessages: messages.length,
    totalParticipants: authorList.filter((a) => a.messages > 0).length,
    totalWords,
    totalReactions,
    activeDays: days.size,
    firstDate,
    lastDate,
    authors: authorList,
    hours,
    weekdays,
    topDays: ranked(days),
    words: ranked(words),
    reactions: ranked(reactions).filter((r) => r.count > 0),
    media,
    longest,
    mostReacted,
    topPhotos,
    funniestPhoto: funniestPhoto?.funny > 0 ? funniestPhoto : null,
    saddestPhoto: saddestPhoto?.sad > 0 ? saddestPhoto : null,
  };
}
