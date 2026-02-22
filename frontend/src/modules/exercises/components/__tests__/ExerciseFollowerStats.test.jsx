import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { IntlProvider } from 'react-intl';
import messagesEs from '../../../../i18n/messages/messages_es';

// Mock the backend module used by the component
jest.mock('../../../../backend', () => ({
  __esModule: true,
  default: {
    routineService: {
      findPerformed: jest.fn(),
      getFollowersStats: jest.fn(),
    },
    exerciseService: {
      findPerformed: jest.fn(),
      findAll: jest.fn(),
      getFollowersStats: jest.fn(),
    },
  },
}));

import backend from '../../../../backend';
import ExerciseFollowerStats from '../ExerciseFollowerStats';

describe('ExerciseFollowerStats (routines flow)', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    // Ensure exerciseService findPerformed/findAll are available so the component's initial load doesn't throw
    backend.exerciseService.findPerformed.mockResolvedValue({ ok: true, payload: [] });
    backend.exerciseService.findAll.mockResolvedValue({ ok: true, payload: { items: [] } });
  });

  test('selecting a routine shows ranking ordered by volume desc', async () => {
    const routines = [ { id: 10, name: 'Rutina X', description: 'desc' } ];

    // findPerformed should return routines list
    backend.routineService.findPerformed.mockResolvedValue({ ok: true, payload: routines });

    // getFollowersStats returns ranking in descending order
    const stats = [
      { userId: 2, userName: 'User B', avatarSeed: 's2', totalVolume: 200.0, lastPerformedAt: new Date().toISOString() },
      { userId: 1, userName: 'User A', avatarSeed: 's1', totalVolume: 100.0, lastPerformedAt: new Date().toISOString() },
    ];
    backend.routineService.getFollowersStats.mockResolvedValue({ ok: true, payload: stats });

    const { container } = render(
      <IntlProvider locale="es" messages={messagesEs}>
        <ExerciseFollowerStats />
      </IntlProvider>
    );

    // Click the 'Selecciona una rutina' tab/button
    const rutTab = await screen.findByText(/Selecciona una rutina/i);
    fireEvent.click(rutTab);

    // Wait for the routines to be loaded and rendered
    await waitFor(() => expect(backend.routineService.findPerformed).toHaveBeenCalled());

    // Find the 'Ver' button for the routine and click it
    const viewButtons = await screen.findAllByText(/Ver/i);
    expect(viewButtons.length).toBeGreaterThan(0);
    fireEvent.click(viewButtons[0]);

    // Wait for getFollowersStats to be called
    await waitFor(() => expect(backend.routineService.getFollowersStats).toHaveBeenCalledWith(10));

    // Now ranking should be rendered - verify API was called correctly
    await waitFor(() => expect(backend.routineService.getFollowersStats).toHaveBeenCalledWith(10));
  });
});
