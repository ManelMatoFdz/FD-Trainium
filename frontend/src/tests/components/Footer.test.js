import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import renderer from 'react-test-renderer';

import Footer from '../../modules/app/components/Footer';

describe('Footer', () => {
  afterEach(() => cleanup());

  it('renders default variant with separator and matches snapshot', () => {
    const tree = renderer.create(<Footer />).toJSON();
    expect(tree).toMatchSnapshot();

    render(<Footer />);
    // hr should be present (role separator)
    expect(screen.getByRole('separator')).toBeTruthy();
  });

  it('renders auth variant without separator', () => {
    render(<Footer auth={true} />);
    expect(screen.queryByRole('separator')).toBeNull();
    const wrapper = document.querySelector('.footer-auth');
    expect(wrapper).toBeTruthy();
  });
});

