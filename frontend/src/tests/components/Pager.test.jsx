import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import Pager from '../../modules/common/components/Pager';
import es from '../../i18n/messages/messages_es';

describe('Pager', () => {
  const mockBackClick = jest.fn();
  const mockNextClick = jest.fn();

  beforeEach(() => {
    mockBackClick.mockClear();
    mockNextClick.mockClear();
  });

  const renderPager = (backEnabled = true, nextEnabled = true) => {
    return render(
      <IntlProvider locale="es" messages={es}>
        <Pager
          back={{ enabled: backEnabled, onClick: mockBackClick }}
          next={{ enabled: nextEnabled, onClick: mockNextClick }}
        />
      </IntlProvider>
    );
  };

  it('renders back and next buttons', () => {
    renderPager();
    
    expect(screen.getByText(/Anterior/i)).toBeTruthy();
    expect(screen.getByText(/Siguiente/i)).toBeTruthy();
  });

  it('calls onClick when back button is clicked and enabled', () => {
    renderPager(true, true);
    
    const backButton = screen.getByText(/Anterior/i);
    fireEvent.click(backButton);
    
    expect(mockBackClick).toHaveBeenCalledTimes(1);
  });

  it('calls onClick when next button is clicked and enabled', () => {
    renderPager(true, true);
    
    const nextButton = screen.getByText(/Siguiente/i);
    fireEvent.click(nextButton);
    
    expect(mockNextClick).toHaveBeenCalledTimes(1);
  });

  it('applies disabled class when back is disabled', () => {
    const { container } = renderPager(false, true);
    
    const backItem = container.querySelector('.page-item');
    expect(backItem.className).toContain('disabled');
  });

  it('applies disabled class when next is disabled', () => {
    const { container } = renderPager(true, false);
    
    const pageItems = container.querySelectorAll('.page-item');
    const nextItem = pageItems[1];
    expect(nextItem.className).toContain('disabled');
  });

  it('does not apply disabled class when both are enabled', () => {
    const { container } = renderPager(true, true);
    
    const pageItems = container.querySelectorAll('.page-item');
    pageItems.forEach(item => {
      expect(item.className).not.toContain('disabled');
    });
  });

  it('has correct navigation aria-label', () => {
    renderPager();
    
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveAttribute('aria-label', 'page navigation');
  });

  it('renders with pagination classes', () => {
    const { container } = renderPager();
    
    const pagination = container.querySelector('.pagination');
    expect(pagination).toBeTruthy();
    expect(pagination.className).toContain('justify-content-center');
  });
});
