import React from 'react';
import { render, screen } from '@testing-library/react';
import { IntlProvider } from 'react-intl';

import Pager from '../../modules/common/components/Pager';
import es from '../../i18n/messages/messages_es';

describe('Pager', () => {
  it('disables buttons when not enabled', () => {
    render(
      <IntlProvider locale="es" messages={es}>
        <Pager back={{ enabled: false, onClick: jest.fn() }} next={{ enabled: false, onClick: jest.fn() }} />
      </IntlProvider>
    );
    const back = screen.getByRole('button', { name: /Anterior/i });
    const next = screen.getByRole('button', { name: /Siguiente/i });
    expect(back.closest('li')).toHaveClass('disabled');
    expect(next.closest('li')).toHaveClass('disabled');
  });
});

