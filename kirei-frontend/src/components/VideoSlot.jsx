import { useState } from 'react';

/**
 * Slots vidéo : déposez vos fichiers dans public/videos/ et renseignez le chemin.
 * Tant que la vidéo est absente, une image (poster) avec effet Ken Burns est affichée.
 * `mono` applique un filtre niveaux de gris au média (direction artistique).
 */
export default function VideoSlot({ src, poster, className = '', mono = false, children }) {
  const [failed, setFailed] = useState(false);
  const hasVideo = Boolean(src);
  const mediaClass = `${mono ? 'grayscale' : ''} absolute inset-0 h-full w-full object-cover`;

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {hasVideo && !failed ? (
        <video
          className={mediaClass}
          src={src}
          poster={poster}
          autoPlay
          muted
          loop
          playsInline
          onError={() => setFailed(true)}
        />
      ) : (
        <img src={poster} alt="" aria-hidden className={`${mediaClass} animate-kenburns`} />
      )}
      {children}
    </div>
  );
}
