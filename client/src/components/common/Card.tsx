import type { ReactNode } from 'react';

type CardProps = {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
};

const Card = ({ title, subtitle, children, className = '' }: CardProps) => {
  return (
    <div className={`rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm ${className}`}>
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">{title}</h3>}
          {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;
