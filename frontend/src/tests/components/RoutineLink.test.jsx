import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import RoutineLink from '../../modules/common/components/RoutineLink';

describe('RoutineLink (ProductLink)', () => {
  it('renders link to catalog/products/:id with name', () => {
    render(
      <MemoryRouter>
        <RoutineLink id={42} name="Plan Pecho" />
      </MemoryRouter>
    );
    const link = screen.getByRole('link', { name: /Plan Pecho/i });
    expect(link).toHaveAttribute('href', '/catalog/products/42');
  });
});

