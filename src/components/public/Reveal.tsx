"use client";

// Обёртка для анимации появления элемента при прокрутке.
// Добавляет класс .in, когда элемент попадает в зону видимости (IntersectionObserver).

import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  /** Тег обёртки (по умолчанию div). */
  as?: ElementType;
  /** Задержка 1–4 (ступенчатое появление). */
  delay?: 1 | 2 | 3 | 4;
  className?: string;
  style?: React.CSSProperties;
};

export default function Reveal({ children, as, delay, className = "", style }: RevealProps) {
  const Tag = as || "div";
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Если уже видим при загрузке — показываем сразу.
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setShown(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={`reveal ${delay ? `reveal-d${delay}` : ""} ${shown ? "in" : ""} ${className}`}
      style={style}
    >
      {children}
    </Tag>
  );
}
