import React from 'react';
import { render, screen } from '@testing-library/react';

import Avatar from '../../modules/common/components/Avatar';

// Avoid jdenticon side effects
jest.mock('jdenticon', () => ({ update: jest.fn() }));

describe('Avatar', () => {
  it('renders img when url is provided', () => {
    render(<Avatar url="https://example.com/a.png" alt="User avatar" size={64} />);
    const img = screen.getByAltText(/User avatar/i);
    expect(img.tagName).toBe('IMG');
    expect(img).toHaveAttribute('src', 'https://example.com/a.png');
    expect(img).toHaveAttribute('width', '64');
    expect(img).toHaveAttribute('height', '64');
  });

  it('renders svg with seed when no url', () => {
    render(<Avatar seed="alice" alt="Identicon" />);
    const svg = screen.getByLabelText(/Identicon/i);
    expect(svg.tagName.toLowerCase()).toBe('svg');
    expect(svg).toHaveAttribute('data-jdenticon-value', 'alice');
  });
});
