import { useId, type SVGProps } from "react"

export function ResolveMark(props: SVGProps<SVGSVGElement>) {
  const id = useId().replaceAll(":", "")
  const gradientId = `${id}-resolve-gradient`
  const glowId = `${id}-resolve-glow`

  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 64 64" {...props}>
      <defs>
        <linearGradient id={gradientId} x1="10" x2="54" y1="8" y2="56" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2563EB" />
          <stop offset="0.52" stopColor="#06B6D4" />
          <stop offset="1" stopColor="#10B981" />
        </linearGradient>
        <filter id={glowId} colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" x="3" y="3" width="58" height="58">
          <feGaussianBlur stdDeviation="3.2" />
        </filter>
      </defs>
      <path
        d="M32 7.5 52.8 18.9v21.5L32 56.5 11.2 40.4V18.9L32 7.5Z"
        fill={`url(#${gradientId})`}
        opacity="0.24"
        filter={`url(#${glowId})`}
      />
      <path
        d="M32 6.5 53.8 18.5v22.8L32 57.5 10.2 41.3V18.5L32 6.5Z"
        fill={`url(#${gradientId})`}
      />
      <path
        d="M21.4 22.1c0-3.1 2.5-5.6 5.6-5.6h10c3.1 0 5.6 2.5 5.6 5.6v8.2c0 3.1-2.5 5.6-5.6 5.6h-4.1l-6.2 5.6v-5.6c-3 0-5.3-2.4-5.3-5.4v-8.4Z"
        fill="white"
        opacity="0.95"
      />
      <path
        d="M26.2 24.2h11.6M26.2 29.1h7.1"
        stroke="#0F172A"
        strokeLinecap="round"
        strokeWidth="2.5"
      />
      <path
        d="M42.4 36.3c0 5.2-3.8 9.5-8.9 10.2-5.1-.7-8.9-5-8.9-10.2v-1.2h2.9v1.2c0 3.5 2.5 6.4 6 7 3.5-.6 6-3.5 6-7v-1.2h2.9v1.2Z"
        fill="#0F172A"
        opacity="0.9"
      />
      <circle cx="44.5" cy="20.2" r="2.7" fill="#ECFEFF" />
      <circle cx="18.8" cy="40.5" r="2.2" fill="#D1FAE5" />
    </svg>
  )
}
