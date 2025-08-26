interface BrainIconProps {
  className?: string;
  size?: number;
}

export function BrainIcon({ className = '', size = 24 }: BrainIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Brain icon"
      role="img"
    >
      {/* Основной контур мозга */}
      <path
        d="M12 2C8.5 2 6 4.5 6 8C6 9.5 6.5 11 7.5 12C6.5 13 6 14.5 6 16C6 19.5 8.5 22 12 22C15.5 22 18 19.5 18 16C18 14.5 17.5 13 16.5 12C17.5 11 18 9.5 18 8C18 4.5 15.5 2 12 2Z"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />

      {/* Левая половина мозга */}
      <path
        d="M12 2C9.5 2 7.5 4 7.5 6.5C7.5 7.5 8 8.5 9 9C8 9.5 7.5 10.5 7.5 11.5C7.5 14 9.5 16 12 16"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />

      {/* Правая половина мозга */}
      <path
        d="M12 2C14.5 2 16.5 4 16.5 6.5C16.5 7.5 16 8.5 15 9C16 9.5 16.5 10.5 16.5 11.5C16.5 14 14.5 16 12 16"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />

      {/* Стрелка влево (вверх) */}
      <path d="M9 7L9.5 6.5L10 7L9.5 7.5L9 7Z" fill="currentColor" />
      <path
        d="M9.5 6.5L9.5 5.5"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
      />

      {/* Стрелка вправо (вниз) */}
      <path d="M15 11L14.5 10.5L14 11L14.5 11.5L15 11Z" fill="currentColor" />
      <path
        d="M14.5 10.5L14.5 11.5"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
      />
    </svg>
  );
}
