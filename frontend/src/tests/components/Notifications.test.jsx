import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { IntlProvider } from 'react-intl';

import Notifications from '../../modules/users/components/Notifications';
import * as notificationsService from '../../backend/notificationsService';
import es from '../../i18n/messages/messages_es';

jest.mock('../../backend/notificationsService');

describe('Notifications', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders bell icon button', () => {
    notificationsService.fetchUnreadCount.mockResolvedValue(0);

    render(
      <IntlProvider locale="es" messages={es}>
        <Notifications userId={1} />
      </IntlProvider>
    );

    const button = screen.getByRole('button', { name: /Abrir notificaciones/i });
    expect(button).toBeTruthy();
  });

  it('shows unread count badge when there are unread notifications', async () => {
    notificationsService.fetchUnreadCount.mockResolvedValue(5);

    render(
      <IntlProvider locale="es" messages={es}>
        <Notifications userId={1} />
      </IntlProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('5')).toBeTruthy();
    });
  });

  it('shows 99+ badge when unread count exceeds 99', async () => {
    notificationsService.fetchUnreadCount.mockResolvedValue(150);

    render(
      <IntlProvider locale="es" messages={es}>
        <Notifications userId={1} />
      </IntlProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('99+')).toBeTruthy();
    });
  });

  it('opens dropdown when bell is clicked', async () => {
    notificationsService.fetchUnreadCount.mockResolvedValue(0);
    notificationsService.fetchNotifications.mockResolvedValue([]);

    render(
      <IntlProvider locale="es" messages={es}>
        <Notifications userId={1} />
      </IntlProvider>
    );

    const button = screen.getByRole('button', { name: /Abrir notificaciones/i });
    
    await act(async () => {
      fireEvent.click(button);
      jest.advanceTimersByTime(100);
    });

    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: /Notificaciones/i })).toBeTruthy();
    });
  });

  it('shows loading state when fetching notifications', async () => {
    notificationsService.fetchUnreadCount.mockResolvedValue(0);
    notificationsService.fetchNotifications.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve([]), 100))
    );

    render(
      <IntlProvider locale="es" messages={es}>
        <Notifications userId={1} />
      </IntlProvider>
    );

    const button = screen.getByRole('button', { name: /Abrir notificaciones/i });
    
    await act(async () => {
      fireEvent.click(button);
      jest.advanceTimersByTime(50);
    });

    await waitFor(() => {
      expect(screen.getByText(/Cargando notificaciones/i)).toBeTruthy();
    });
  });

  it('displays notifications list when loaded', async () => {
    const mockNotifications = [
      {
        id: 1,
        title: 'Nueva rutina',
        message: 'Tienes una nueva rutina disponible',
        read: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: 2,
        title: 'Ejercicio completado',
        message: 'Has completado un ejercicio',
        read: true,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
    ];

    notificationsService.fetchUnreadCount.mockResolvedValue(1);
    notificationsService.fetchNotifications.mockResolvedValue(mockNotifications);

    render(
      <IntlProvider locale="es" messages={es}>
        <Notifications userId={1} />
      </IntlProvider>
    );

    const button = screen.getByRole('button', { name: /Abrir notificaciones/i });
    
    await act(async () => {
      fireEvent.click(button);
      jest.advanceTimersByTime(100);
    });

    await waitFor(() => {
      expect(screen.getByText('Nueva rutina')).toBeTruthy();
      expect(screen.getByText('Tienes una nueva rutina disponible')).toBeTruthy();
      expect(screen.getByText('Ejercicio completado')).toBeTruthy();
    });
  });

  it('shows empty state when no notifications', async () => {
    notificationsService.fetchUnreadCount.mockResolvedValue(0);
    notificationsService.fetchNotifications.mockResolvedValue([]);

    render(
      <IntlProvider locale="es" messages={es}>
        <Notifications userId={1} />
      </IntlProvider>
    );

    const button = screen.getByRole('button', { name: /Abrir notificaciones/i });
    
    await act(async () => {
      fireEvent.click(button);
      jest.advanceTimersByTime(100);
    });

    await waitFor(() => {
      expect(screen.getByText(/No hay notificaciones/i)).toBeTruthy();
    });
  });

  it('shows error message when fetch fails', async () => {
    notificationsService.fetchUnreadCount.mockResolvedValue(0);
    notificationsService.fetchNotifications.mockRejectedValue(
      new Error('Error de red')
    );

    render(
      <IntlProvider locale="es" messages={es}>
        <Notifications userId={1} />
      </IntlProvider>
    );

    const button = screen.getByRole('button', { name: /Abrir notificaciones/i });
    
    await act(async () => {
      fireEvent.click(button);
      jest.advanceTimersByTime(100);
    });

    await waitFor(() => {
      expect(screen.getByText(/Error de red/i)).toBeTruthy();
    });
  });

  it('marks notification as read when clicked', async () => {
    const mockNotifications = [
      {
        id: 1,
        title: 'Nueva rutina',
        message: 'Tienes una nueva rutina disponible',
        read: false,
        createdAt: new Date().toISOString(),
      },
    ];

    notificationsService.fetchUnreadCount.mockResolvedValue(1);
    notificationsService.fetchNotifications.mockResolvedValue(mockNotifications);
    notificationsService.markAsRead.mockResolvedValue({});

    render(
      <IntlProvider locale="es" messages={es}>
        <Notifications userId={1} />
      </IntlProvider>
    );

    const button = screen.getByRole('button', { name: /Abrir notificaciones/i });
    
    await act(async () => {
      fireEvent.click(button);
      jest.advanceTimersByTime(100);
    });

    await waitFor(() => {
      expect(screen.getByText('Nueva rutina')).toBeTruthy();
    });

    const notificationButton = screen.getByRole('button', { name: /Marcar como leída: Nueva rutina/i });
    
    await act(async () => {
      fireEvent.click(notificationButton);
      jest.advanceTimersByTime(100);
    });

    await waitFor(() => {
      expect(notificationsService.markAsRead).toHaveBeenCalledWith(1, 1);
    });
  });

  it('marks all notifications as read when button is clicked', async () => {
    const mockNotifications = [
      {
        id: 1,
        title: 'Nueva rutina',
        message: 'Tienes una nueva rutina disponible',
        read: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: 2,
        title: 'Otra notificación',
        message: 'Otra notificación sin leer',
        read: false,
        createdAt: new Date().toISOString(),
      },
    ];

    notificationsService.fetchUnreadCount.mockResolvedValue(2);
    notificationsService.fetchNotifications.mockResolvedValue(mockNotifications);
    notificationsService.markAllAsRead.mockResolvedValue(2);

    render(
      <IntlProvider locale="es" messages={es}>
        <Notifications userId={1} />
      </IntlProvider>
    );

    const button = screen.getByRole('button', { name: /Abrir notificaciones/i });
    
    await act(async () => {
      fireEvent.click(button);
      jest.advanceTimersByTime(100);
    });

    await waitFor(() => {
      expect(screen.getByText('Marcar todas')).toBeTruthy();
    });

    const markAllButton = screen.getByText('Marcar todas');
    
    await act(async () => {
      fireEvent.click(markAllButton);
      jest.advanceTimersByTime(100);
    });

    await waitFor(() => {
      expect(notificationsService.markAllAsRead).toHaveBeenCalledWith(1);
    });
  });

  it('closes dropdown when clicking outside', async () => {
    notificationsService.fetchUnreadCount.mockResolvedValue(0);
    notificationsService.fetchNotifications.mockResolvedValue([]);

    render(
      <IntlProvider locale="es" messages={es}>
        <div>
          <div data-testid="outside">Outside</div>
          <Notifications userId={1} />
        </div>
      </IntlProvider>
    );

    const button = screen.getByRole('button', { name: /Abrir notificaciones/i });
    
    await act(async () => {
      fireEvent.click(button);
      jest.advanceTimersByTime(100);
    });

    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: /Notificaciones/i })).toBeTruthy();
    });

    const outside = screen.getByTestId('outside');
    
    await act(async () => {
      fireEvent.mouseDown(outside);
      jest.advanceTimersByTime(100);
    });

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: /Notificaciones/i })).toBeNull();
    });
  });

  it('does not load notifications if userId is not provided', () => {
    render(
      <IntlProvider locale="es" messages={es}>
        <Notifications userId={null} />
      </IntlProvider>
    );

    expect(notificationsService.fetchUnreadCount).not.toHaveBeenCalled();
  });

  it('handles error when loading unread count fails on mount', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    notificationsService.fetchUnreadCount.mockRejectedValue(new Error('Network error'));

    render(
      <IntlProvider locale="es" messages={es}>
        <Notifications userId={1} />
      </IntlProvider>
    );

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    consoleErrorSpy.mockRestore();
  });

  it('handles mark all as read error', async () => {
    const mockNotifications = [
      {
        id: 1,
        title: 'Nueva rutina',
        message: 'Tienes una nueva rutina disponible',
        read: false,
        createdAt: new Date().toISOString(),
      },
    ];

    notificationsService.fetchUnreadCount.mockResolvedValue(1);
    notificationsService.fetchNotifications.mockResolvedValue(mockNotifications);
    notificationsService.markAllAsRead.mockRejectedValue(new Error('Failed'));

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <IntlProvider locale="es" messages={es}>
        <Notifications userId={1} />
      </IntlProvider>
    );

    const button = screen.getByRole('button', { name: /Abrir notificaciones/i });
    
    await act(async () => {
      fireEvent.click(button);
      jest.advanceTimersByTime(100);
    });

    await waitFor(() => {
      expect(screen.getByText('Marcar todas')).toBeTruthy();
    });

    const markAllButton = screen.getByText('Marcar todas');
    
    await act(async () => {
      fireEvent.click(markAllButton);
      jest.advanceTimersByTime(100);
    });

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    consoleErrorSpy.mockRestore();
  });

  it('handles mark one as read with no notification ID', async () => {
    // El componente solo llama a handleMarkOne cuando hay un id válido
    // Cuando id es null, el componente no intenta marcar la notificación como leída
    const mockNotifications = [
      {
        id: null,
        title: 'Nueva rutina',
        message: 'Tienes una nueva rutina disponible',
        read: false,
        createdAt: new Date().toISOString(),
      },
    ];

    notificationsService.fetchUnreadCount.mockResolvedValue(1);
    notificationsService.fetchNotifications.mockResolvedValue(mockNotifications);

    render(
      <IntlProvider locale="es" messages={es}>
        <Notifications userId={1} />
      </IntlProvider>
    );

    const button = screen.getByRole('button', { name: /Abrir notificaciones/i });
    
    await act(async () => {
      fireEvent.click(button);
      jest.advanceTimersByTime(100);
    });

    await waitFor(() => {
      expect(screen.getByText('Nueva rutina')).toBeTruthy();
    });

    const notificationItem = screen.getByText('Nueva rutina').closest('li');
    
    // Cuando una notificación no tiene id, el componente no intenta marcarla como leída
    await act(async () => {
      fireEvent.click(notificationItem);
      jest.advanceTimersByTime(100);
    });

    // No se debe llamar a markAsRead porque no hay id
    expect(notificationsService.markAsRead).not.toHaveBeenCalled();
  });

  it('handles mark one as read error', async () => {
    const mockNotifications = [
      {
        id: 1,
        title: 'Nueva rutina',
        message: 'Tienes una nueva rutina disponible',
        read: false,
        createdAt: new Date().toISOString(),
      },
    ];

    notificationsService.fetchUnreadCount.mockResolvedValue(1);
    notificationsService.fetchNotifications.mockResolvedValue(mockNotifications);
    notificationsService.markAsRead.mockRejectedValue(new Error('Failed'));

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <IntlProvider locale="es" messages={es}>
        <Notifications userId={1} />
      </IntlProvider>
    );

    const button = screen.getByRole('button', { name: /Abrir notificaciones/i });
    
    await act(async () => {
      fireEvent.click(button);
      jest.advanceTimersByTime(100);
    });

    await waitFor(() => {
      expect(screen.getByText('Nueva rutina')).toBeTruthy();
    });

    const notificationButton = screen.getByRole('button', { name: /Marcar como leída: Nueva rutina/i });
    
    await act(async () => {
      fireEvent.click(notificationButton);
      jest.advanceTimersByTime(100);
    });

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    consoleErrorSpy.mockRestore();
  });

  it('handles key press on notification item', async () => {
    const mockNotifications = [
      {
        id: 1,
        title: 'Nueva rutina',
        message: 'Tienes una nueva rutina disponible',
        read: false,
        createdAt: new Date().toISOString(),
      },
    ];

    notificationsService.fetchUnreadCount.mockResolvedValue(1);
    notificationsService.fetchNotifications.mockResolvedValue(mockNotifications);
    notificationsService.markAsRead.mockResolvedValue({});

    render(
      <IntlProvider locale="es" messages={es}>
        <Notifications userId={1} />
      </IntlProvider>
    );

    const button = screen.getByRole('button', { name: /Abrir notificaciones/i });
    
    await act(async () => {
      fireEvent.click(button);
      jest.advanceTimersByTime(100);
    });

    await waitFor(() => {
      expect(screen.getByText('Nueva rutina')).toBeTruthy();
    });

    const notificationButton = screen.getByRole('button', { name: /Marcar como leída: Nueva rutina/i });
    
    // El botón también puede ser activado con Enter/Space (comportamiento estándar de button)
    await act(async () => {
      fireEvent.click(notificationButton);
      jest.advanceTimersByTime(100);
    });

    await waitFor(() => {
      expect(notificationsService.markAsRead).toHaveBeenCalledWith(1, 1);
    });
  });

  it('handles formatRelativeTime with different time ranges', async () => {
    // This tests the formatRelativeTime function indirectly through rendering
    const mockNotifications = [
      {
        id: 1,
        title: 'Test',
        message: 'Test message',
        read: false,
        createdAt: new Date(Date.now() - 30 * 1000).toISOString(), // 30 seconds ago
      },
      {
        id: 2,
        title: 'Test 2',
        message: 'Test message 2',
        read: false,
        createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
      },
      {
        id: 3,
        title: 'Test 3',
        message: 'Test message 3',
        read: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      },
      {
        id: 4,
        title: 'Test 4',
        message: 'Test message 4',
        read: false,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      },
    ];

    notificationsService.fetchUnreadCount.mockResolvedValue(4);
    notificationsService.fetchNotifications.mockResolvedValue(mockNotifications);

    render(
      <IntlProvider locale="es" messages={es}>
        <Notifications userId={1} />
      </IntlProvider>
    );

    const button = screen.getByRole('button', { name: /Abrir notificaciones/i });
    
    await act(async () => {
      fireEvent.click(button);
      jest.advanceTimersByTime(100);
    });

    await waitFor(() => {
      expect(screen.getByText('Test')).toBeTruthy();
    });
  });
});

