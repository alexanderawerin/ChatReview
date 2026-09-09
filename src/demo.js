export function demoChat() {
  const messages = [];
  for (let i = 0; i < 17; i++)
    messages.push({
      id: i + 1,
      type: 'message',
      from: 'Саша',
      from_id: 'user1',
      date: new Date(2026, 0, 10, 20, i).toISOString(),
      text:
        i === 0
          ? 'Есть идея: давайте соберёмся на выходных? Я нашёл прекрасное место, там можно гулять, пить кофе и обсуждать всё на свете. Погода обещает быть отличной!'
          : ['И ещё одна мысль', 'Там очень красиво', 'Надо просто выбрать день'][i % 3],
      reactions:
        i % 5 === 0 ? [{ emoji: '❤', count: 3, recent: [{ from: 'Маша', from_id: 'user2' }] }] : [],
    });
  const names = ['Маша', 'Денис', 'Саша', 'Оля'];
  const texts = [
    'Спасибо! Отличная идея ❤',
    'А во сколько встречаемся?',
    'https://example.com — вот это место',
    'ДАВАЙТЕ В СУББОТУ!',
    'Да',
    'Красота 🌿',
    'Я с вами!',
    'Возьму кофе',
  ];
  for (let i = 0; i < 84; i++)
    messages.push({
      id: i + 18,
      type: 'message',
      from: names[i % 4],
      from_id: `user${[2, 3, 1, 4][i % 4]}`,
      date: new Date(2026, i % 8, 11 + (i % 12), [9, 14, 19, 23][i % 4], i % 60).toISOString(),
      text: texts[i % texts.length],
      reply_to_message_id: i % 3 === 0 ? 1 : undefined,
      edited: i % 11 === 0 ? '2026-08-30T12:00:00' : undefined,
      reactions: [{ emoji: ['👍', '❤', '😂'][i % 3], count: 1 + (i % 4) }],
    });
  messages.push({
    id: 200,
    type: 'message',
    from: 'Маша',
    from_id: 'user2',
    date: '2026-08-31T15:00:00',
    text: 'Наш талисман',
    photo: 'photos/demo.jpg',
    reactions: [{ emoji: '😂', count: 12 }],
  });
  return { name: 'Свои люди', messages };
}
