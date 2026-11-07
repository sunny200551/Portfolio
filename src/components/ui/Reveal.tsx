import React from 'react';
import { useReveal } from '../../hooks/useReveal';
import type { RevealOptions } from '../../hooks/useReveal';

interface RevealProps extends RevealOptions {
  children: React.ReactNode;
  className?: string;
  as?: 'div' | 'section' | 'article' | 'span';
}

export const Reveal: React.FC<RevealProps> = ({
  children,
  className = '',
  as = 'div',
  ...options
}) => {
  const ref = useReveal<HTMLDivElement>(options);

  if (as === 'section') {
    return (
      <section ref={ref as unknown as React.RefObject<HTMLElement>} className={`reveal-wrapper ${className}`}>
        {children}
      </section>
    );
  }

  if (as === 'article') {
    return (
      <article ref={ref as unknown as React.RefObject<HTMLElement>} className={`reveal-wrapper ${className}`}>
        {children}
      </article>
    );
  }

  if (as === 'span') {
    return (
      <span ref={ref as unknown as React.RefObject<HTMLSpanElement>} className={`reveal-wrapper ${className}`}>
        {children}
      </span>
    );
  }

  return (
    <div ref={ref} className={`reveal-wrapper ${className}`}>
      {children}
    </div>
  );
};

export default Reveal;
