import { renderSlide } from './slides.js';

export async function exportSlides(
  slides,
  {
    mascotUrl,
    chatName,
    startIndex = 0,
    total = slides.length,
    zip = false,
    onProgress = () => {},
  },
) {
  const { default: html2canvas } = await import('html2canvas');
  let result;
  const archive = zip ? new (await import('jszip')).default() : null;
  const host = document.createElement('div');
  host.className = 'export-host';
  host.setAttribute('aria-hidden', 'true');
  document.body.append(host);
  try {
    await document.fonts.ready;
    for (const [i, slide] of slides.entries()) {
      onProgress(i + 1, slides.length);
      host.innerHTML = renderSlide(slide, {
        mascotUrl,
        chatName,
        number: startIndex + i + 1,
        total,
      });
      await Promise.all(
        [...host.querySelectorAll('img')].map(async (image) => {
          try {
            await image.decode();
            // html2canvas does not implement object-fit; resolve contain into explicit geometry.
            const box = image.getBoundingClientRect();
            const parent = host.firstElementChild.getBoundingClientRect();
            const scale = Math.min(
              box.width / image.naturalWidth,
              box.height / image.naturalHeight,
            );
            const width = image.naturalWidth * scale;
            const height = image.naturalHeight * scale;
            Object.assign(image.style, {
              width: `${width}px`,
              height: `${height}px`,
              left: `${box.left - parent.left + (image.classList.contains('photo') ? 0 : (box.width - width) / 2)}px`,
              top: `${box.top - parent.top + (box.height - height) / 2}px`,
              right: 'auto',
              bottom: 'auto',
            });
          } catch {
            throw new Error(
              'одна из фотографий повреждена или недоступна. Отключите фотографии и попробуйте снова.',
            );
          }
        }),
      );
      const canvas = await html2canvas(host.firstElementChild, {
        width: 1280,
        height: 720,
        scale: 1,
        backgroundColor: '#ff553b',
        logging: false,
      });
      const blob = await new Promise((resolve, reject) =>
        canvas.toBlob(
          (value) => (value ? resolve(value) : reject(new Error('браузер не смог создать PNG.'))),
          'image/png',
        ),
      );
      const filename = `chatreview-${String(startIndex + i + 1).padStart(2, '0')}.png`;
      if (archive) archive.file(filename, blob);
      else result = { blob, filename };
      canvas.width = 0;
      canvas.height = 0;
    }
    if (archive)
      result = {
        blob: await archive.generateAsync({ type: 'blob', compression: 'STORE' }),
        filename: 'chatreview-slides.zip',
      };
    return result;
  } finally {
    host.remove();
  }
}
