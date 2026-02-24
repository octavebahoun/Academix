<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 520 180"
  width="520"
  height="180"
>
  {/* Text: "Academi" in white and "x" in green */}
  {/* Using tspan avoids overlaps and lets the browser calculate the exact spacing */}
  <text
    x="20"
    y="130"
    fontFamily="Arial Black, Impact, sans-serif"
    fontWeight="900"
    fontSize="90"
    letterSpacing="-2"
  >
    <tspan fill="#ffffff">Academi</tspan>
    <tspan fill="#22c55e">x</tspan>
  </text>

  {/* Graduation cap positioned above the end of the text */}
  {/* We use transform="translate(45, 0)" to shift the cap to the right */}
  <g transform="translate(45, 0)">
    {/* Cap board (mortarboard flat top) */}
    <polygon points="365,28 415,44 365,60 315,44" fill="#1e1e1e" />
    {/* Cap board top surface */}
    <polygon points="365,30 412,44 365,58 318,44" fill="#2d2d2d" />

    {/* Cap head (cylindrical base) */}
    <ellipse cx="365" cy="57" rx="24" ry="9" fill="#111111" />
    <rect x="341" y="48" width="48" height="14" rx="2" fill="#111111" />

    {/* Tassel */}
    <line
      x1="411"
      y1="44"
      x2="411"
      y2="58"
      stroke="#22c55e"
      strokeWidth="2.5"
    />
    <rect x="406" y="58" width="10" height="7" rx="1.5" fill="#22c55e" />
    <line
      x1="407"
      y1="65"
      x2="405"
      y2="74"
      stroke="#22c55e"
      strokeWidth="1.8"
    />
    <line
      x1="411"
      y1="65"
      x2="411"
      y2="75"
      stroke="#22c55e"
      strokeWidth="1.8"
    />
    <line
      x1="415"
      y1="65"
      x2="417"
      y2="74"
      stroke="#22c55e"
      strokeWidth="1.8"
    />
  </g>
</svg>;
