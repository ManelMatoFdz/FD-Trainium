import React from 'react';
import { IntlProvider, useIntl } from 'react-intl';
import { render, screen } from '@testing-library/react';
import { translateMuscle } from '../../modules/common/components/muscleTranslations';
import es from '../../i18n/messages/messages_es';

function Harness({ muscle, testId }) {
  const intl = useIntl();
  return <div data-testid={testId}>{translateMuscle(muscle, intl)}</div>;
}

describe('muscleTranslations.translateMuscle', () => {
  it('returns localized label for known muscle', () => {
    render(
      <IntlProvider locale="es" messages={es}>
        <Harness muscle="CHEST" testId="muscle-text" />
      </IntlProvider>
    );
    const el = screen.getByTestId('muscle-text');
    expect(el.textContent).toBeTruthy();
  });

  it('returns original when unknown', () => {
    render(
      <IntlProvider locale="es" messages={es}>
        <Harness muscle="UNKNOWN" testId="muscle-text" />
      </IntlProvider>
    );
    expect(screen.getByTestId('muscle-text').textContent).toBe('UNKNOWN');
  });
});
