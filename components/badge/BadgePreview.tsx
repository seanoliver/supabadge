interface BadgePreviewProps {
  label: string;
  value: string;
  color: string;
}

export function BadgePreview({ label, value, color }: BadgePreviewProps) {
  const labelWidth = label.length * 7 + 10;
  const valueWidth = value.length * 7 + 10;
  const totalWidth = labelWidth + valueWidth;

  return (
    <div className="flex justify-center rounded-lg border bg-gray-50 p-8">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={totalWidth}
        height="20"
        className="scale-150"
      >
        <linearGradient id="b" x2="0" y2="100%">
          <stop offset="0" stopColor="#bbb" stopOpacity=".1" />
          <stop offset="1" stopOpacity=".1" />
        </linearGradient>
        <mask id="a">
          <rect width={totalWidth} height="20" rx="3" fill="#fff" />
        </mask>
        <g mask="url(#a)">
          <rect width={labelWidth} height="20" fill="#555" />
          <rect x={labelWidth} width={valueWidth} height="20" fill={color} />
          <rect width={totalWidth} height="20" fill="url(#b)" />
        </g>
        <g
          fill="#fff"
          textAnchor="middle"
          fontFamily="DejaVu Sans,Verdana,Geneva,sans-serif"
          fontSize="11"
        >
          <text x={labelWidth / 2} y="15" fill="#010101" fillOpacity=".3">
            {label}
          </text>
          <text x={labelWidth / 2} y="14">
            {label}
          </text>
          <text
            x={labelWidth + valueWidth / 2}
            y="15"
            fill="#010101"
            fillOpacity=".3"
          >
            {value}
          </text>
          <text x={labelWidth + valueWidth / 2} y="14">
            {value}
          </text>
        </g>
      </svg>
    </div>
  );
}