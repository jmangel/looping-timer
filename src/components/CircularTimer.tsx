import React from 'react';

interface CircularTimerProps {
  progress: number; // Progress from 0 to 1
  currentSeconds: number; // Current elapsed seconds in the cycle
  totalSeconds: number; // Total seconds in the cycle
}

/**
 * A responsive circular timer component that displays progress as a circular arc.
 * The timer fills its parent container while maintaining aspect ratio and not exceeding available height.
 *
 * @param progress - Progress value between 0 and 1
 * @param currentSeconds - Current elapsed seconds in the cycle
 * @param totalSeconds - Total seconds in the cycle
 */
const CircularTimer: React.FC<CircularTimerProps> = ({
  progress,
  currentSeconds,
  totalSeconds,
}) => {
  const viewBoxSize = 300; // Arbitrary reference size for viewBox
  const strokeWidth = 8;
  const radius = (viewBoxSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{
        height: '100%',
        width: '100%',
        minHeight: 0, // Allows container to shrink below content size
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          paddingBottom: '100%', // Forces 1:1 aspect ratio
          maxHeight: '100%',
        }}
      >
        <svg
          viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
          }}
          className="circular-timer"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Background circle */}
          <circle
            cx={viewBoxSize / 2}
            cy={viewBoxSize / 2}
            r={radius}
            fill="none"
            stroke="#e9ecef"
            strokeWidth={strokeWidth}
          />

          {/* Progress circle */}
          <circle
            cx={viewBoxSize / 2}
            cy={viewBoxSize / 2}
            r={radius}
            fill="none"
            stroke="#007bff"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform={`rotate(-90 ${viewBoxSize / 2} ${viewBoxSize / 2})`}
            style={{
              transition: 'stroke-dashoffset 0.1s ease-in-out',
            }}
          />

          {/* Center text showing current/total seconds */}
          <text
            x={viewBoxSize / 2}
            y={viewBoxSize / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={viewBoxSize / 12}
            fill="#495057"
            fontWeight="bold"
          >
            {Math.round(currentSeconds)} / {totalSeconds} secs
          </text>
        </svg>
      </div>
    </div>
  );
};

export default CircularTimer;
