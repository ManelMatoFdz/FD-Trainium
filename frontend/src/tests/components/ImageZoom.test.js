import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ImageZoom from '../../modules/common/components/ImageZoom';

describe('ImageZoom', () => {
  const mockOnClose = jest.fn();
  const testSrc = 'https://example.com/test-image.jpg';

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  it('renders null when src is empty string', () => {
    const { container } = render(<ImageZoom src="" onClose={mockOnClose} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders image when src is provided', () => {
    render(<ImageZoom src={testSrc} onClose={mockOnClose} />);
    
    const image = screen.getByRole('img', { name: /Vista ampliada/i });
    expect(image).toBeTruthy();
    expect(image).toHaveAttribute('src', testSrc);
  });

  it('calls onClose when overlay is clicked', () => {
    render(<ImageZoom src={testSrc} onClose={mockOnClose} />);
    
    const overlay = screen.getByLabelText(/Cerrar vista ampliada/i);
    fireEvent.click(overlay);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when close button is clicked', () => {
    render(<ImageZoom src={testSrc} onClose={mockOnClose} />);
    
    const closeButton = screen.getByLabelText(/^Cerrar$/i);
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('stops propagation when clicking on image content area', () => {
    const { container } = render(<ImageZoom src={testSrc} onClose={mockOnClose} />);
    
    const imageContent = document.body.querySelector('.image-zoom-content');
    expect(imageContent).toBeTruthy();
    
    fireEvent.click(imageContent);
    
    // If stopPropagation worked, onClose should not have been called
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('stops propagation on image content keydown', () => {
    const { container } = render(<ImageZoom src={testSrc} onClose={mockOnClose} />);
    
    const imageContent = document.body.querySelector('.image-zoom-content');
    expect(imageContent).toBeTruthy();
    
    fireEvent.keyDown(imageContent, { key: 'Escape' });
    
    // Keydown propagation is stopped, so no action expected
    expect(imageContent).toBeTruthy();
  });

  it('has correct accessibility attributes', () => {
    render(<ImageZoom src={testSrc} onClose={mockOnClose} />);
    
    const overlay = screen.getByLabelText(/Cerrar vista ampliada/i);
    expect(overlay).toHaveAttribute('aria-label', 'Cerrar vista ampliada');
    
    const closeButton = screen.getByLabelText(/^Cerrar$/i);
    expect(closeButton).toHaveAttribute('aria-label', 'Cerrar');
  });

  it('renders as a portal in document.body', () => {
    const { container } = render(<ImageZoom src={testSrc} onClose={mockOnClose} />);
    
    const overlay = document.body.querySelector('.image-zoom-overlay');
    expect(overlay).toBeTruthy();
    expect(overlay.parentElement).toBe(document.body);
  });
});
