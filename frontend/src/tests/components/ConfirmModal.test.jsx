import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

import ConfirmModal from '../../modules/common/components/ConfirmModal';

describe('ConfirmModal', () => {
  const defaultProps = {
    isOpen: true,
    title: 'Test Title',
    message: 'Test Message',
    onClose: jest.fn(),
    onConfirm: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders null when isOpen is false', () => {
    const { container } = render(
      <ConfirmModal {...defaultProps} isOpen={false} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders title and message when open', () => {
    const { container } = render(
      <ConfirmModal
        isOpen
        title="¿Eliminar?"
        message="Esta acción no se puede deshacer"
        onClose={() => {}}
        onConfirm={() => {}}
      />
    );
    // jsdom no reconoce completamente el elemento dialog, así que usamos querySelector
    const dialog = container.querySelector('dialog[aria-modal="true"]');
    expect(dialog).toBeTruthy();
    expect(screen.getByText(/¿Eliminar\?/i)).toBeTruthy();
    expect(screen.getByText(/no se puede deshacer/i)).toBeTruthy();
  });

  it('fires onConfirm and onClose', () => {
    const onClose = jest.fn();
    const onConfirm = jest.fn();
    const { container } = render(
      <ConfirmModal
        isOpen
        title="Confirmar"
        message="Mensaje"
        onClose={onClose}
        onConfirm={onConfirm}
        confirmText="Aceptar"
        cancelText="Cancelar"
      />
    );
    // Buscar los botones por texto ya que el overlay también tiene role="button"
    const allButtons = Array.from(container.querySelectorAll('button'));
    const cancelButton = allButtons.find(btn => btn.textContent.includes('Cancelar'));
    const confirmButton = allButtons.find(btn => btn.textContent.includes('Aceptar'));
    
    expect(cancelButton).toBeTruthy();
    expect(confirmButton).toBeTruthy();
    
    fireEvent.click(cancelButton);
    expect(onClose).toHaveBeenCalled();
    fireEvent.click(confirmButton);
    expect(onConfirm).toHaveBeenCalled();
  });

  it('calls onClose when backdrop is clicked', () => {
    const onClose = jest.fn();
    const { container } = render(
      <ConfirmModal {...defaultProps} onClose={onClose} />
    );
    
    const backdrop = screen.getByLabelText('Cerrar diálogo');
    expect(backdrop).toBeTruthy();
    fireEvent.click(backdrop);
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not close when clicking inside dialog content', () => {
    const onClose = jest.fn();
    const { container } = render(
      <ConfirmModal {...defaultProps} onClose={onClose} />
    );
    
    const dialogContent = container.querySelector('.confirm-modal__content');
    expect(dialogContent).toBeTruthy();
    fireEvent.click(dialogContent);
    
    expect(onClose).not.toHaveBeenCalled();
  });

  it('handles Escape key press', () => {
    const onClose = jest.fn();
    const { container } = render(
      <ConfirmModal {...defaultProps} onClose={onClose} />
    );
    
    const dialog = container.querySelector('dialog');
    fireEvent.keyDown(dialog, { key: 'Escape' });
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('handles Enter key on backdrop', () => {
    const onClose = jest.fn();
    const { container } = render(
      <ConfirmModal {...defaultProps} onClose={onClose} />
    );
    
    const backdrop = screen.getByLabelText('Cerrar diálogo');
    expect(backdrop).toBeTruthy();
    fireEvent.keyDown(backdrop, { key: 'Enter' });
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('applies correct variant classes', () => {
    const { container, rerender } = render(
      <ConfirmModal {...defaultProps} variant="danger" />
    );
    
    let icon = container.querySelector('.confirm-modal__icon--danger');
    expect(icon).toBeTruthy();

    rerender(<ConfirmModal {...defaultProps} variant="success" />);
    icon = container.querySelector('.confirm-modal__icon--success');
    expect(icon).toBeTruthy();
  });

  it('uses default button texts when not provided', () => {
    const { container } = render(
      <ConfirmModal {...defaultProps} />
    );
    
    const allButtons = Array.from(container.querySelectorAll('button'));
    const cancelButton = allButtons.find(btn => btn.textContent.includes('Cancelar'));
    const confirmButton = allButtons.find(btn => btn.textContent.includes('Confirmar'));
    
    expect(cancelButton).toBeTruthy();
    expect(confirmButton).toBeTruthy();
  });

  it('has correct accessibility attributes', () => {
    const { container } = render(
      <ConfirmModal {...defaultProps} />
    );
    
    const dialog = container.querySelector('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    
    const backdrop = screen.getByLabelText('Cerrar diálogo');
    expect(backdrop).toBeTruthy();
    expect(backdrop).toHaveAttribute('aria-label', 'Cerrar diálogo');
    expect(backdrop).toHaveAttribute('type', 'button');
  });
});

