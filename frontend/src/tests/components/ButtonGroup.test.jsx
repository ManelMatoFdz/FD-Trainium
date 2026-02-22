import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

import ButtonGroup from '../../modules/common/components/ButtonGroup';

describe('ButtonGroup', () => {
  it('renders primary actions', () => {
    render(
      <ButtonGroup
        primaryActions={[
          { label: 'Acción A', icon: 'fa-plus' },
          { label: 'Acción B' },
        ]}
      />
    );
    expect(screen.getByRole('button', { name: /Acción A/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Acción B/i })).toBeTruthy();
  });

  it('opens dropdown and triggers dropdown action', () => {
    const onExtra = jest.fn();
    render(
      <ButtonGroup
        primaryActions={[{ label: 'Primaria' }]}
        dropdownActions={[{ label: 'Extra', onClick: onExtra }]}
        dropdownLabel="Más acciones"
      />
    );
    const trigger = screen.getByRole('button', { name: /Más acciones/i });
    fireEvent.click(trigger);
    const extra = screen.getByRole('button', { name: /Extra/i });
    fireEvent.click(extra);
    expect(onExtra).toHaveBeenCalled();
  });
});

