export const TONES = { summary: 'Спокойно', friendly: 'Дружески', sharp: 'Пожёстче' };
export const escapeHtml = (value) =>
  String(value ?? '').replace(
    /[&<>"']/g,
    (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char],
  );
export const formatNumber = (value) => new Intl.NumberFormat('ru-RU').format(value);

const pluralRules = new Intl.PluralRules('ru-RU');
const countLabel = (value, one, few, many) =>
  `${formatNumber(value)} ${{ one, few, many }[pluralRules.select(value)] || many}`;

const awards = [
  [
    'reactionsGiven',
    ['Отданные реакции', 'Группа поддержки', 'Лайк за лайком'],
    [
      'Доступные реакции из списка recent; он может быть неполным.',
      'Всегда поддержит разговор реакцией.',
      'Кнопка сердечка уже стёрлась.',
    ],
    'доступных реакций',
  ],
  [
    'conversationEnds',
    ['Последнее слово перед паузой', 'На этой ноте — всё', 'И чат замолчал'],
    [
      'После сообщения была пауза от 30 минут. Причину это не объясняет.',
      'Иногда разговору нужна пауза.',
      'После этих слов — минимум полчаса тишины.',
    ],
    'пауз после сообщения',
  ],
  [
    'maxStreak',
    ['Самая длинная серия', 'Монолог года', 'Микрофон не отдаёт'],
    [
      'Сообщений подряд от одного участника.',
      'Когда чат — это личный подкаст.',
      'Собеседники в этом подкасте не предусмотрены.',
    ],
    'сообщений подряд',
  ],
  [
    'messages',
    ['Больше всего сообщений', 'Голос чата', 'Клавиатура без выходных'],
    [
      'Самый активный участник.',
      'Всегда есть что добавить.',
      'Чат ещё не прочитал. Уже пришло новое.',
    ],
    'сообщений',
  ],
  [
    'replies',
    ['Больше всего ответов', 'В центре разговора', 'Главный повод поспорить'],
    [
      'Ответы на сообщения участника.',
      'С этого человека начинается обсуждение.',
      'Каждое сообщение требует совещания.',
    ],
    'ответов',
  ],
  [
    'reactionsReceived',
    ['Больше всего реакций', 'Любимчик чата', 'Зависимость от аплодисментов'],
    ['Реакции на сообщения участника.', 'Написал — собрал сердечки.', 'Публика снова не подвела.'],
    'реакций',
  ],
  [
    'night',
    ['Ночная активность', 'Ночная смена', 'Режим сна: никогда'],
    [
      'Сообщения с 23:00 до 04:59.',
      'Кто-то держит чат открытым до утра.',
      'Пока все спят, этот человек печатает.',
    ],
    'ночных сообщений',
  ],
  [
    'morning',
    ['Ранняя активность', 'Первый на связи', 'Будильник с клавиатурой'],
    ['Сообщения с 05:00 до 07:59.', 'Доброе утро начинается здесь.', 'Ещё даже кофе не включился.'],
    'утренних сообщений',
  ],
  [
    'gratitudeGiven',
    ['Благодарности', 'Спасибо, что вы есть', 'Служба поддержки людей'],
    [
      'Сообщения благодарности и доступные реакции.',
      'Тепла в этом чате достаточно.',
      'За доброту здесь отвечает один отдел.',
    ],
    'благодарностей',
  ],
  [
    'gratitudeReceived',
    ['Полученные благодарности', 'На этого человека можно положиться', 'Штатный спасатель'],
    [
      'Благодарности в ответах и доступных реакциях.',
      'Помощь, которую замечают.',
      'Опять всё разрулил. Опять бесплатно.',
    ],
    'благодарностей',
  ],
  [
    'stickers',
    ['Больше всего стикеров', 'Сказал картинкой', 'Слова закончились'],
    [
      'Стикеры, отправленные участником.',
      'Иногда один стикер точнее тысячи слов.',
      'Зачем формулировать, если есть кот?',
    ],
    'стикеров',
  ],
  [
    'voice',
    ['Голосовые сообщения', 'Радио нашего чата', 'Аудиокнига без подписки'],
    [
      'Количество голосовых сообщений.',
      'Этот голос мы узнаем из тысячи.',
      'Текст придумали, но это не аргумент.',
    ],
    'голосовых',
  ],
  [
    'caps',
    ['Сообщения заглавными', 'Громко и ясно', 'CAPS LOCK ЗАЛИП'],
    [
      'Не менее 70% букв — заглавные.',
      'Чтобы точно никто не пропустил.',
      'Мы слышим. Даже без звука.',
    ],
    'громких сообщений',
  ],
  [
    'questions',
    ['Больше всего вопросов', 'А можно ещё вопрос?', 'Следственный комитет чата'],
    ['Сообщения с вопросом.', 'Любопытство двигает разговор.', 'Просто ответить уже недостаточно.'],
    'вопросов',
  ],
  [
    'links',
    ['Больше всего ссылок', 'Нашёл кое-что для вас', 'Ещё одну вкладку, пожалуйста'],
    [
      'Ссылки в сообщениях участника.',
      'Интернет большой. Здесь его лучшее.',
      'Браузер уже просит пощады.',
    ],
    'ссылок',
  ],
  [
    'forwards',
    ['Пересланные сообщения', 'Находки из других чатов', 'Редакция копировать-вставить'],
    [
      'Сообщения с отметкой пересылки.',
      'Хорошее хочется принести своим.',
      'Свой контент? Есть вариант быстрее.',
    ],
    'пересылок',
  ],
  [
    'edits',
    ['Редактирование сообщений', 'Сначала написал, потом подумал', 'Версия окончательная, третья'],
    [
      'Сообщения с отметкой редактирования.',
      'Хорошие мысли заслуживают правки.',
      'История правок была бы отдельным чатом.',
    ],
    'правок',
  ],
  [
    'selfReplies',
    ['Ответы себе', 'Диалог с интересным человеком', 'Сам спросил, сам ответил'],
    [
      'Ответы на собственные сообщения.',
      'Иногда мысль требует продолжения.',
      'Идеальный собеседник наконец найден.',
    ],
    'ответов себе',
  ],
  [
    'silenceBreaks',
    ['Начало после паузы', 'Ну что, как вы?', 'Некромант беседы'],
    [
      'Сообщения после паузы от двух часов.',
      'Не даёт нам потеряться.',
      'Этот чат снова подаёт признаки жизни.',
    ],
    'возвращений',
  ],
  [
    'short',
    ['Короткие сообщения', 'Краткость — талант', 'Ок. Ясно. Пон.'],
    ['До трёх слов и меньше 20 символов.', 'Ни одного лишнего слова.', 'Тариф с оплатой за букву.'],
    'коротких сообщений',
  ],
  [
    'emojis',
    ['Эмодзи в сообщениях', 'Эмоции без перевода', 'Текст под слоем эмодзи'],
    ['Количество графических символов эмодзи.', 'Настроение видно сразу.', 'Буквам тут тесновато.'],
    'эмодзи',
  ],
  [
    'averageLength',
    ['Средняя длина сообщения', 'Есть что рассказать', 'Роман в сообщениях'],
    [
      'Среднее количество символов.',
      'Мысль заслуживает места.',
      'Краткое содержание будет отдельным сообщением.',
    ],
    'символов в среднем',
  ],
];

export function buildSlides(
  stats,
  { tone = 'friendly', photos = false, photoUrls = new Map(), demoPhotoUrl = '' } = {},
) {
  const index = { summary: 0, friendly: 1, sharp: 2 }[tone] ?? 1;
  const slides = [];
  for (const [key, titles, captions, unit] of awards) {
    const people = stats.authors
      .filter((a) => a.messages > 0 || key === 'reactionsGiven' || key.startsWith('gratitude'))
      .filter((a) => a[key] > 0)
      .sort((a, b) => b[key] - a[key]);
    if (!people.length) continue;
    const winner = people[0];
    slides.push({
      id: key,
      kind: 'award',
      title: titles[index],
      name: winner.name,
      value: winner[key],
      unit,
      caption: captions[index],
      rows: people.slice(1, 4).map((a) => ({ name: a.name, count: a[key] })),
    });
  }
  const mascotIndex = slides.findIndex((slide) => slide.id === 'maxStreak');
  if (mascotIndex > 0) slides.unshift(...slides.splice(mascotIndex, 1));
  slides.splice(Math.min(1, slides.length), 0, {
    id: 'overview',
    kind: 'overview',
    title: ['Ваш чат в цифрах', 'Вот так поговорили', 'Масштаб катастрофы'][index],
    name: stats.chatName,
    value: stats.totalMessages,
    unit: 'сообщений',
    caption: `${countLabel(stats.totalParticipants, 'участник', 'участника', 'участников')} · ${countLabel(stats.activeDays, 'активный день', 'активных дня', 'активных дней')} · ${countLabel(stats.totalReactions, 'реакция', 'реакции', 'реакций')}`,
  });
  const mediaNames = {
    photos: 'Фотографии',
    videos: 'Видео',
    stickers: 'Стикеры',
    voice: 'Голосовые',
    gifs: 'GIF',
    files: 'Файлы',
    text: 'Текст',
  };
  const mediaRows = Object.entries(stats.media)
    .filter(([, count]) => count > 0)
    .map(([key, count]) => ({ name: mediaNames[key], count }))
    .sort((a, b) => b.count - a.count);
  if (mediaRows.length)
    slides.push({
      id: 'media',
      kind: 'ranking',
      title: 'Из чего состоит разговор',
      rows: mediaRows.slice(0, 5),
      caption: `Любимый формат: ${mediaRows[0].name.toLowerCase()}.`,
    });
  if (stats.weekdays.some(Boolean))
    slides.push({
      id: 'weekdays',
      kind: 'chart',
      title: 'Ритм недели',
      rows: [1, 2, 3, 4, 5, 6, 0].map((day) => ({
        name: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'][day],
        count: stats.weekdays[day],
      })),
      caption: 'Сообщения по дням недели.',
    });
  const vocabulary = stats.authors
    .filter((author) => author.messages >= 50)
    .sort((a, b) => a.uniqueWords / a.messages - b.uniqueWords / b.messages);
  if (vocabulary.length >= 2)
    for (const [id, author, titles] of [
      [
        'vocab-min',
        vocabulary[0],
        ['Компактный словарь', 'Есть любимые слова', 'Словарь на минималках'],
      ],
      ['vocab-max', vocabulary.at(-1), ['Разнообразие слов', 'Мастер слова', 'Ходячий словарь']],
    ])
      slides.push({
        id,
        kind: 'award',
        title: titles[index],
        name: author.name,
        value: author.uniqueWords,
        unit: 'разных слов',
        caption: `На ${formatNumber(author.messages)} сообщений. Сравниваем участников с 50+ сообщениями.`,
      });
  if (stats.words.length)
    slides.push({
      id: 'words',
      kind: 'words',
      title: ['Частые слова', 'Наш общий словарь', 'Опять за своё'][index],
      rows: stats.words.slice(0, 8),
      caption: 'Без служебных слов, ссылок и упоминаний.',
    });
  if (stats.reactions.length)
    slides.push({
      id: 'reactions',
      kind: 'ranking',
      title: 'На языке реакций',
      rows: stats.reactions.slice(0, 5),
      caption: 'Так мы отвечаем, когда слов не нужно.',
    });
  if (stats.hours.some(Boolean))
    slides.push({
      id: 'hours',
      kind: 'chart',
      title: ['Когда вы пишете', 'Время собраться', 'Час пик уведомлений'][index],
      rows: stats.hours.map((count, hour) => ({ name: String(hour).padStart(2, '0'), count })),
      caption: 'Сообщения по часам · время из экспорта.',
    });
  if (stats.topDays.length)
    slides.push({
      id: 'days',
      kind: 'ranking',
      title: 'Самые разговорчивые дни',
      rows: stats.topDays.slice(0, 5),
      caption: 'Дни, когда разговор не заканчивался.',
    });
  if (stats.longest.length)
    slides.push({
      id: 'longest',
      kind: 'quote',
      title: ['Самое длинное сообщение', 'Большая мысль', 'Можно было созвониться'][index],
      name: stats.longest.name,
      text: stats.longest.text,
      caption: `${formatNumber(stats.longest.length)} символов · показано начало сообщения`,
    });
  if (stats.mostReacted.count)
    slides.push({
      id: 'mostReacted',
      kind: 'quote',
      title: 'Сообщение, которое заметили',
      name: stats.mostReacted.name,
      text: stats.mostReacted.text || 'Медиа без подписи',
      caption: `${formatNumber(stats.mostReacted.count)} реакций · показано начало сообщения`,
    });
  if (photos) {
    const featured = stats.topPhotos.map((photo, i) => ({
      photo,
      title: `Фото чата · ${i + 1}`,
      id: `photo-${i}`,
    }));
    if (stats.funniestPhoto)
      featured.push({ photo: stats.funniestPhoto, title: 'Смешнее всех', id: 'funny-photo' });
    if (stats.saddestPhoto)
      featured.push({ photo: stats.saddestPhoto, title: 'Обнимаем всем чатом', id: 'sad-photo' });
    for (const { photo, title, id } of featured) {
      const url = photoUrls.get(photo.path);
      if (url && (url.startsWith('blob:') || url === demoPhotoUrl))
        slides.push({
          id,
          kind: 'photo',
          title,
          name: photo.name,
          image: url,
          caption: countLabel(photo.count, 'реакция', 'реакции', 'реакций'),
        });
    }
  }
  return slides.map((slide, position) => ({
    ...slide,
    tone: ['summary', 'friendly', 'sharp'][index],
    palette: position % 4,
  }));
}

const moodEmoji = {
  maxStreak: '🎙️',
  messages: '💬',
  replies: '🗣️',
  reactionsGiven: '🫶',
  reactionsReceived: '🌟',
  night: '🦉',
  morning: '☀️',
  gratitudeGiven: '💌',
  gratitudeReceived: '🥹',
  stickers: '🎭',
  voice: '🎧',
  caps: '📣',
  questions: '🤔',
  links: '🔗',
  forwards: '📨',
  edits: '✍️',
  selfReplies: '🪞',
  silenceBreaks: '👀',
  short: '🤏',
  emojis: '😂',
  averageLength: '📚',
  overview: '🎉',
  reactions: '😍',
  hours: '⏰',
  days: '📅',
  longest: '📜',
  mostReacted: '🏆',
  words: '💭',
  media: '🎬',
};

export function renderSlide(
  slide,
  { mascotUrl = '', chatName = 'chatreview', number = 1, total = 1 } = {},
) {
  const e = escapeHtml;
  const tone = ['friendly', 'sharp'].includes(slide.tone) ? slide.tone : 'summary';
  const emoji = moodEmoji[slide.id] || (tone === 'sharp' ? '🔥' : '✨');
  const support = [
    'reactionsGiven',
    'reactionsReceived',
    'gratitudeGiven',
    'gratitudeReceived',
    'overview',
  ];
  const voice = [
    'maxStreak',
    'messages',
    'replies',
    'voice',
    'caps',
    'questions',
    'selfReplies',
    'averageLength',
  ];
  const quiet = ['night', 'morning', 'conversationEnds', 'silenceBreaks', 'short'];
  const dense = ['ranking', 'words', 'chart', 'quote'].includes(slide.kind);
  const scene =
    tone === 'summary' || dense
      ? 'plain'
      : tone === 'friendly'
        ? support.includes(slide.id)
          ? 'party'
          : voice.includes(slide.id)
            ? 'studio'
            : 'plain'
        : voice.includes(slide.id)
          ? 'fire'
          : quiet.includes(slide.id)
            ? 'plain'
            : 'poster';
  if (slide.kind === 'photo')
    return `<article class="story story-photo" aria-label="${e(slide.title)}"><img class="photo" src="${e(slide.image)}" alt="${e(slide.title)}"><div class="photo-credit">${e(slide.name)}</div></article>`;
  const numberSize = Math.min(
    slide.kind === 'mascot' ? 27 : slide.kind === 'overview' ? 15 : 17,
    82 / Math.max(1, formatNumber(slide.value ?? 0).length),
  );
  const rows = (slide.rows || [])
    .map(
      (row) => `<li><span>${e(row.name)}</span><strong>${e(formatNumber(row.count))}</strong></li>`,
    )
    .join('');
  let content;
  if (slide.kind === 'photo')
    content = `<img class="photo" src="${e(slide.image)}" alt="Фотография из чата"><div class="photo-credit">${e(slide.name)}</div>`;
  else if (slide.kind === 'quote')
    content = `<blockquote>${e(slide.text)}${slide.text.length >= 220 ? '…' : ''}</blockquote><p class="quote-author">${e(slide.name)}</p>`;
  else if (slide.kind === 'chart') {
    const max = Math.max(...slide.rows.map((row) => row.count), 1);
    content = `<div class="chart">${slide.rows.map((row, i) => `<div class="bar-column" title="${e(row.name)}:00 — ${e(row.count)}"><i style="height:${Math.max(1, (row.count / max) * 100)}%"></i><small>${slide.rows.length <= 7 || i % 3 === 0 ? row.name : ''}</small></div>`).join('')}</div>`;
  } else if (slide.kind === 'ranking' || slide.kind === 'words')
    content = `<ul class="slide-ranking ${slide.kind}">${rows}</ul>`;
  else
    content = `<div class="award-body"><h3 title="${e(slide.name)}">${e(slide.name)}</h3><div class="big-number" style="font-size:${numberSize}cqw">${e(formatNumber(slide.value))}</div><p class="unit">${e(slide.unit)}</p></div>${slide.kind === 'mascot' ? `<img class="mascot" src="${e(mascotUrl)}" alt="Серый кот в солнцезащитных очках"><p class="handwritten">Говорит. И не<br>останавливается.</p>` : `<ul class="runners">${rows}</ul>`}`;
  const mood =
    tone === 'summary'
      ? ''
      : `<div class="mood-emoji" aria-hidden="true">${tone === 'sharp' ? '😈' : emoji}</div>`;
  const title = `<header class="story-header">${e(slide.title)}</header>`;
  const caption = `<p class="story-caption">${e(slide.caption)}</p>`;
  const body =
    tone === 'sharp'
      ? `${title}${caption}<div class="roast-evidence">${content}</div>${mood}`
      : `${title}${content}${mood}${caption}`;
  return `<article class="story story-${e(slide.kind)} tone-${tone} scene-${scene} palette-${Number(slide.palette) % 4 || 0}" aria-label="${e(slide.title)}">${body}<footer class="story-footer"><span>${e(chatName)}</span><span>${number} / ${total}</span></footer></article>`;
}
