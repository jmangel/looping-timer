import React from 'react';
import { Form, InputGroup } from 'react-bootstrap';

interface TimerControlsProps {
  loopLength: number;
  onLoopLengthChange: (length: number) => void;
}

/**
 * Controls component for the timer that allows users to set the loop length.
 *
 * @param loopLength - Current loop length in seconds
 * @param onLoopLengthChange - Callback when loop length changes
 */
const TimerControls: React.FC<TimerControlsProps> = ({
  loopLength,
  onLoopLengthChange,
}) => {
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value, 10);
    if (!isNaN(value) && value > 0) {
      onLoopLengthChange(value);
    }
  };

  return (
    <div className="timer-controls p-3 bg-light border-bottom">
      <div className="d-flex justify-content-center align-items-center">
        <Form.Label
          htmlFor="loop-length-input"
          className="me-3 mb-0 fw-semibold"
        >
          Loop Length:
        </Form.Label>
        <InputGroup style={{ maxWidth: '200px' }}>
          <Form.Control
            id="loop-length-input"
            type="number"
            min="1"
            max="3600"
            value={loopLength}
            onChange={handleInputChange}
            className="text-center"
          />
          <InputGroup.Text>seconds</InputGroup.Text>
        </InputGroup>
      </div>
    </div>
  );
};

export default TimerControls;
