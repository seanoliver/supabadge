export function generateBadgeSVG(label: string, value: string, color: string): string {
  const iconWidth = 20;
  const labelWidth = label.length * 7 + 10;
  const valueWidth = value.length * 7 + 10;
  const totalWidth = iconWidth + labelWidth + valueWidth;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="20">
    <defs>
      <linearGradient id="b" x2="0" y2="100%">
        <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
        <stop offset="1" stop-opacity=".1"/>
      </linearGradient>
      <linearGradient id="supabase_paint0" x1="53.9738" y1="54.974" x2="94.1635" y2="71.8295" gradientUnits="userSpaceOnUse">
        <stop stop-color="#249361"/>
        <stop offset="1" stop-color="#3ECF8E"/>
      </linearGradient>
      <linearGradient id="supabase_paint1" x1="36.1558" y1="30.578" x2="54.4844" y2="65.0806" gradientUnits="userSpaceOnUse">
        <stop/>
        <stop offset="1" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <mask id="a">
      <rect width="${totalWidth}" height="20" rx="3" fill="#fff"/>
    </mask>
    <g mask="url(#a)">
      <rect width="${iconWidth + labelWidth}" height="20" fill="#555"/>
      <rect x="${iconWidth + labelWidth}" width="${valueWidth}" height="20" fill="${color}"/>
      <rect width="${totalWidth}" height="20" fill="url(#b)"/>
    </g>
    <g transform="translate(2, 2) scale(0.142)">
      <path d="M63.7076 110.284C60.8481 113.885 55.0502 111.912 54.9813 107.314L53.9738 40.0627L99.1935 40.0627C107.384 40.0627 111.952 49.5228 106.859 55.9374L63.7076 110.284Z" fill="url(#supabase_paint0)"/>
      <path d="M63.7076 110.284C60.8481 113.885 55.0502 111.912 54.9813 107.314L53.9738 40.0627L99.1935 40.0627C107.384 40.0627 111.952 49.5228 106.859 55.9374L63.7076 110.284Z" fill="url(#supabase_paint1)" fill-opacity="0.2"/>
      <path d="M45.317 2.07103C48.1765 -1.53037 53.9745 0.442937 54.0434 5.041L54.4849 72.2922H9.83113C1.64038 72.2922 -2.92775 62.8321 2.1655 56.4175L45.317 2.07103Z" fill="#3ECF8E"/>
    </g>
    <g fill="#fff" text-anchor="middle" font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="11">
      <text x="${iconWidth + labelWidth / 2}" y="15" fill="#010101" fill-opacity=".3">${label}</text>
      <text x="${iconWidth + labelWidth / 2}" y="14">${label}</text>
      <text x="${iconWidth + labelWidth + valueWidth / 2}" y="15" fill="#010101" fill-opacity=".3">${value}</text>
      <text x="${iconWidth + labelWidth + valueWidth / 2}" y="14">${value}</text>
    </g>
  </svg>`;
}

export function generateBadgeReactSVG(label: string, value: string, color: string) {
  const iconWidth = 20;
  const labelWidth = label.length * 7 + 10;
  const valueWidth = value.length * 7 + 10;
  const totalWidth = iconWidth + labelWidth + valueWidth;

  return {
    width: totalWidth,
    height: 20,
    iconWidth,
    labelWidth,
    valueWidth,
    label,
    value,
    color
  };
}