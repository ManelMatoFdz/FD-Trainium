import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { IntlProvider } from 'react-intl';
import es from '../../i18n/messages/messages_es';

import UsersTable from '../../modules/routines/components/UsersTable';

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => jest.fn(), // solo verificar que no reviente al hacer click
  };
});

jest.mock('../../modules/common', () => ({
  Avatar: ({ seed }) => <div data-testid="avatar">{seed}</div>,
}));

describe('UsersTable', () => {
  it('renderiza usuarios y permite click en fila', () => {
    const list = [
      { id: 10, userName: 'alice', avatarSeed: 'a-seed' },
      { id: 11, userName: 'bob', avatarSeed: 'b-seed' },
    ];

    render(
      <IntlProvider locale="es" messages={es}>
        <MemoryRouter>
          <UsersTable list={list} />
        </MemoryRouter>
      </IntlProvider>
    );

    expect(screen.getAllByTestId('avatar')).toHaveLength(2);
    expect(screen.getByText(/alice/i)).toBeInTheDocument();
    expect(screen.getByText(/bob/i)).toBeInTheDocument();

    // Dispara el onClick de la fila (useNavigate está mockeado para no navegar)
    fireEvent.click(screen.getByText(/alice/i));
  });

  it('muestra estado vacio cuando no hay usuarios', () => {
    render(
      <IntlProvider locale="es" messages={es}>
        <MemoryRouter>
          <UsersTable list={[]} />
        </MemoryRouter>
      </IntlProvider>
    );

    expect(screen.getByText(/Ning/)).toBeInTheDocument();
  });
});
