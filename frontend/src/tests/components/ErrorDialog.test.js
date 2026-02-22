import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { IntlProvider } from 'react-intl';

import ErrorDialog from '../../modules/common/components/ErrorDialog';
import { NetworkError } from '../../backend';
import es from '../../i18n/messages/messages_es';

describe('ErrorDialog', () => {
  it('renders null when error is null', () => {
    const { container } = render(
      <IntlProvider locale="es" messages={es}>
        <ErrorDialog error={null} onClose={() => {}} />
      </IntlProvider>
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders message for generic error', () => {
    render(
      <IntlProvider locale="es" messages={es}>
        <ErrorDialog error={new Error('Algo fue mal')} onClose={() => {}} />
      </IntlProvider>
    );
    expect(screen.getByText(/Algo fue mal/i)).toBeTruthy();
  });

  it('renders "Network Error" for NetworkError', () => {
    render(
      <IntlProvider locale="es" messages={es}>
        <ErrorDialog error={new NetworkError()} onClose={() => {}} />
      </IntlProvider>
    );
    expect(screen.getByText(/Network Error/i)).toBeTruthy();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = jest.fn();
    render(
      <IntlProvider locale="es" messages={es}>
        <ErrorDialog error={new Error('Test error')} onClose={onClose} />
      </IntlProvider>
    );
    
    const closeButton = screen.getByRole('button', { name: /Cerrar/i });
    fireEvent.click(closeButton);
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when backdrop is clicked', () => {
    const onClose = jest.fn();
    const { container } = render(
      <IntlProvider locale="es" messages={es}>
        <ErrorDialog error={new Error('Test error')} onClose={onClose} />
      </IntlProvider>
    );
    
    const backdrop = screen.getByLabelText('Cerrar diálogo');
    fireEvent.click(backdrop);
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not close when clicking inside dialog content', () => {
    const onClose = jest.fn();
    const { container } = render(
      <IntlProvider locale="es" messages={es}>
        <ErrorDialog error={new Error('Test error')} onClose={onClose} />
      </IntlProvider>
    );
    
    const dialogContent = container.querySelector('.modal-content');
    fireEvent.click(dialogContent);
    
    expect(onClose).not.toHaveBeenCalled();
  });

  it('handles Escape key press', () => {
    const onClose = jest.fn();
    const { container } = render(
      <IntlProvider locale="es" messages={es}>
        <ErrorDialog error={new Error('Test error')} onClose={onClose} />
      </IntlProvider>
    );
    
    const dialog = container.querySelector('dialog');
    fireEvent.keyDown(dialog, { key: 'Escape', code: 'Escape' });
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('handles Enter key on backdrop', () => {
    const onClose = jest.fn();
    const { container } = render(
      <IntlProvider locale="es" messages={es}>
        <ErrorDialog error={new Error('Test error')} onClose={onClose} />
      </IntlProvider>
    );
    
    const backdrop = screen.getByLabelText('Cerrar diálogo');
    fireEvent.keyDown(backdrop, { key: 'Enter', code: 'Enter' });
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('has correct accessibility attributes', () => {
    const { container } = render(
      <IntlProvider locale="es" messages={es}>
        <ErrorDialog error={new Error('Test error')} onClose={() => {}} />
      </IntlProvider>
    );
    
    const dialog = container.querySelector('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'error-dialog-title');
    
    const backdrop = screen.getByLabelText('Cerrar diálogo');
    expect(backdrop).toHaveAttribute('aria-label', 'Cerrar diálogo');
    expect(backdrop).toHaveAttribute('type', 'button');
  });
});

