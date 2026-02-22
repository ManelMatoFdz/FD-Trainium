import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { IntlProvider } from 'react-intl';
import { useNavigate } from 'react-router-dom';

import BackLink from '../../modules/common/components/BackLink';
import es from '../../i18n/messages/messages_es';

// Mock de useNavigate
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn()
}));

describe('BackLink', () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    useNavigate.mockReturnValue(mockNavigate);
    mockNavigate.mockClear();
  });

  it('renders a button with translated label', () => {
    render(
      <IntlProvider locale="es" messages={es}>
        <MemoryRouter>
          <BackLink />
        </MemoryRouter>
      </IntlProvider>
    );
    expect(screen.getByRole('button', { name: /Volver/i })).toBeTruthy();
  });

  it('navigates back when clicked', () => {
    render(
      <IntlProvider locale="es" messages={es}>
        <MemoryRouter>
          <BackLink />
        </MemoryRouter>
      </IntlProvider>
    );
    
    const backButton = screen.getByRole('button', { name: /Volver/i });
    fireEvent.click(backButton);
    
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it('has correct CSS class', () => {
    render(
      <IntlProvider locale="es" messages={es}>
        <MemoryRouter>
          <BackLink />
        </MemoryRouter>
      </IntlProvider>
    );
    
    const backButton = screen.getByRole('button', { name: /Volver/i });
    expect(backButton.className).toContain('btn');
    expect(backButton.className).toContain('btn-link');
  });
});

