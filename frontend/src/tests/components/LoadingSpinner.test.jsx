import React from 'react';
import { render, screen } from '@testing-library/react';

import LoadingSpinner from '../../modules/common/components/LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders with message and output element', () => {
    const { container } = render(<LoadingSpinner message="Cargando datos" overlay={false} />);
    const output = container.querySelector('output[aria-label*="Cargando datos"]');
    expect(output).toBeTruthy();
    expect(screen.getByText(/Cargando datos/i)).toBeTruthy();
  });
});

