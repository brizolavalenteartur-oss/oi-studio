import type { SVGProps } from "react";

export function KynKidsLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 150 150" role="img" aria-label="KYN KIDS" {...props}>
      <rect width="150" height="150" fill="#ffed62" />
      <text x="75" y="65" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="16" fontWeight="700" letterSpacing="2" fill="#161616">KYN KIDS</text>
      <path d="M48 108V95C48 76 60 65 75 65S102 76 102 95V108" fill="none" stroke="#54c4d1" strokeWidth="7" />
      <path d="M55 108V96C55 80 63 72 75 72S95 80 95 96V108" fill="none" stroke="#f5f2cb" strokeWidth="3" />
      <path d="M62 108V97C62 85 67 78 75 78S88 85 88 97V108" fill="none" stroke="#75bf79" strokeWidth="2" strokeDasharray="2 2" />
      <path d="M68 108V98C68 89 70 84 75 84S82 89 82 98V108" fill="none" stroke="#75bf79" strokeWidth="2" strokeDasharray="2 2" />
    </svg>
  );
}
