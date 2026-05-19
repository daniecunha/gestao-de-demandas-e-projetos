import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export function Card({ children, className = '', onClick, hover = false }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={[
        'bg-white rounded-xl border border-gray-200 shadow-card',
        // Lift + deeper shadow on hover: creates a physical "picking up" sensation
        hover && 'cursor-pointer hover:-translate-y-0.5 hover:shadow-card-hover hover:border-gray-300 transition-all duration-200 ease-spring',
        onClick && !hover && 'cursor-pointer',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return (
    <div className={['px-5 py-4 border-b border-gray-100', className].join(' ')}>
      {children}
    </div>
  );
}

interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

export function CardBody({ children, className = '' }: CardBodyProps) {
  return <div className={['px-5 py-4', className].join(' ')}>{children}</div>;
}

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
  return (
    <div className={['px-5 py-3 border-t border-gray-100 bg-gray-50/80 rounded-b-xl', className].join(' ')}>
      {children}
    </div>
  );
}
