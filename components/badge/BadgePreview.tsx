import { generateBadgeReactSVG } from "@/lib/badge-generator";

interface BadgePreviewProps {
  label: string;
  value: string;
  color: string;
}

export function BadgePreview({ label, value, color }: BadgePreviewProps) {
  const { width, height, iconWidth, labelWidth, valueWidth } = generateBadgeReactSVG(label, value, color);

  return (
    <div className="flex justify-center rounded-lg border bg-gray-50 p-8">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={width}
        height={height}
      >
        <defs>
          <linearGradient id="b" x2="0" y2="100%">
            <stop offset="0" stopColor="#bbb" stopOpacity=".1" />
            <stop offset="1" stopOpacity=".1" />
          </linearGradient>
          <linearGradient id="supabase_paint0" x1="53.9738" y1="54.974" x2="94.1635" y2="71.8295" gradientUnits="userSpaceOnUse">
            <stop stopColor="#249361"/>
            <stop offset="1" stopColor="#3ECF8E"/>
          </linearGradient>
          <linearGradient id="supabase_paint1" x1="36.1558" y1="30.578" x2="54.4844" y2="65.0806" gradientUnits="userSpaceOnUse">
            <stop/>
            <stop offset="1" stopOpacity="0"/>
          </linearGradient>
        </defs>
        <mask id="a">
          <rect width={width} height={height} rx="3" fill="#fff" />
        </mask>
        <g mask="url(#a)">
          <rect width={iconWidth + labelWidth} height={height} fill="#555" />
          <rect x={iconWidth + labelWidth} width={valueWidth} height={height} fill={color} />
          <rect width={width} height={height} fill="url(#b)" />
        </g>
        <g transform="translate(2, 2) scale(0.142)">
          <path d="M63.7076 110.284C60.8481 113.885 55.0502 111.912 54.9813 107.314L53.9738 40.0627L99.1935 40.0627C107.384 40.0627 111.952 49.5228 106.859 55.9374L63.7076 110.284Z" fill="url(#supabase_paint0)"/>
          <path d="M63.7076 110.284C60.8481 113.885 55.0502 111.912 54.9813 107.314L53.9738 40.0627L99.1935 40.0627C107.384 40.0627 111.952 49.5228 106.859 55.9374L63.7076 110.284Z" fill="url(#supabase_paint1)" fillOpacity="0.2"/>
          <path d="M45.317 2.07103C48.1765 -1.53037 53.9745 0.442937 54.0434 5.041L54.4849 72.2922H9.83113C1.64038 72.2922 -2.92775 62.8321 2.1655 56.4175L45.317 2.07103Z" fill="#3ECF8E"/>
        </g>
        <g fill="#fff" textAnchor="middle" fontFamily="DejaVu Sans,Verdana,Geneva,sans-serif" fontSize="11">
          <text x={iconWidth + labelWidth / 2} y="15" fill="#010101" fillOpacity=".3">
            {label}
          </text>
          <text x={iconWidth + labelWidth / 2} y="14">
            {label}
          </text>
          <text
            x={iconWidth + labelWidth + valueWidth / 2}
            y="15"
            fill="#010101"
            fillOpacity=".3"
          >
            {value}
          </text>
          <text x={iconWidth + labelWidth + valueWidth / 2} y="14">
            {value}
          </text>
        </g>
      </svg>
    </div>
  );
}