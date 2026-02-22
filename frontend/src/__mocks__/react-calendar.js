import React from 'react';

// Mock simple de react-calendar para Jest
const Calendar = ({ onChange, value, tileContent, tileClassName, locale, ...props }) => {
  const sampleDate = new Date('2025-01-15T00:00:00.000Z');
  const sampleView = 'month';
  const renderedTileContent = tileContent ? tileContent({ date: sampleDate, view: sampleView }) : null;
  const renderedTileClass = tileClassName ? tileClassName({ date: sampleDate, view: sampleView }) : null;

  return (
    <div
      data-testid="mock-calendar"
      data-locale={locale}
      data-tile-class={renderedTileClass || ''}
      className="react-calendar"
      {...props}
    >
      <div>Mock Calendar Component</div>
      <button
        type="button"
        data-testid="mock-calendar-change"
        onClick={() => onChange && onChange(sampleDate)}
      >
        change
      </button>
      {renderedTileContent ? <div data-testid="mock-tile-content">{renderedTileContent}</div> : null}
      {value && <div>Selected: {value.toISOString ? value.toISOString() : value}</div>}
    </div>
  );
};

export default Calendar;
