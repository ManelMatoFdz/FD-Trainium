import React from 'react';
import { render, screen } from '@testing-library/react';

import Table from '../../modules/common/components/Table';

describe('Table', () => {
  const columns = [
    { key: 'id', header: 'ID', width: '80px' },
    { key: 'name', header: 'Nombre' },
  ];

  it('renders rows with data', () => {
    render(<Table columns={columns} data={[{ id: 1, name: 'Fila A' }]} />);
    expect(screen.getByText('ID')).toBeTruthy();
    expect(screen.getByText('Nombre')).toBeTruthy();
    expect(screen.getByText('Fila A')).toBeTruthy();
  });

  it('renders empty message when no data', () => {
    render(<Table columns={columns} data={[]} emptyMessage="Sin datos" />);
    expect(screen.getByText(/Sin datos/i)).toBeTruthy();
  });

  it('shows loading spinner when isLoading', () => {
    render(<Table columns={columns} data={[]} isLoading loadingMessage="Cargando..." />);
    expect(screen.getByRole('status', { name: /Cargando/i })).toBeTruthy();
  });
});

