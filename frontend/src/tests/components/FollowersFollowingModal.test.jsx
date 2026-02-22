import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { IntlProvider } from 'react-intl';

import FollowersFollowingModal from '../../modules/users/components/FollowersFollowingModal';
import es from '../../i18n/messages/messages_es';

jest.mock('../../modules/routines/components/UsersTable', () => ({
  __esModule: true,
  default: ({ list }) => (
    <div data-testid="users-table">Tabla usuarios ({list.length})</div>
  ),
}));

describe('FollowersFollowingModal', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('shows loading spinner when loading=true', () => {
    render(
      <IntlProvider locale="es" messages={es}>
        <FollowersFollowingModal
          type="followers"
          users={[]}
          loading={true}
          onClose={jest.fn()}
          isOwnProfile={true}
        />
      </IntlProvider>
    );

    // Buscar el dialog por su aria-labelledby ya que jsdom no expone completamente el rol
    expect(screen.getByLabelText(/Seguidores/i)).toBeTruthy();
    // LoadingSpinner usa un elemento <output> con aria-label
    expect(screen.getByLabelText(/Cargando/i)).toBeTruthy();
  });

  it('renders empty message for own profile without followers', () => {
    render(
      <IntlProvider locale="es" messages={es}>
        <FollowersFollowingModal
          type="followers"
          users={[]}
          loading={false}
          onClose={jest.fn()}
          isOwnProfile={true}
        />
      </IntlProvider>
    );

    // Puede haber múltiples elementos con "Seguidores" (título y mensaje)
    const seguidoresElements = screen.getAllByText(/Seguidores/i);
    expect(seguidoresElements.length).toBeGreaterThan(0);
    expect(
      screen.getByText(/Aún no tienes seguidores\./i)
    ).toBeTruthy();
  });

  it('renders empty message for own profile without following', () => {
    render(
      <IntlProvider locale="es" messages={es}>
        <FollowersFollowingModal
          type="following"
          users={[]}
          loading={false}
          onClose={jest.fn()}
          isOwnProfile={true}
        />
      </IntlProvider>
    );

    expect(screen.getByText(/Aún no sigues a nadie\./i)).toBeTruthy();
  });

  it('renders empty message for other profile without followers', () => {
    render(
      <IntlProvider locale="es" messages={es}>
        <FollowersFollowingModal
          type="followers"
          users={[]}
          loading={false}
          onClose={jest.fn()}
          isOwnProfile={false}
        />
      </IntlProvider>
    );

    expect(screen.getByText(/Aún no tiene seguidores\./i)).toBeTruthy();
  });

  it('renders empty message for other profile without following', () => {
    render(
      <IntlProvider locale="es" messages={es}>
        <FollowersFollowingModal
          type="following"
          users={[]}
          loading={false}
          onClose={jest.fn()}
          isOwnProfile={false}
        />
      </IntlProvider>
    );

    expect(screen.getByText(/Aún no sigue a nadie\./i)).toBeTruthy();
  });

  it('renders UsersTable when users are provided', () => {
    const users = [
      { id: 1, userName: 'alice' },
      { id: 2, userName: 'bob' },
    ];

    render(
      <IntlProvider locale="es" messages={es}>
        <FollowersFollowingModal
          type="following"
          users={users}
          loading={false}
          onClose={jest.fn()}
          isOwnProfile={false}
        />
      </IntlProvider>
    );

    expect(screen.getByText(/Seguidos/i)).toBeTruthy();
    expect(screen.getByTestId('users-table')).toHaveTextContent(
      'Tabla usuarios (2)'
    );
  });

  it('shows correct title for followers type', () => {
    render(
      <IntlProvider locale="es" messages={es}>
        <FollowersFollowingModal
          type="followers"
          users={[]}
          loading={false}
          onClose={jest.fn()}
          isOwnProfile={true}
        />
      </IntlProvider>
    );

    // El título está en el header, puede haber múltiples elementos con "Seguidores"
    const titles = screen.getAllByText(/Seguidores/i);
    expect(titles.length).toBeGreaterThan(0);
  });

  it('shows correct title for following type', () => {
    render(
      <IntlProvider locale="es" messages={es}>
        <FollowersFollowingModal
          type="following"
          users={[]}
          loading={false}
          onClose={jest.fn()}
          isOwnProfile={true}
        />
      </IntlProvider>
    );

    expect(screen.getByText(/Seguidos/i)).toBeTruthy();
  });

  it('calls onClose after clicking close button', () => {
    const onClose = jest.fn();

    render(
      <IntlProvider locale="es" messages={es}>
        <FollowersFollowingModal
          type="followers"
          users={[]}
          loading={false}
          onClose={onClose}
          isOwnProfile={true}
        />
      </IntlProvider>
    );

    // Buscar el botón por su texto ya que el dialog puede no estar completamente accesible en jsdom
    const closeBtn = screen.getByText(/Cerrar/i).closest('button');
    act(() => {
      fireEvent.click(closeBtn);
    });

    act(() => {
      jest.advanceTimersByTime(250);
    });

    expect(onClose).toHaveBeenCalled();
  });

  it('opens modal with base class on mount (no animation)', () => {
    render(
      <IntlProvider locale="es" messages={es}>
        <FollowersFollowingModal
          type="followers"
          users={[]}
          loading={false}
          onClose={jest.fn()}
          isOwnProfile={true}
        />
      </IntlProvider>
    );

    const modal = screen.getByLabelText(/Seguidores/i);
    const popup = modal.querySelector('.saved-users-popup') || modal;
    expect(popup).toHaveClass('saved-users-popup');
  });

  it('handles empty users array', () => {
    render(
      <IntlProvider locale="es" messages={es}>
        <FollowersFollowingModal
          type="followers"
          users={[]}
          loading={false}
          onClose={jest.fn()}
          isOwnProfile={true}
        />
      </IntlProvider>
    );

    expect(screen.getByText(/Aún no tienes seguidores\./i)).toBeTruthy();
    expect(screen.queryByTestId('users-table')).toBeNull();
  });

  it('handles null users prop', () => {
    render(
      <IntlProvider locale="es" messages={es}>
        <FollowersFollowingModal
          type="followers"
          users={null}
          loading={false}
          onClose={jest.fn()}
          isOwnProfile={true}
        />
      </IntlProvider>
    );

    expect(screen.getByText(/Aún no tienes seguidores\./i)).toBeTruthy();
  });
});
