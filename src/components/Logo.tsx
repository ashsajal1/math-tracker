export default function Logo({ className = '' }: { className?: string }) {
  return (
    <svg
      width="1080"
      height="1080"
      viewBox="0 0 1080 1080"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} transition-all duration-300`}
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#9333ea" />
          <stop offset="100%" stopColor="#4f46e5" />
        </linearGradient>
      </defs>
      
      {/* Main M Symbol */}
      <path
        d="M200 300L400 700L600 300L800 700L1000 300"
        stroke="url(#logoGradient)"
        strokeWidth="80"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Mathematical Plus Symbol */}
      <path
        d="M540 500V700M440 600H640"
        stroke="url(#logoGradient)"
        strokeWidth="60"
        strokeLinecap="round"
      />
      
      {/* Circle Highlight */}
      <circle
        cx="540"
        cy="600"
        r="120"
        fill="none"
        stroke="url(#logoGradient)"
        strokeWidth="10"
        strokeDasharray="0.1 20"
        className="opacity-70"
      />
    </svg>
  );
}
