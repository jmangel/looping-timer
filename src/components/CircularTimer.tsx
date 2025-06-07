import React from 'react';

interface CircularTimerProps {
  progress: number; // Progress from 0 to 1
  currentSeconds: number; // Current elapsed seconds in the cycle
  totalSeconds: number; // Total seconds in the cycle
  size?: number;
}

/**
 * A responsive circular timer component that displays progress as a circular arc.
 *
 * @param progress - Progress value between 0 and 1
 * @param currentSeconds - Current elapsed seconds in the cycle
 * @param totalSeconds - Total seconds in the cycle
 * @param size - Optional size of the timer (defaults to responsive sizing)
 */
const CircularTimer: React.FC<CircularTimerProps> = ({
  progress,
  currentSeconds,
  totalSeconds,
  size = 300,
}) => {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ height: '100%' }}
    >
      <svg
        width={size}
        height={size}
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          width: '100%',
          height: 'auto',
        }}
        className="circular-timer"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e9ecef"
          strokeWidth={strokeWidth}
        />

        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#007bff"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{
            transition: 'stroke-dashoffset 0.1s ease-in-out',
          }}
        />

        {/* Center text showing current/total seconds */}
        <text
          x={size / 2}
          y={size / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={size / 12}
          fill="#495057"
          fontWeight="bold"
        >
          {Math.round(currentSeconds)} / {totalSeconds} secs
        </text>
      </svg>
    </div>
  );
};

export default CircularTimer;
