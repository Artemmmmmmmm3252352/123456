/**
 * Утилиты для обработки файлов и изображений
 */

export interface FileUploadResult {
  dataUrl: string;
  file: File;
  size: number;
  type: string;
}

/**
 * Сжимает изображение до указанного размера
 */
export async function compressImage(
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1920,
  quality: number = 0.8
): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Вычисляем новые размеры с сохранением пропорций
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = width * ratio;
          height = height * ratio;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Не удалось получить контекст canvas'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Не удалось создать blob'));
              return;
            }
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          file.type,
          quality
        );
      };
      img.onerror = () => reject(new Error('Ошибка загрузки изображения'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Ошибка чтения файла'));
    reader.readAsDataURL(file);
  });
}

/**
 * Конвертирует файл в base64 data URL
 */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Ошибка чтения файла'));
    reader.readAsDataURL(file);
  });
}

/**
 * Обрабатывает изображение: сжимает и конвертирует в data URL
 */
export async function processImage(
  file: File,
  options?: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    maxSizeMB?: number;
  }
): Promise<FileUploadResult> {
  const {
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 0.8,
    maxSizeMB = 5,
  } = options || {};

  // Проверка размера файла
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    throw new Error(`Файл слишком большой. Максимальный размер: ${maxSizeMB}MB`);
  }

  // Проверка типа файла
  if (!file.type.startsWith('image/')) {
    throw new Error('Файл должен быть изображением');
  }

  // Сжимаем изображение
  const compressedFile = await compressImage(file, maxWidth, maxHeight, quality);

  // Конвертируем в data URL
  const dataUrl = await fileToDataUrl(compressedFile);

  return {
    dataUrl,
    file: compressedFile,
    size: compressedFile.size,
    type: compressedFile.type,
  };
}

/**
 * Обрабатывает обычный файл (не изображение)
 */
export async function processFile(
  file: File,
  options?: {
    maxSizeMB?: number;
    allowedTypes?: string[];
  }
): Promise<FileUploadResult> {
  const { maxSizeMB = 10, allowedTypes } = options || {};

  // Проверка размера файла
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    throw new Error(`Файл слишком большой. Максимальный размер: ${maxSizeMB}MB`);
  }

  // Проверка типа файла
  if (allowedTypes && !allowedTypes.includes(file.type)) {
    throw new Error(`Тип файла не поддерживается. Разрешенные типы: ${allowedTypes.join(', ')}`);
  }

  // Конвертируем в data URL
  const dataUrl = await fileToDataUrl(file);

  return {
    dataUrl,
    file,
    size: file.size,
    type: file.type,
  };
}

/**
 * Форматирует размер файла в читаемый вид
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
