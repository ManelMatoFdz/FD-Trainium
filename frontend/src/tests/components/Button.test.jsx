import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import Button from '../../modules/common/components/Button';

describe('Button', () => {
  it('renders as native button by default', () => {
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Guardar</Button>);
    const btn = screen.getByRole('button', { name: /Guardar/i });
    expect(btn).toBeTruthy();
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalled();
  });

  it('renders as Link when `to` is provided', () => {
    render(
      <MemoryRouter>
        <Button to="/routines/new">Nueva</Button>
      </MemoryRouter>
    );
    const link = screen.getByRole('link', { name: /Nueva/i });
    expect(link).toHaveAttribute('href', '/routines/new');
  });

  it('renders as anchor when `href` is provided', () => {
    render(<Button href="https://example.com">Web</Button>);
    const a = screen.getByRole('link', { name: /Web/i });
    expect(a).toHaveAttribute('href', 'https://example.com');
  });

  it('shows heroicon when icon is provided (left)', () => {
    render(<Button icon="fa-plus">Crear</Button>);
    // Heroicons render as SVG; ensure icon element exists
    const icon = document.querySelector('.trainium-btn__icon');
    expect(icon).toBeTruthy();
    expect(screen.getByText('Crear')).toBeTruthy();
  });

  it('supports iconOnly with aria-label', () => {
    render(<Button icon="fa-plus" iconOnly ariaLabel="Añadir">Añadir</Button>);
    const btn = screen.getByRole('button', { name: /Añadir/i });
    expect(btn).toBeTruthy();
  });
});

