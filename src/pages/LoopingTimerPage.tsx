import React, { useState } from 'react';
import { Container, Alert } from 'react-bootstrap';
import CircularTimer from '../components/CircularTimer';
import TimerControls from '../components/TimerControls';
import { useTimer } from '../hooks/useTimer';
import { useTickSound } from '../hooks/useTickSound';
import { useBackgroundExecution } from '../hooks/useBackgroundExecution';

/**
 * LoopingTimerPage component that displays a looping circular timer.
 * The timer starts when the page loads and loops continuously based on the configured loop length.
 * Enhanced with background execution capabilities for uninterrupted operation.
 */
const LoopingTimerPage: React.FC = () => {
  const [loopLengthInSeconds, setLoopLengthInSeconds] = useState(30);
  const [tickInterval, setTickInterval] = useState(5);
  const [isMuted, setIsMuted] = useState(false);
  const [useSpeech, setUseSpeech] = useState(false);
  const [showPermissionAlert, setShowPermissionAlert] = useState(true);

  const { progress, timeRemaining, cyclePosition } =
    useTimer(loopLengthInSeconds);

  const backgroundExecution = useBackgroundExecution();

  // Play tick sound every interval with current settings - using cyclePosition (current seconds)
  useTickSound(cyclePosition, { isMuted, useSpeech, tickInterval });

  const handlePermissionRequest = async () => {
    await backgroundExecution.requestBackgroundPermissions();
    await backgroundExecution.resumeAudioContext();
    setShowPermissionAlert(false);
  };

  return (
    <div
      className="looping-timer-page d-flex flex-column flex-grow-1"
      style={{
        overflow: 'hidden',
      }}
    >
      {/* Background Permission Alert */}
      {showPermissionAlert &&
        backgroundExecution.hasUserInteracted &&
        !backgroundExecution.audioPermissionGranted && (
          <Alert
            variant="info"
            dismissible
            onClose={() => setShowPermissionAlert(false)}
          >
            <Alert.Heading>Enable Background Audio</Alert.Heading>
            <p>
              To ensure timer audio continues when this tab is in the
              background, please click "Allow Background Audio" below. This will
              request necessary permissions for uninterrupted timer operation.
            </p>
            <div className="d-flex gap-2">
              <button
                className="btn btn-primary btn-sm"
                onClick={handlePermissionRequest}
              >
                Allow Background Audio
              </button>
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={() => setShowPermissionAlert(false)}
              >
                Maybe Later
              </button>
            </div>
          </Alert>
        )}

      {/* Status indicator for background execution */}
      {!backgroundExecution.isVisible && (
        <div
          className="bg-warning text-dark px-3 py-1 text-center small"
          style={{ fontSize: '0.875rem' }}
        >
          ⏰ Timer running in background
          {backgroundExecution.audioPermissionGranted
            ? ' with audio enabled'
            : ' (audio may be limited)'}
        </div>
      )}

      {/* Controls section - always visible */}
      <TimerControls
        loopLength={loopLengthInSeconds}
        onLoopLengthChange={setLoopLengthInSeconds}
        tickInterval={tickInterval}
        onTickIntervalChange={setTickInterval}
        isMuted={isMuted}
        onMuteChange={setIsMuted}
        useSpeech={useSpeech}
        onSpeechChange={setUseSpeech}
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

              {/* Background execution status */}
              <div className="mt-2 small text-muted">
                {backgroundExecution.supportsBackgroundExecution ? (
                  <span className="text-success">
                    ✓ Background execution supported
                  </span>
                ) : (
                  <span className="text-warning">
                    ⚠ Limited background support
                  </span>
                )}
              </div>
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
};

export default LoopingTimerPage;
