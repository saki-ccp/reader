import React, { useRef } from 'react';
import { MdAdd, MdClose } from 'react-icons/md';
import { useTranslation } from '@/hooks/useTranslation';
import Select from '@/components/Select';

interface LibraryBackgroundSelectorProps {
  backgroundImage: string;
  backgroundOpacity: number;
  backgroundBlur: number;
  backgroundSize: string;
  onImageChange: (dataUrl: string) => void;
  onOpacityChange: (opacity: number) => void;
  onBlurChange: (blur: number) => void;
  onSizeChange: (size: string) => void;
}

const LibraryBackgroundSelector: React.FC<LibraryBackgroundSelectorProps> = ({
  backgroundImage,
  backgroundOpacity,
  backgroundBlur,
  backgroundSize,
  onImageChange,
  onOpacityChange,
  onBlurChange,
  onSizeChange,
}) => {
  const _ = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportImage = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxW = Math.min(window.innerWidth * 2, 2560);
        const maxH = Math.min(window.innerHeight * 2, 1600);
        const screenRatio = window.innerWidth / window.innerHeight;
        const imgRatio = img.width / img.height;

        let sx = 0,
          sy = 0,
          sw = img.width,
          sh = img.height;
        if (imgRatio > screenRatio) {
          sw = img.height * screenRatio;
          sx = (img.width - sw) / 2;
        } else {
          sh = img.width / screenRatio;
          sy = (img.height - sh) / 2;
        }

        canvas.width = maxW;
        canvas.height = maxH;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, sx, sy, sw, sh, 0, 0, maxW, maxH);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          onImageChange(dataUrl);
        }
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleClear = () => {
    onImageChange('');
  };

  return (
    <div data-setting-id='settings.color.libraryBackground'>
      <h2 className='mb-2 font-medium'>{_('Library Background')}</h2>
      <input
        ref={fileInputRef}
        type='file'
        accept='image/*'
        className='hidden'
        onChange={handleFileChange}
      />
      <div className='mb-4 grid grid-cols-2 gap-4'>
        {backgroundImage && (
          <div
            className='relative flex flex-col items-center justify-center overflow-hidden rounded-lg border-2 shadow-md ring-2 ring-indigo-500 ring-offset-2'
            style={{
              backgroundImage: `url(${backgroundImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              minHeight: '80px',
            }}
          >
            <button
              onClick={handleClear}
              className='absolute left-2 top-2 rounded-full bg-red-500 p-1 text-white transition-colors hover:bg-red-600'
              title={_('Clear')}
            >
              <MdClose size={16} />
            </button>
          </div>
        )}
        <div
          className='border-base-300 relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 shadow-md transition-all'
          style={{ minHeight: '80px' }}
        >
          <button
            className='card-body flex cursor-pointer items-center justify-center p-2 text-center'
            onClick={handleImportImage}
          >
            <div className='flex items-center gap-2'>
              <MdAdd className='text-primary/85 h-6 w-6' />
              <span className='text-primary/85 font-medium'>
                {backgroundImage ? _('Change Image') : _('Import Image')}
              </span>
            </div>
          </button>
        </div>
      </div>

      {backgroundImage && (
        <div className='card border-base-200 bg-base-100 space-y-4 border p-4 shadow'>
          <div className='flex items-center justify-between'>
            <span className='text-sm font-medium'>{_('Overlay Opacity')}</span>
            <div className='flex items-center gap-2'>
              <input
                type='range'
                min='0'
                max='0.7'
                step='0.05'
                value={backgroundOpacity}
                onChange={(e) => onOpacityChange(parseFloat(e.target.value))}
                className='range range-sm w-32'
              />
              <span className='w-12 text-right text-sm'>
                {Math.round(backgroundOpacity * 100)}%
              </span>
            </div>
          </div>

          <div className='flex items-center justify-between'>
            <span className='text-sm font-medium'>{_('Blur')}</span>
            <div className='flex items-center gap-2'>
              <input
                type='range'
                min='0'
                max='20'
                step='1'
                value={backgroundBlur}
                onChange={(e) => onBlurChange(parseInt(e.target.value))}
                className='range range-sm w-32'
              />
              <span className='w-12 text-right text-sm'>{backgroundBlur}px</span>
            </div>
          </div>

          <div className='flex items-center justify-between'>
            <span className='text-sm font-medium'>{_('Size')}</span>
            <Select
              value={backgroundSize}
              onChange={(e) => onSizeChange(e.target.value)}
              options={[
                { value: 'cover', label: _('Cover') },
                { value: 'contain', label: _('Contain') },
                { value: 'auto', label: _('Original') },
              ]}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default LibraryBackgroundSelector;
