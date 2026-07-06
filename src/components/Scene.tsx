// «Сцена» — кинематографичная заглушка фото (градиент гор) или реальное фото.
// Повторяет компонент Scene из дизайн-макета: градиент + силуэт хребта + тёмный оверлей.

import type { CSSProperties, ReactNode } from "react";

type SceneProps = {
  /** CSS-класс градиента (s-dusk, s-canyon …) — используется, если нет image/video. */
  scene?: string;
  /** URL реального фото. Если задан — показывается вместо градиента. */
  image?: string | null;
  /** URL фонового видео (mp4/webm). Имеет приоритет над градиентом, ниже image. */
  video?: string | null;
  /** Зацикливать видео. false — проиграть один раз и замереть на последнем кадре. */
  videoLoop?: boolean;
  alt?: string;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
};

export default function Scene({
  scene = "s-dusk",
  image,
  video,
  videoLoop = true,
  alt = "",
  className = "",
  style,
  children,
}: SceneProps) {
  // Видео показываем только если нет реального фото. Градиент остаётся фоном-заглушкой,
  // пока ролик не загрузился (или если ссылка битая).
  const showVideo = !image && !!video;

  return (
    <div className={`scene ${image ? "" : scene} ${className}`} style={style}>
      {image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt={alt}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: 1,
          }}
        />
      )}
      {showVideo && (
        <video
          className="scene-video"
          src={video!}
          autoPlay
          loop={videoLoop}
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
        />
      )}
      {!image && !showVideo && <div className="ridge" />}
      {children}
    </div>
  );
}
