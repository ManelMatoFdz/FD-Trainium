
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { IntlProvider } from 'react-intl';

import ExecutionStatistics from '../../modules/routines/components/ExecutionStatistics';
import es from '../../i18n/messages/messages_es';

const sample = [
  {
    id: 1,
    routineName: 'A',
    performedAt: new Date().toISOString(),
    totalDurationSec: 1800,
    exercises: [
      { id: 1, muscles: ['Pectorales', 'Biceps'], sets: 3 },
      { id: 2, muscles: ['Espalda'], sets: 2 },
      { id: 3, muscles: ['Hombros'], sets: 4 },
    ],
  },
  {
    id: 2,
    routineName: 'B',
    performedAt: new Date().toISOString(),
    totalDurationSec: 900,
    exercises: [{ id: 4, muscles: ['Pectorales'], sets: 2 }],
  },
];

const sampleWithWeight = [
  {
    id: 1,
    routineName: 'Rutina A',
    performedAt: new Date(2024, 0, 1).toISOString(),
    totalDurationSec: 1800,
    exercises: [
      {
        exerciseId: 1,
        exerciseName: 'Press Banca',
        weightUsed: 80,
        setsDetails: [
          { weight: 80, reps: 8 },
          { weight: 85, reps: 6 }
        ]
      },
      {
        exerciseId: 2,
        exerciseName: 'Sentadilla',
        weightUsed: 100,
        setsDetails: [
          { weight: 100, reps: 10 }
        ]
      }
    ],
  },
  {
    id: 2,
    routineName: 'Rutina B',
    performedAt: new Date(2024, 0, 5).toISOString(),
    totalDurationSec: 900,
    exercises: [
      {
        exerciseId: 1,
        exerciseName: 'Press Banca',
        weightUsed: 85,
        setsDetails: [
          { weight: 85, reps: 8 }
        ]
      }
    ],
  },
];

describe('ExecutionStatistics', () => {
  it('renders summary totals and can switch ranges', () => {
    render(
      <IntlProvider locale="es" messages={es}>
        <ExecutionStatistics executions={sample} />
      </IntlProvider>
    );

    expect(screen.getByText(/Estad/i)).toBeTruthy();
    expect(screen.getByText('2')).toBeTruthy();
    expect(screen.getByText('4')).toBeTruthy();
    expect(screen.getByText(/45/)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /Semanal/i }));
    fireEvent.click(screen.getByRole('button', { name: /Diaria/i }));
    fireEvent.click(screen.getByRole('button', { name: /Mensual/i }));

    expect(screen.getAllByText(/Rutinas Completadas/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Duraci/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Volumen Total/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Trabajo por Músculo/i).length).toBeGreaterThan(0);

    // Radar puede no renderizar etiquetas cuando no hay datos suficientes, no lo hacemos obligatorio
  });

  it('renders weight by exercise chart when exercises have weight data', () => {
    render(
      <IntlProvider locale="es" messages={es}>
        <ExecutionStatistics executions={sampleWithWeight} />
      </IntlProvider>
    );

    // Verificar que aparece el título de la gráfica de peso
    expect(screen.getByText(/Peso por Ejercicio/i)).toBeTruthy();
    
    // Verificar que aparece el selector de ejercicios
    expect(screen.getByText(/Mostrar:/i)).toBeTruthy();
  });

  it('allows changing number of exercises to display', () => {
    render(
      <IntlProvider locale="es" messages={es}>
        <ExecutionStatistics executions={sampleWithWeight} />
      </IntlProvider>
    );

    const select = screen.getByDisplayValue('8');
    expect(select).toBeTruthy();

    // Cambiar a 5 ejercicios
    fireEvent.change(select, { target: { value: '5' } });
    expect(select.value).toBe('5');

    // Cambiar a Todos
    fireEvent.change(select, { target: { value: String(sampleWithWeight.length) } });
    expect(select.value).toBe(String(sampleWithWeight.length));
  });

  it('does not render weight chart when no weight data available', () => {
    render(
      <IntlProvider locale="es" messages={es}>
        <ExecutionStatistics executions={sample} />
      </IntlProvider>
    );

    // La gráfica de peso no debería aparecer si no hay datos de peso
    const weightChartTitle = screen.queryByText(/Peso por Ejercicio/i);
    expect(weightChartTitle).toBeFalsy();
  });
});
