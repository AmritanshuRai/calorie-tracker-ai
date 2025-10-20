export default function Logo({ className = '', variant = 'default' }) {
  // Variants: 'default', 'white', 'compact'
  const isWhite = variant === 'white';
  const isCompact = variant === 'compact';

  return (
    <svg
      className={className}
      viewBox='0 0 300 70'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'>
      <defs>
        {/* Modern gradient for icon */}
        <linearGradient
          id={`iconGrad-${variant}`}
          x1='0'
          y1='0'
          x2='60'
          y2='60'
          gradientUnits='userSpaceOnUse'>
          <stop offset='0%' stopColor={isWhite ? '#ffffff' : '#10b981'} />
          <stop offset='50%' stopColor={isWhite ? '#f0fdfa' : '#14b8a6'} />
          <stop offset='100%' stopColor={isWhite ? '#ccfbf1' : '#0d9488'} />
        </linearGradient>

        {/* Gradient for .food text */}
        <linearGradient
          id={`textGrad-${variant}`}
          x1='0%'
          y1='0%'
          x2='100%'
          y2='0%'>
          <stop offset='0%' stopColor={isWhite ? '#a7f3d0' : '#10b981'} />
          <stop offset='100%' stopColor={isWhite ? '#5eead4' : '#0d9488'} />
        </linearGradient>

        {/* Shadow filter for depth */}
        <filter id='iconShadow' x='-50%' y='-50%' width='200%' height='200%'>
          <feGaussianBlur in='SourceAlpha' stdDeviation='3' />
          <feOffset dx='0' dy='2' result='offsetblur' />
          <feComponentTransfer>
            <feFuncA type='linear' slope='0.3' />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode />
            <feMergeNode in='SourceGraphic' />
          </feMerge>
        </filter>
      </defs>

      {/* Modern Icon - Clean minimalist food icon */}
      <g filter='url(#iconShadow)'>
        {/* Background circle */}
        <circle
          cx='35'
          cy='35'
          r='28'
          fill={`url(#iconGrad-${variant})`}
          stroke={isWhite ? 'rgba(255,255,255,0.2)' : 'rgba(16,185,129,0.2)'}
          strokeWidth='2'
        />

        {/* Simple plate/bowl icon */}
        <g opacity='0.95'>
          {/* Bowl shape */}
          <path
            d='M 18 28 L 18 32 Q 18 42, 28 44 L 42 44 Q 52 42, 52 32 L 52 28 Z'
            fill='white'
            opacity='0.95'
          />

          {/* Spoon */}
          <g transform='translate(28, 20)'>
            <ellipse
              cx='2'
              cy='2'
              rx='3'
              ry='2.5'
              fill='white'
              opacity='0.95'
            />
            <rect
              x='1'
              y='3'
              width='2'
              height='12'
              rx='1'
              fill='white'
              opacity='0.95'
            />
          </g>

          {/* Fork */}
          <g transform='translate(36, 20)'>
            <rect
              x='0'
              y='0'
              width='1.5'
              height='12'
              rx='0.75'
              fill='white'
              opacity='0.95'
            />
            <rect
              x='3'
              y='0'
              width='1.5'
              height='12'
              rx='0.75'
              fill='white'
              opacity='0.95'
            />
            <rect
              x='6'
              y='0'
              width='1.5'
              height='12'
              rx='0.75'
              fill='white'
              opacity='0.95'
            />
            <rect
              x='0'
              y='10'
              width='7.5'
              height='4'
              rx='1.5'
              fill='white'
              opacity='0.95'
            />
          </g>
        </g>
      </g>

      {!isCompact && (
        <g>
          {/* trackall text - Range Rover style with wide spacing */}
          <text
            x='75'
            y='38'
            style={{
              fontFamily:
                "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
              fontSize: '26px',
              fontWeight: '700',
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              fill: isWhite ? '#ffffff' : '#0f172a',
            }}>
            TRACKALL
          </text>

          {/* .food text - Small with gradient, on next line */}
          <text
            x='75'
            y='54'
            style={{
              fontFamily:
                "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
              fontSize: '14px',
              fontWeight: '600',
              letterSpacing: '0.1em',
              fill: `url(#textGrad-${variant})`,
            }}>
            .food
          </text>
        </g>
      )}
    </svg>
  );
}

