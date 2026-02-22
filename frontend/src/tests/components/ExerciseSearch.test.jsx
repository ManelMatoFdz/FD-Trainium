import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { IntlProvider } from 'react-intl';

import ExerciseSearch from '../../modules/exercises/components/ExerciseSearch';
import es from '../../i18n/messages/messages_es';

describe('ExerciseSearch', () => {
  it('toggles filters panel and applies/clears filters', () => {
    const setFilters = jest.fn();
    const resetFilters = jest.fn();
    render(
      <IntlProvider locale="es" messages={es}>
        <ExerciseSearch
          filters={{ name: '', material: '', muscles: [] }}
          setFilters={setFilters}
          resetFilters={resetFilters}
        />
      </IntlProvider>
    );

    const trigger = screen.getByRole('button', { name: /Filtrar|Ocultar filtros/i });
    fireEvent.click(trigger); // expand

    const nameInput = screen.getByPlaceholderText(/Buscar por nombre/i);
    fireEvent.change(nameInput, { target: { value: 'press' } });

    const applyBtn = screen.getByRole('button', { name: /Aplicar/i });
    fireEvent.click(applyBtn);
    expect(setFilters).toHaveBeenCalled();

    const clearBtn = screen.getByRole('button', { name: /Limpiar/i });
    fireEvent.click(clearBtn);
    expect(resetFilters).toHaveBeenCalled();
  });

  it('renders name input field', () => {
    const setFilters = jest.fn();
    const resetFilters = jest.fn();
    render(
      <IntlProvider locale="es" messages={es}>
        <ExerciseSearch
          filters={{ name: '', material: '', muscles: [] }}
          setFilters={setFilters}
          resetFilters={resetFilters}
        />
      </IntlProvider>
    );

    const trigger = screen.getByRole('button', { name: /Filtrar/i });
    fireEvent.click(trigger);

    expect(screen.getByPlaceholderText(/Buscar por nombre/i)).toBeTruthy();
  });

  it('renders material input field', () => {
    const setFilters = jest.fn();
    const resetFilters = jest.fn();
    render(
      <IntlProvider locale="es" messages={es}>
        <ExerciseSearch
          filters={{ name: '', material: '', muscles: [] }}
          setFilters={setFilters}
          resetFilters={resetFilters}
        />
      </IntlProvider>
    );

    const trigger = screen.getByRole('button', { name: /Filtrar/i });
    fireEvent.click(trigger);

    expect(screen.getByPlaceholderText(/Material/i)).toBeTruthy();
  });

  it('allows changing material filter', () => {
    const setFilters = jest.fn();
    const resetFilters = jest.fn();
    render(
      <IntlProvider locale="es" messages={es}>
        <ExerciseSearch
          filters={{ name: '', material: '', muscles: [] }}
          setFilters={setFilters}
          resetFilters={resetFilters}
        />
      </IntlProvider>
    );

    const trigger = screen.getByRole('button', { name: /Filtrar/i });
    fireEvent.click(trigger);

    const materialInput = screen.getByPlaceholderText(/Material/i);
    fireEvent.change(materialInput, { target: { value: 'Barra' } });

    expect(materialInput.value).toBe('Barra');
  });

  it('toggles panel closed on second click', () => {
    const setFilters = jest.fn();
    const resetFilters = jest.fn();
    render(
      <IntlProvider locale="es" messages={es}>
        <ExerciseSearch
          filters={{ name: '', material: '', muscles: [] }}
          setFilters={setFilters}
          resetFilters={resetFilters}
        />
      </IntlProvider>
    );

    const trigger = screen.getByRole('button', { name: /Filtrar/i });
    fireEvent.click(trigger);
    expect(screen.getByPlaceholderText(/Buscar por nombre/i)).toBeTruthy();

    const closeBtn = screen.getByRole('button', { name: /Ocultar filtros/i });
    fireEvent.click(closeBtn);
    // The input may remain in the DOM but hidden/collapsed; assert filters panel is collapsed
    const panel = document.querySelector('.rs-filter-panel');
    expect(panel).toBeTruthy();
    expect(panel.classList.contains('collapsed')).toBe(true);
  });

  it('renders with right actions when provided', () => {
    const setFilters = jest.fn();
    const resetFilters = jest.fn();
    const rightActions = <button>Custom Action</button>;
    render(
      <IntlProvider locale="es" messages={es}>
        <ExerciseSearch
          filters={{ name: '', material: '', muscles: [] }}
          setFilters={setFilters}
          resetFilters={resetFilters}
          rightActions={rightActions}
        />
      </IntlProvider>
    );

    expect(screen.getByText('Custom Action')).toBeTruthy();
  });

  it('displays filters with initial values', () => {
    const setFilters = jest.fn();
    const resetFilters = jest.fn();
    render(
      <IntlProvider locale="es" messages={es}>
        <ExerciseSearch
          filters={{ name: 'Press', material: 'Barra', muscles: ['CHEST'] }}
          setFilters={setFilters}
          resetFilters={resetFilters}
        />
      </IntlProvider>
    );

    const trigger = screen.getByRole('button', { name: /Filtrar/i });
    fireEvent.click(trigger);

    expect(screen.getByDisplayValue('Press')).toBeTruthy();
    expect(screen.getByDisplayValue('Barra')).toBeTruthy();
  });
});

