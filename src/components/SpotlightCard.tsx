import React from 'react';

interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const SpotlightCard: React.FC<SpotlightCardProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`relative bg-white text-[#0A0A0A] border-2 border-[#0A0A0A] shadow-[6px_6px_0px_#0A0A0A] p-4 sm:p-6 transition-all duration-150 hover:shadow-[6px_6px_0px_#0047AB] ${className}`}
      {...props}
    >
      <div className="relative z-10 text-[#0A0A0A]">{children}</div>
    </div>
  );
};

export default SpotlightCard;
