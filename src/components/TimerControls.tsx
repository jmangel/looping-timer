import React from 'react';
import { Form, InputGroup, Row, Col } from 'react-bootstrap';

interface TimerControlsProps {
  loopLength: number;
  onLoopLengthChange: (length: number) => void;
  isMuted: boolean;
  onMuteChange: (muted: boolean) => void;
  useSpeech: boolean;
  onSpeechChange: (useSpeech: boolean) => void;
}

/**
 * Controls component for the timer that allows users to configure timer settings.
 *
 * @param loopLength - Current loop length in seconds
 * @param onLoopLengthChange - Callback when loop length changes
 * @param isMuted - Whether audio is muted
 * @param onMuteChange - Callback when mute state changes
 * @param useSpeech - Whether to use speech instead of tick sound
 * @param onSpeechChange - Callback when speech mode changes
 */
const TimerControls: React.FC<TimerControlsProps> = ({
  loopLength,
  onLoopLengthChange,
  isMuted,
  onMuteChange,
  useSpeech,
  onSpeechChange,
}) => {
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value, 10);
    if (!isNaN(value) && value > 0) {
      onLoopLengthChange(value);
    }
  };

  const handleMuteChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onMuteChange(event.target.checked);
  };

  const handleSpeechChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSpeechChange(event.target.checked);
  };

  return (
    <div className="timer-controls p-3 bg-light border-bottom">
      <Row className="g-3 align-items-center justify-content-center">
        {/* Loop Length Control */}
        <Col xs="auto">
          <div className="d-flex align-items-center">
            <Form.Label
              htmlFor="loop-length-input"
              className="me-2 mb-0 fw-semibold"
            >
              Loop Length:
            </Form.Label>
            <InputGroup style={{ maxWidth: '150px' }}>
              <Form.Control
                id="loop-length-input"
                type="number"
                min="1"
                max="3600"
                value={loopLength}
                onChange={handleInputChange}
                className="text-center"
                size="sm"
              />
              <InputGroup.Text>sec</InputGroup.Text>
            </InputGroup>
          </div>
        </Col>

        {/* Mute Control */}
        <Col xs="auto">
          <Form.Check
            type="switch"
            id="mute-switch"
            label="Mute"
            checked={isMuted}
            onChange={handleMuteChange}
            className="fw-semibold"
          />
        </Col>

        {/* Speech/Tick Toggle */}
        <Col xs="auto">
          <Form.Check
            type="switch"
            id="speech-switch"
            label="Speak Numbers"
            checked={useSpeech}
            onChange={handleSpeechChange}
            disabled={isMuted}
            className="fw-semibold"
          />
        </Col>
      </Row>
    </div>
  );
};

export default TimerControls;
