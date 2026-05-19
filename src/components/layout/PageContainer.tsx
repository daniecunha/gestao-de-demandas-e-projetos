import React from 'react';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export function PageContainer({
  children,
  className = '',
  actions,
  title,
  subtitle,
}: PageContainerProps) {
  return (
    <div className={['flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6 animate-fade-in', className].join(' ')}>
      {(title || actions) && (
        <div className="flex items-start justify-between mb-6">
          <div>
            {title && (
              <h2 className="font-display text-xl font-semibold text-gray-900 tracking-tight">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
            )}
          </div>
          {actions && <div className="flex items-center gap-3">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
