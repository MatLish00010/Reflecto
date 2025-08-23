import type * as React from 'react';

export function GoogleIcon({
  className = 'size-5',
  ...props
}: React.SVGProps<SVGSVGElement> & { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <g>
        <path
          fill="#4285F4"
          d="M21.805 12.083c0-.638-.057-1.252-.163-1.833H12v3.468h5.617a4.81 4.81 0 0 1-2.084 3.157v2.623h3.37c1.97-1.816 3.102-4.495 3.102-7.415z"
        />
        <path
          fill="#34A853"
          d="M12 22c2.7 0 4.96-.897 6.613-2.437l-3.37-2.623c-.936.627-2.13.997-3.243.997-2.495 0-4.604-1.687-5.362-3.96H3.13v2.49A9.997 9.997 0 0 0 12 22z"
        />
        <path
          fill="#FBBC05"
          d="M6.638 13.977A5.997 5.997 0 0 1 6.1 12c0-.687.118-1.354.338-1.977V7.533H3.13A9.997 9.997 0 0 0 2 12c0 1.57.377 3.055 1.13 4.467l3.508-2.49z"
        />
        <path
          fill="#EA4335"
          d="M12 6.545c1.47 0 2.786.507 3.825 1.5l2.868-2.868C16.96 3.897 14.7 3 12 3A9.997 9.997 0 0 0 3.13 7.533l3.508 2.49C7.396 8.232 9.505 6.545 12 6.545z"
        />
      </g>
    </svg>
  );
}
