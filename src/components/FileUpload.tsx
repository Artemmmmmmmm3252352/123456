import { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Upload, X, Image as ImageIcon, File as FileIcon, Loader2 } from 'lucide-react';
import { processImage, processFile, formatFileSize, type FileUploadResult } from '@/lib/fileUtils';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  /** Текущее значение (data URL или URL) */
  value?: string;
  /** Callback при изменении файла */
  onChange: (dataUrl: string) => void;
  /** Тип загрузки */
  type?: 'image' | 'file';
  /** Максимальный размер в MB */
  maxSizeMB?: number;
  /** Максимальная ширина изображения */
  maxWidth?: number;
  /** Максимальная высота изображения */
  maxHeight?: number;
  /** Качество сжатия (0-1) */
  quality?: number;
  /** Разрешенные типы файлов (для type='file') */
  allowedTypes?: string[];
  /** Плейсхолдер */
  placeholder?: string;
  /** Класс для контейнера */
  className?: string;
  /** Показывать ли предпросмотр */
  showPreview?: boolean;
  /** Размер предпросмотра */
  previewSize?: 'sm' | 'md' | 'lg';
}

export function FileUpload({
  value,
  onChange,
  type = 'image',
  maxSizeMB = 5,
  maxWidth = 1920,
  maxHeight = 1920,
  quality = 0.8,
  allowedTypes,
  placeholder,
  className,
  showPreview = true,
  previewSize = 'md',
}: FileUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      let result: FileUploadResult;

      if (type === 'image') {
        result = await processImage(file, {
          maxWidth,
          maxHeight,
          quality,
          maxSizeMB,
        });
      } else {
        result = await processFile(file, {
          maxSizeMB,
          allowedTypes,
        });
      }

      setPreview(result.dataUrl);
      onChange(result.dataUrl);
      
      toast({
        title: 'Файл загружен',
        description: `${file.name} (${formatFileSize(result.size)})`,
      });
    } catch (error: any) {
      toast({
        title: 'Ошибка загрузки',
        description: error.message || 'Не удалось обработать файл',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
      // Сброс input для возможности повторной загрузки того же файла
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const previewSizes = {
    sm: 'h-16 w-16',
    md: 'h-24 w-24',
    lg: 'h-32 w-32',
  };

  const acceptTypes = type === 'image' 
    ? 'image/*' 
    : allowedTypes?.join(',') || '*/*';

  return (
    <div className={cn('space-y-2', className)}>
      <Label>{placeholder || (type === 'image' ? 'Изображение' : 'Файл')}</Label>
      
      <div className="flex items-center gap-4">
        {showPreview && preview && (
          <div className={cn(
            'relative rounded-lg overflow-hidden border border-border bg-muted',
            previewSizes[previewSize]
          )}>
            {type === 'image' ? (
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <FileIcon className="w-8 h-8 text-muted-foreground" />
              </div>
            )}
            <button
              onClick={handleRemove}
              className="absolute top-1 right-1 p-1 rounded-full bg-background/80 hover:bg-background border border-border"
              type="button"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex-1">
          <Input
            ref={fileInputRef}
            type="file"
            accept={acceptTypes}
            onChange={handleFileSelect}
            className="hidden"
            disabled={isProcessing}
          />
          
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClick}
              disabled={isProcessing}
              className="flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Обработка...
                </>
              ) : (
                <>
                  {type === 'image' ? (
                    <ImageIcon className="w-4 h-4" />
                  ) : (
                    <FileIcon className="w-4 h-4" />
                  )}
                  {preview ? 'Заменить' : 'Выбрать файл'}
                </>
              )}
            </Button>

            {preview && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                disabled={isProcessing}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          <p className="text-xs text-muted-foreground mt-1">
            Максимальный размер: {maxSizeMB}MB
            {type === 'image' && ` • Рекомендуемый размер: ${maxWidth}×${maxHeight}px`}
          </p>
        </div>
      </div>
    </div>
  );
}
