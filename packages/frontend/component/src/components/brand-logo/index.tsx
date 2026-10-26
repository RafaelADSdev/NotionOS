import type { SVGProps } from 'react';

export const BrandLogo = ({
  wordmark = false,
  ...props
}: SVGProps<SVGSVGElement> & { wordmark?: boolean }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={wordmark ? 176 : '1em'}
    height={wordmark ? 48 : '1em'}
    viewBox={wordmark ? '0 0 176 48' : '0 0 104 104'}
    role="img"
    aria-label="Nexo"
    {...props}
  >
    <g transform={wordmark ? 'translate(0 4) scale(.3846)' : undefined}>
      <rect
        x="1"
        y="1"
        width="102"
        height="102"
        rx="25"
        fill="#0B0B0F"
        stroke="#3B2D55"
        strokeWidth="2"
      />
      <path d="M27 77V27H40L65 55V27H78V77H65L40 49V77Z" fill="#FFFFFF" />
      <path d="M27 27H40L78 69V77H65L27 35Z" fill="#A78BFA" />
    </g>
    {wordmark ? (
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="5.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M56 35V17M56 24C56 12 75 12 75 25V35" />
        <path d="M85 25H104C104 12 84 12 84 26C84 38 99 39 105 32" />
        <path d="M117 17L135 35M135 17L117 35" />
        <path d="M166 26C166 12 145 12 145 26C145 40 166 40 166 26Z" />
      </g>
    ) : null}
  </svg>
);
