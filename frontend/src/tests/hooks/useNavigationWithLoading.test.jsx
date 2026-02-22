import React from 'react';
import { render, act } from '@testing-library/react';

import useNavigationWithLoading from '../../modules/common/hooks/useNavigationWithLoading';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  // No necesitamos el router real en este test
  useNavigate: () => mockNavigate,
}));

function HookHarness() {
  const { navigateWithLoading, isLoading, loadingMessage } = useNavigationWithLoading();

  // Exponer el estado actual en el DOM para facilitar las aserciones
  return (
    <div>
      <button
        type="button"
        onClick={() => navigateWithLoading('/destino', 'Cargando destino')}
      >
        trigger
      </button>
      <span data-testid="loading-flag">{isLoading ? '1' : '0'}</span>
      <span data-testid="loading-message">{loadingMessage}</span>
    </div>
  );
}

describe('useNavigationWithLoading', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
  });

  it('navega inmediatamente al hacer click', () => {
    const { getByText, getByTestId } = render(<HookHarness />);

    expect(getByTestId('loading-flag').textContent).toBe('0');

    act(() => {
      getByText('trigger').click();
    });

    // La navegación es sincrónica, se ejecuta inmediatamente
    expect(mockNavigate).toHaveBeenCalledWith('/destino');
    expect(getByTestId('loading-flag').textContent).toBe('0');
  });
});