// Compact version - just icon with .food
export function LogoCompact({ className = '', variant = 'default' }) {
  const isWhite = variant === 'white';

  return (
    <svg
      className={className}
      viewBox='0 0 160 70'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'>
      <defs>
        <linearGradient
          id={`iconGradCompact-${variant}`}
          x1='0'
          y1='0'
          x2='60'
          y2='60'
          gradientUnits='userSpaceOnUse'>
          <stop offset='0%' stopColor={isWhite ? '#ffffff' : '#10b981'} />
          <stop offset='50%' stopColor={isWhite ? '#f0fdfa' : '#14b8a6'} />
          <stop offset='100%' stopColor={isWhite ? '#ccfbf1' : '#0d9488'} />
        </linearGradient>

        <linearGradient
          id={`textGradCompact-${variant}`}
          x1='0%'
          y1='0%'
          x2='100%'
          y2='0%'>
          <stop offset='0%' stopColor={isWhite ? '#a7f3d0' : '#10b981'} />
          <stop offset='100%' stopColor={isWhite ? '#5eead4' : '#0d9488'} />
        </linearGradient>

        <filter
          id='iconShadowCompact'
          x='-50%'
          y='-50%'
          width='200%'
          height='200%'>
          <feGaussianBlur in='SourceAlpha' stdDeviation='3' />
          <feOffset dx='0' dy='2' result='offsetblur' />
          <feComponentTransfer>
            <feFuncA type='linear' slope='0.3' />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode />
            <feMergeNode in='SourceGraphic' />
          </feMerge>
        </filter>
      </defs>

      {/* Icon */}
      <g filter='url(#iconShadowCompact)'>
        <circle
          cx='35'
          cy='35'
          r='28'
          fill={`url(#iconGradCompact-${variant})`}
          stroke={isWhite ? 'rgba(255,255,255,0.2)' : 'rgba(16,185,129,0.2)'}
          strokeWidth='2'
        />

        <g opacity='0.95'>
          <path
            d='M 18 28 L 18 32 Q 18 42, 28 44 L 42 44 Q 52 42, 52 32 L 52 28 Z'
            fill='white'
            opacity='0.95'
          />

          <g transform='translate(28, 20)'>
            <ellipse
              cx='2'
              cy='2'
              rx='3'
              ry='2.5'
              fill='white'
              opacity='0.95'
            />
            <rect
              x='1'
              y='3'
              width='2'
              height='12'
              rx='1'
              fill='white'
              opacity='0.95'
            />
          </g>

          <g transform='translate(36, 20)'>
            <rect
              x='0'
              y='0'
              width='1.5'
              height='12'
              rx='0.75'
              fill='white'
              opacity='0.95'
            />
            <rect
              x='3'
              y='0'
              width='1.5'
              height='12'
              rx='0.75'
              fill='white'
              opacity='0.95'
            />
            <rect
              x='6'
              y='0'
              width='1.5'
              height='12'
              rx='0.75'
              fill='white'
              opacity='0.95'
            />
            <rect
              x='0'
              y='10'
              width='7.5'
              height='4'
              rx='1.5'
              fill='white'
              opacity='0.95'
            />
          </g>
        </g>
      </g>

      {/* .food text */}
      <text
        x='78'
        y='45'
        style={{
          fontFamily:
            "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
          fontSize: '26px',
          fontWeight: '800',
          letterSpacing: '-0.03em',
          fill: `url(#textGradCompact-${variant})`,
        }}>
        .food
      </text>
    </svg>
  );
}

// Icon only version
export function LogoIcon({ className = '', variant = 'default' }) {
  const isWhite = variant === 'white';

  return (
    <svg
      className={className}
      viewBox='0 0 70 70'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'>
      <defs>
        <linearGradient
          id={`iconGradIcon-${variant}`}
          x1='0'
          y1='0'
          x2='70'
          y2='70'
          gradientUnits='userSpaceOnUse'>
          <stop offset='0%' stopColor={isWhite ? '#ffffff' : '#10b981'} />
          <stop offset='50%' stopColor={isWhite ? '#f0fdfa' : '#14b8a6'} />
          <stop offset='100%' stopColor={isWhite ? '#ccfbf1' : '#0d9488'} />
        </linearGradient>

        <filter
          id='iconShadowIcon'
          x='-50%'
          y='-50%'
          width='200%'
          height='200%'>
          <feGaussianBlur in='SourceAlpha' stdDeviation='3' />
          <feOffset dx='0' dy='2' result='offsetblur' />
          <feComponentTransfer>
            <feFuncA type='linear' slope='0.3' />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode />
            <feMergeNode in='SourceGraphic' />
          </feMerge>
        </filter>
      </defs>

      <g filter='url(#iconShadowIcon)'>
        {/* Background circle */}
        <circle
          cx='35'
          cy='35'
          r='28'
          fill={`url(#iconGradIcon-${variant})`}
          stroke={isWhite ? 'rgba(255,255,255,0.2)' : 'rgba(16,185,129,0.2)'}
          strokeWidth='2'
        />

        <g opacity='0.95'>
          <path
            d='M 18 28 L 18 32 Q 18 42, 28 44 L 42 44 Q 52 42, 52 32 L 52 28 Z'
            fill='white'
            opacity='0.95'
          />

          <g transform='translate(28, 20)'>
            <ellipse
              cx='2'
              cy='2'
              rx='3'
              ry='2.5'
              fill='white'
              opacity='0.95'
            />
            <rect
              x='1'
              y='3'
              width='2'
              height='12'
              rx='1'
              fill='white'
              opacity='0.95'
            />
          </g>

          <g transform='translate(36, 20)'>
            <rect
              x='0'
              y='0'
              width='1.5'
              height='12'
              rx='0.75'
              fill='white'
              opacity='0.95'
            />
            <rect
              x='3'
              y='0'
              width='1.5'
              height='12'
              rx='0.75'
              fill='white'
              opacity='0.95'
            />
            <rect
              x='6'
              y='0'
              width='1.5'
              height='12'
              rx='0.75'
              fill='white'
              opacity='0.95'
            />
            <rect
              x='0'
              y='10'
              width='7.5'
              height='4'
              rx='1.5'
              fill='white'
              opacity='0.95'
            />
          </g>
        </g>
      </g>
    </svg>
  );
}
