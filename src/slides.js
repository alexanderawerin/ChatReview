export const TONES = { summary: 'Спокойно', friendly: 'Дружески', sharp: 'Пожёстче' };
export const escapeHtml = (value) =>
  String(value ?? '').replace(
    /[&<>"']/g,
    (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char],
  );
export const formatNumber = (value) => new Intl.NumberFormat('ru-RU').format(value);

const dayFormat = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});
export const formatDay = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const date = new Date(`${value}T12:00:00Z`);
  return Number.isNaN(date.valueOf()) ? value : dayFormat.format(date).replace(/ г\.$/, '');
};

const pluralRules = new Intl.PluralRules('ru-RU');
const countLabel = (value, one, few, many) =>
  `${formatNumber(value)} ${{ one, few, many }[pluralRules.select(value)] || many}`;

const awards = [
  [
    'reactionsGiven',
    ['Отданные реакции', 'Группа поддержки', 'Лайк за лайком'],
    [
      'Количество отданных реакций по участникам.',
      'Сердечки сами себя не поставят.',
      'Кнопка сердечка уже стёрлась.',
    ],
    'реакций',
  ],
  [
    'conversationEnds',
    ['Последнее слово перед паузой', 'На этой ноте — всё', 'И чат замолчал'],
    [
      'Сообщения, после которых наступила пауза.',
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
      'Подкаст для своих. Подписка уже оформлена.',
      'Собеседники в этом подкасте не предусмотрены.',
    ],
    'сообщений подряд',
  ],
  [
    'messages',
    ['Больше всего сообщений', 'Голос чата', 'Клавиатура без выходных'],
    [
      'Количество отправленных сообщений.',
      'Кажется, мы ещё не всё обсудили.',
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
      'Количество сообщений в ночные часы.',
      'Кто-то держит чат открытым до утра.',
      'Пока все спят, этот человек печатает.',
    ],
    'ночных сообщений',
  ],
  [
    'morning',
    ['Ранняя активность', 'Первый на связи', 'Будильник с клавиатурой'],
    [
      'Количество сообщений в ранние утренние часы.',
      'Доброе утро начинается здесь.',
      'Ещё даже кофе не включился.',
    ],
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
    ['Кто пишет капсом', 'Громко и ясно', 'CAPS LOCK ЗАЛИП'],
    [
      'Сообщения с преобладанием заглавных букв.',
      'Чтобы точно никто не пропустил.',
      'Мы слышим. Даже без звука.',
    ],
    'сообщений заглавными',
  ],
  [
    'questions',
    ['Больше всего вопросов', 'А можно ещё вопрос?', 'Следственный комитет чата'],
    [
      'Сообщения с вопросом.',
      'Последний вопрос. Ну, почти последний.',
      'Просто ответить уже недостаточно.',
    ],
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
      'У этой мысли есть предисловие.',
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
      // The calm layout puts the metric in the table header. Repeating the
      // same sentence above that table only adds noise.
      caption: index === 0 ? '' : captions[index],
      note: ['reactionsGiven', 'gratitudeGiven', 'gratitudeReceived'].includes(key)
        ? 'Учтены реакции с известным отправителем. Данные могут быть неполными'
        : key === 'conversationEnds'
          ? 'Пауза от 30 минут после сообщения; причина неизвестна'
          : key === 'night'
            ? 'С 23:00 до 04:59 · время из экспорта'
            : key === 'morning'
              ? 'С 05:00 до 07:59 · время из экспорта'
              : key === 'caps'
                ? ''
                : key === 'short'
                  ? 'До трёх слов и меньше 20 символов'
                  : key === 'silenceBreaks'
                    ? 'Первое сообщение после паузы от двух часов'
                    : '',
      rows: people.slice(1, 5).map((a) => ({ name: a.name, count: a[key] })),
    });
  }
  const mascotIndex = slides.findIndex((slide) => slide.id === 'maxStreak');
  if (mascotIndex > 0) slides.unshift(...slides.splice(mascotIndex, 1));
  // The overview is the entry point: establish the whole chat before the first nomination.
  slides.splice(0, 0, {
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
  const mediaIcons = {
    photos: '📷',
    videos: '🎬',
    stickers: '🎭',
    voice: '🎧',
    gifs: '🎞️',
    files: '📎',
    text: '💬',
  };
  const mediaRows = Object.entries(stats.media)
    .filter(([, count]) => count > 0)
    .map(([key, count]) => ({ name: mediaNames[key], count, icon: mediaIcons[key] }))
    .sort((a, b) => b.count - a.count);
  if (mediaRows.length)
    slides.push({
      id: 'media',
      kind: 'ranking',
      title: ['Форматы сообщений', 'Всё, что мы принесли в чат', 'Мультимедийный завал'][index],
      rows: mediaRows.slice(0, 5),
      caption: ['', 'У нас с собой и картинки, и поговорить', 'Всё в чат. Разбираться будут потом'][
        index
      ],
    });
  if (stats.weekdays.some(Boolean))
    slides.push({
      id: 'weekdays',
      kind: 'chart',
      title: ['Сообщения по дням недели', 'У нашей недели свой ритм', 'Неделя в уведомлениях'][
        index
      ],
      rows: [1, 2, 3, 4, 5, 6, 0].map((day) => ({
        name: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'][day],
        count: stats.weekdays[day],
      })),
      caption: ['', 'Сообщения по дням недели.', 'Сообщения по дням недели.'][index],
    });
  const vocabulary = stats.authors
    .filter((author) => author.messages >= 50)
    .sort((a, b) => a.uniqueWords / a.messages - b.uniqueWords / b.messages);
  if (vocabulary.length >= 2)
    for (const [id, author, titles] of [
      [
        'vocab-min',
        vocabulary[0],
        ['Меньше разных слов на сообщение', 'Есть любимые слова', 'Словарь на минималках'],
      ],
      [
        'vocab-max',
        vocabulary.at(-1),
        ['Больше разных слов на сообщение', 'Мастер слова', 'Ходячий словарь'],
      ],
    ])
      slides.push({
        id,
        kind: 'award',
        title: titles[index],
        name: author.name,
        value: author.uniqueWords,
        unit: 'разных слов',
        caption:
          index === 0
            ? ''
            : id === 'vocab-min'
              ? 'Любимые слова всегда под рукой'
              : 'Для каждой мысли найдётся своё слово',
        note: `На ${formatNumber(author.messages)} сообщений · сравнение среди участников с 50+ сообщениями`,
        rows: (id === 'vocab-min' ? vocabulary.slice(1) : vocabulary.slice(0, -1).reverse())
          .slice(0, 4)
          .map((a) => ({ name: a.name, count: a.uniqueWords })),
      });
  if (stats.words.length)
    slides.push({
      id: 'words',
      kind: 'words',
      title: ['Частые слова', 'Наш общий словарь', 'Опять за своё'][index],
      rows: stats.words.slice(0, 8),
      caption: ['', 'Наш маленький разговорник. Издание для своих', 'Да мы с первого раза поняли'][
        index
      ],
      note: 'Без служебных слов, ссылок и упоминаний',
    });
  if (stats.reactions.length)
    slides.push({
      id: 'reactions',
      kind: 'ranking',
      title: ['Распределение реакций', 'Когда всё понятно без слов', 'Разговор большим пальцем'][
        index
      ],
      rows: stats.reactions.slice(0, 5),
      caption: ['', 'Маленькие значки, много чувств', 'Зачем слова, если палец уже обучен'][index],
    });
  if (stats.hours.some(Boolean))
    slides.push({
      id: 'hours',
      kind: 'chart',
      title: ['Когда вы пишете', 'Время собраться', 'Час пик уведомлений'][index],
      rows: stats.hours.map((count, hour) => ({ name: String(hour).padStart(2, '0'), count })),
      caption: ['', 'Сообщения по часам', 'Сообщения по часам'][index],
    });
  if (stats.topDays.length)
    slides.push({
      id: 'days',
      kind: 'ranking',
      title: [
        'Дни с наибольшим числом сообщений',
        'Нам было о чём поговорить',
        'Дни информационного прорыва',
      ][index],
      rows: stats.topDays.slice(0, 5).map((row) => ({ ...row, name: formatDay(row.name) })),
      caption: ['', 'Кажется, в эти дни мы особенно соскучились', 'Кнопку «отправить» явно заело'][
        index
      ],
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
      title: [
        'Сообщение с наибольшим числом реакций',
        'Собрало весь чат',
        'Минута славы в переписке',
      ][index],
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

const friendlyEmoji = {
  conversationEnds: '🌙',
  'vocab-min': '🧸',
  'vocab-max': '✨',
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

const roastEmoji = {
  maxStreak: '🙄',
  messages: '🥵',
  replies: '🍿',
  reactionsGiven: '🤡',
  reactionsReceived: '💅',
  conversationEnds: '💀',
  night: '🧟',
  morning: '😵‍💫',
  gratitudeGiven: '🫠',
  gratitudeReceived: '🤦',
  stickers: '🥴',
  voice: '😩',
  caps: '🤬',
  questions: '🧐',
  links: '😵',
  forwards: '🐒',
  edits: '🤥',
  selfReplies: '🤝',
  silenceBreaks: '🪦',
  short: '🗿',
  emojis: '🤪',
  averageLength: '😮‍💨',
  overview: '🫣',
  media: '🗑️',
  weekdays: '😑',
  hours: '😫',
  words: '🦜',
  reactions: '🤖',
  days: '🤯',
  longest: '😴',
  mostReacted: '👑',
  'vocab-min': '🧱',
  'vocab-max': '🤓',
};

const roastHeadlines = {
  maxStreak: 'Спасибо. Мы тут просто мебель',
  messages: 'Клавиатура подала на развод',
  replies: 'Одно сообщение. И вот уже суд',
  reactionsGiven: 'Лайкни ещё. Тебя точно заметят',
  reactionsReceived: 'Эго просит добавки',
  conversationEnds: 'Поздравляем. Ты выключил людей',
  night: 'Режим сна? Удалён за ненадобностью',
  morning: 'Да кто тебя в такую рань просил',
  gratitudeGiven: 'Спасибо за спасибо за спасибо',
  gratitudeReceived: 'Всех спас. Зарплата — спасибо',
  stickers: 'Мыслей нет. Зато кот смешной',
  voice: 'Подкаст, который никто не заказывал',
  caps: 'ОРИ ГРОМЧЕ. ИНТЕРНЕТ НЕ СЛЫШИТ',
  questions: 'Ты общаешься или протокол ведёшь?',
  links: 'Браузер сдох. Зато мы в курсе',
  forwards: 'Личное мнение временно недоступно',
  edits: 'Думать до отправки? Слишком просто',
  selfReplies: 'Сам себе собеседник. Сам себе фанат',
  silenceBreaks: 'Чат умер. Но тебе же надо',
  short: 'Ок. Пон. Разговор года',
  emojis: 'Алфавит уволен без объяснений',
  averageLength: 'Война и мир. В поле «сообщение»',
  overview: 'Столько букв. Вы там живёте?',
  media: 'Свалка контента. Вход свободный',
  weekdays: 'Рабочая неделя? Чатовая неделя',
  hours: 'Выдохни. Уведомление не зарплата',
  words: 'Новые слова будут или всё?',
  reactions: 'Общение делегировано пальцу',
  days: 'В эти дни кнопка «отправить» горела',
  longest: 'Краткое содержание: мы не осилили',
  mostReacted: 'Всё, звезда. Можно выдохнуть',
  'vocab-min': 'Словарь: базовая комплектация',
  'vocab-max': 'Словарь Ожегова вышел в чат',
};

export function renderSlide(
  slide,
  { mascotUrl = '', chatName = 'chatreview', number = 1, total = 1 } = {},
) {
  const e = escapeHtml;
  const tone = ['friendly', 'sharp'].includes(slide.tone) ? slide.tone : 'summary';
  const emoji =
    (tone === 'sharp' ? roastEmoji : friendlyEmoji)[slide.id] || (tone === 'sharp' ? '🥴' : '✨');
  const dense = ['ranking', 'words', 'chart', 'quote'].includes(slide.kind);
  if (slide.kind === 'photo')
    return `<article class="story story-photo" aria-label="${e(slide.title)}"><img class="photo" src="${e(slide.image)}" alt="${e(slide.title)}"><div class="photo-credit">${e(slide.name)}</div></article>`;
  const rows = (slide.rows || [])
    .map((row) => {
      const rowName =
        tone === 'friendly' && slide.id === 'reactions' && row.name === '❤' ? '❤️' : row.name;
      return `<li>${tone === 'friendly' && row.icon ? `<span class="row-icon" aria-hidden="true">${e(row.icon)}</span>` : ''}<span class="row-label">${e(rowName)}</span><strong>${e(formatNumber(row.count))}</strong></li>`;
    })
    .join('');
  const mood =
    tone === 'friendly' && slide.kind !== 'chart'
      ? `<div class="mood-emoji" aria-hidden="true">${emoji}</div>`
      : '';
  const summaryOverview = tone === 'summary' && slide.kind === 'overview';
  const overviewCaption =
    summaryOverview && slide.caption
      ? `<p class="overview-caption">${e(String(slide.caption).replace(/\.$/, ''))}</p>`
      : '';
  let content;
  if (summaryOverview)
    content = `<div class="award-body overview-body"><h3 title="${e(slide.name)}">${e(slide.name)}</h3><div class="big-number">${e(formatNumber(slide.value))}</div><p class="unit">${e(slide.unit)}</p>${overviewCaption}</div>`;
  else if (tone === 'summary' && slide.kind === 'award')
    content = `<div class="fact-table"><div class="fact-table-labels"><span>Участник</span><span>${e(slide.unit)}</span></div><ul class="slide-ranking"><li class="fact-leader"><span>${e(slide.name)}</span><strong>${e(formatNumber(slide.value))}</strong></li>${rows}</ul></div>`;
  else if (slide.kind === 'quote')
    content = `<blockquote>${e(slide.text)}${slide.text.length >= 220 ? '…' : ''}</blockquote><p class="quote-author">${e(slide.name)}</p>`;
  else if (slide.kind === 'chart') {
    const max = Math.max(...slide.rows.map((row) => row.count), 1);
    content = `<div class="chart">${slide.rows.map((row, i) => `<div class="bar-column" title="${e(row.name)}:00 — ${e(row.count)}"><i style="height:${Math.max(1, (row.count / max) * 100)}%"></i><small>${slide.rows.length <= 7 || i % 3 === 0 ? row.name : ''}</small></div>`).join('')}</div>`;
  } else if (slide.kind === 'ranking' || slide.kind === 'words')
    content = `<ul class="slide-ranking ${slide.kind}">${rows}</ul>`;
  else if (tone === 'friendly')
    content = `<div class="award-body friendly-award-body">${mood}${slide.kind === 'award' ? `<h3 title="${e(slide.name)}">${e(slide.name)}</h3><div class="big-number">${e(formatNumber(slide.value))}</div><p class="unit">${e(slide.unit)}</p>` : `<div class="big-number">${e(formatNumber(slide.value))}</div><p class="unit">${e(slide.unit)}</p><h3 title="${e(slide.name)}">${e(slide.name)}</h3>`}</div>${slide.kind === 'mascot' ? `<img class="mascot" src="${e(mascotUrl)}" alt="Серый кот в солнцезащитных очках"><p class="handwritten">Говорит. И не<br>останавливается.</p>` : `<ul class="runners">${rows}</ul>`}`;
  else
    content = `<div class="award-body"><h3 title="${e(slide.name)}">${e(slide.name)}</h3><div class="big-number">${e(formatNumber(slide.value))}</div><p class="unit">${e(slide.unit)}</p>${slide.kind === 'mascot' ? `<img class="mascot" src="${e(mascotUrl)}" alt="Серый кот в солнцезащитных очках"><p class="handwritten">Говорит. И не<br>останавливается.</p>` : `<ul class="runners">${rows}</ul>`}`;
  const title = summaryOverview ? '' : `<header class="story-header">${e(slide.title)}</header>`;
  const captionText = summaryOverview ? '' : String(slide.caption || '').replace(/\.$/, '');
  const caption = captionText ? `<p class="story-caption">${e(captionText)}</p>` : '';
  const punchline =
    roastHeadlines[slide.id] || String(slide.caption || slide.title).replace(/\.$/, '');
  const note =
    tone === 'friendly' || !slide.note ? '' : `<p class="story-note">${e(slide.note)}</p>`;
  const headingMood =
    tone === 'friendly' &&
    slide.kind !== 'chart' &&
    slide.kind !== 'award' &&
    slide.kind !== 'overview' &&
    slide.id !== 'media'
      ? mood
      : '';
  const body =
    tone === 'sharp'
      ? `<div class="roast-lead">${title}<h2 class="roast-headline">${e(punchline)}</h2><div class="roast-emoji" aria-hidden="true">${emoji}</div></div><div class="story-content">${content}${dense || slide.kind === 'overview' || slide.id.startsWith('vocab-') ? caption : ''}</div>${note}`
      : `${title || headingMood || caption ? `<div class="story-heading">${title}${slide.id === 'days' ? `${caption}${headingMood}` : `${headingMood}${caption}`}</div>` : ''}<div class="story-content">${content}</div>${note}`;

  const ariaLabel = summaryOverview ? 'Обзор чата' : slide.title;
  return `<article class="story story-${e(slide.kind)} story-${e(slide.id)} tone-${tone} palette-${Number(slide.palette) % 4 || 0}" aria-label="${e(ariaLabel)}">${body}<footer class="story-footer"><span>${e(chatName)}</span><span>${number} / ${total}</span></footer></article>`;
}
