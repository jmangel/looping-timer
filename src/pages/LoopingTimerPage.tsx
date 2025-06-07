import React, { useState } from 'react';
import { Container } from 'react-bootstrap';
import CircularTimer from '../components/CircularTimer';
import TimerControls from '../components/TimerControls';
import { useTimer } from '../hooks/useTimer';
import { useTickSound } from '../hooks/useTickSound';

/**
 * LoopingTimerPage component that displays a looping circular timer.
 * The timer starts when the page loads and loops continuously based on the configured loop length.
 */
const LoopingTimerPage: React.FC = () => {
  const [loopLengthInSeconds, setLoopLengthInSeconds] = useState(30);
  const { progress, timeRemaining, cyclePosition } =
    useTimer(loopLengthInSeconds);

  // Play tick sound every second
  useTickSound(timeRemaining);

  return (
    <div
      className="looping-timer-page d-flex flex-column flex-grow-1"
      style={{
        overflow: 'hidden',
      }}
    >
      {/* Controls section - always visible */}
      <TimerControls
        loopLength={loopLengthInSeconds}
        onLoopLengthChange={setLoopLengthInSeconds}
      />

      {/* Main timer area - responsive and centered */}
      <div
        className="timer-display-area flex-grow-1 d-flex align-items-center justify-content-center"
        style={{
          minHeight: 0, // Allow flex shrinking
          padding: '5px 10px 15px 10px', // Minimal top padding, more bottom for text
          overflow: 'hidden',
        }}
      >
        <Container className="h-100 d-flex flex-column flex-grow-1 align-items-center justify-content-center">
          <div className="text-center w-100 h-100 d-flex flex-column flex-grow-1 justify-content-center">
            {/* Timer container with conservative sizing to leave room for text */}
            <div
              className="d-flex flex-grow-1 align-items-center justify-content-center"
              style={{
                maxWidth: '100%',
                aspectRatio: '1',
                alignSelf: 'center',
                flexShrink: 1,
              }}
            >
              <CircularTimer
                progress={progress}
                currentSeconds={cyclePosition}
                totalSeconds={loopLengthInSeconds}
              />
            </div>

            {/* Info display below timer - guaranteed space */}
            <div className="mt-3 flex-shrink-0">
              <h4 className="text-muted mb-1" style={{ fontSize: '0.9rem' }}>
                Time Remaining
              </h4>
              <h2 className="text-primary" style={{ fontSize: '1.5rem' }}>
                {Math.ceil(timeRemaining).toFixed(0)}s
              </h2>
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
};

export default LoopingTimerPage;
