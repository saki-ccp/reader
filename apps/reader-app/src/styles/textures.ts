import { getFilename } from '@/utils/path';
import { md5Fingerprint } from '@/utils/md5';

export interface BackgroundTexture {
  id: string;
  name: string;
  path?: string;
  url?: string;

  downloadedAt?: number;
  deletedAt?: number;

  blobUrl?: string;
  loaded?: boolean;
  error?: string;
}

export type CustomTexture = BackgroundTexture & { path: string };

export type CustomTextureInfo = Partial<BackgroundTexture> &
  Required<Pick<BackgroundTexture, 'path' | 'name'>>;

export const PREDEFINED_TEXTURES: BackgroundTexture[] = [
  { id: 'none', name: 'None', url: '', loaded: true },
  { id: 'concrete', name: 'Concrete', url: '/images/concrete-texture.png', loaded: true },
  { id: 'paper', name: 'Paper', url: '/images/paper-texture.png', loaded: true },
  { id: 'sand', name: 'Sand', url: '/images/sand-texture.jpg', loaded: true },
  { id: 'parchment', name: 'Parchment', url: '/images/parchment-paper.jpg', loaded: true },
  { id: 'scrapbook', name: 'Scrapbook', url: '/images/scrapbook-texture.jpg', loaded: true },
  { id: 'leaves', name: 'Leaves', url: '/images/leaves-pattern.jpg', loaded: true },
  { id: 'moon', name: 'Moon Sky', url: '/images/moon-sky.jpg', loaded: true },
  { id: 'night-sky', name: 'Night Sky', url: '/images/night-sky.jpg', loaded: true },
  { id: 'anime-sakura', name: 'Anime Sakura', url: '/images/anime-sakura.jpg', loaded: true },
  { id: 'anime-sky', name: 'Anime Sky', url: '/images/anime-sky.jpg', loaded: true },
  { id: 'anime-street', name: 'Anime Street', url: '/images/anime-street.jpg', loaded: true },
];

export function getTextureName(path: string): string {
  const fileName = getFilename(path);
  return fileName.replace(/\.(jpg|jpeg|png|gif|bmp|webp)$/i, '');
}

export function getTextureId(name: string): string {
  return md5Fingerprint(name);
}

export function createCustomTexture(path: string): CustomTexture {
  const name = getTextureName(path);
  return {
    id: getTextureId(name),
    name,
    path,
  };
}

const createTextureCSS = (texture: BackgroundTexture) => {
  const css = `
    .sidebar-container, .notebook-container, .foliate-viewer {
      position: relative;
      overflow: hidden;
    }

    body::before, .sidebar-container::before, .notebook-container::before,
    .foliate-viewer::before {
      content: "";
      position: absolute;
      top: calc(var(--bg-texture-blur, 0px) * -1);
      left: calc(var(--bg-texture-blur, 0px) * -1);
      right: calc(var(--bg-texture-blur, 0px) * -1);
      bottom: calc(var(--bg-texture-blur, 0px) * -1);
      pointer-events: none;
      z-index: 0;
      background-image: url("${texture.blobUrl || texture.url}");
      background-repeat: no-repeat;
      background-size: var(--bg-texture-size, cover);
      background-position: center;
      mix-blend-mode: var(--bg-texture-blend-mode, multiply);
      opacity: var(--bg-texture-opacity, 0.6);
      filter: blur(var(--bg-texture-blur, 0px));
    }
    body::before {
      height: calc(100vh + var(--bg-texture-blur, 0px) * 2);
    }
    `;

  return css;
};

const textureStyleId = 'background-texture';
export const mountBackgroundTexture = (document: Document, texture: BackgroundTexture) => {
  const styleElement = document.getElementById(textureStyleId) || document.createElement('style');
  styleElement.id = textureStyleId;
  styleElement.textContent = createTextureCSS(texture);

  if (!styleElement.parentNode) {
    document.head.appendChild(styleElement);
  }
};

export const unmountBackgroundTexture = (document: Document) => {
  const styleElement = document.getElementById(textureStyleId);
  if (styleElement && styleElement.parentNode) {
    styleElement.parentNode.removeChild(styleElement);
  }
};
