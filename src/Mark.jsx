// The small JobTrack logo: three stops on a route.
function Mark({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="#14213d" />
      <path
        d="M8 22 L16 10 L24 22"
        fill="none"
        stroke="#ffffff"
        strokeOpacity=".35"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="8" cy="22" r="3.2" fill="#3b6ff5" />
      <circle cx="16" cy="10" r="3.2" fill="#f2a100" />
      <circle cx="24" cy="22" r="3.2" fill="#1fa971" />
    </svg>
  );
}

export default Mark;
