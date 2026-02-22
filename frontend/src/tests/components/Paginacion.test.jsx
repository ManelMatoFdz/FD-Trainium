import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { IntlProvider } from 'react-intl';

import Paginacion from '../../modules/common/components/Paginacion';
import es from '../../i18n/messages/messages_es';

describe('Paginacion', () => {
  it('shows only Next when page=0 and existMoreItems', () => {
    const setPage = jest.fn();
    render(
      <IntlProvider locale="es" messages={es}>
        <Paginacion page={0} existMoreItems={true} setPage={setPage} />
      </IntlProvider>
    );
    expect(screen.queryByRole('button', { name: /Anterior/i })).toBeNull();
    const next = screen.getByRole('button', { name: /Siguiente/i });
    fireEvent.click(next);
    expect(setPage).toHaveBeenCalled();
  });

  it('shows only Previous when page>0 and no more items', () => {
    const setPage = jest.fn();
    render(
      <IntlProvider locale="es" messages={es}>
        <Paginacion page={2} existMoreItems={false} setPage={setPage} />
      </IntlProvider>
    );
    const prev = screen.getByRole('button', { name: /Anterior/i });
    expect(prev).toBeTruthy();
    expect(screen.queryByRole('button', { name: /Siguiente/i })).toBeNull();
    fireEvent.click(prev);
    expect(setPage).toHaveBeenCalled();
  });

  it('shows Previous and Next when page>0 and existMoreItems', () => {
    const setPage = jest.fn();
    render(
      <IntlProvider locale="es" messages={es}>
        <Paginacion page={1} existMoreItems={true} setPage={setPage} />
      </IntlProvider>
    );

    expect(screen.getByRole('button', { name: /Anterior/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Siguiente/i })).toBeTruthy();
  });
});

