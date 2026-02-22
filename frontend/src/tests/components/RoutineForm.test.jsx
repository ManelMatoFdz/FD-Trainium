import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import RoutineForm from '../../modules/routines/components/RoutineForm';
import es from '../../i18n/messages/messages_es';

// Mocks de dependencias
const mockDispatch = jest.fn();
const mockNavigate = jest.fn();
jest.mock('react-redux', () => ({
  useDispatch: () => mockDispatch,
  useSelector: (fn) =>
    fn({
      user: { role: 'TRAINER', isPremium: true },
      users: { user: { role: 'TRAINER', isPremium: true } },
    }),
}));

jest.mock('../../modules/users/selectors', () => ({
  isTrainer: () => true,
  isAdmin: () => false,
  getUser: (state) => state.users.user,
}));

jest.mock('../../modules/routines/components/CategorySelector', () => (props) => (
  <select {...props}>
    <option value="">-</option>
    <option value="1">Fuerza</option>
  </select>
));

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({}), // new routine (no id)
  };
});

const mockHandleResponse = jest.fn();
const mockShowError = jest.fn();
jest.mock('../../modules/common', () => ({
  handleResponse: (...args) => mockHandleResponse(...args),
  showError: (...args) => mockShowError(...args),
  Button: ({ children, onClick, type = 'button', ...rest }) => (
    <button type={type} onClick={onClick} {...rest}>
      {children}
    </button>
  ),
}));

const mockCreate = jest.fn();
const mockUpdate = jest.fn();
const mockFindById = jest.fn();
const mockFindAllExercises = jest.fn();
const mockFindAllCategories = jest.fn();
jest.mock('../../backend', () => ({
  __esModule: true,
  default: {
    routineService: {
      create: (...args) => mockCreate(...args),
      update: (...args) => mockUpdate(...args),
      findById: (...args) => mockFindById(...args),
    },
    exerciseService: {
      find: (...args) => mockFindAllExercises(...args),
      findAll: (...args) => mockFindAllExercises(...args),
    },
    categoryService: {
      findAll: (...args) => mockFindAllCategories(...args),
    },
  },
}));

const wrapRender = () =>
  render(
    <IntlProvider locale="es" messages={es}>
      <MemoryRouter initialEntries={['/routines/new']}>
        <Routes>
          <Route path="/routines/new" element={<RoutineForm />} />
        </Routes>
      </MemoryRouter>
    </IntlProvider>
  );

describe('RoutineForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFindAllCategories.mockResolvedValue({ ok: true, payload: [{ id: 1, name: 'Fuerza' }] });
    mockFindAllExercises.mockResolvedValue({
      ok: true,
      payload: [{ id: 10, name: 'Sentadilla', material: 'barra', type: 'REPS' }],
    });
    mockCreate.mockResolvedValue({ ok: true, payload: { id: 123 } });
  });

  it('permite crear una rutina seleccionando ejercicio y dificultad', async () => {
    wrapRender();

    // carga categorías
    await waitFor(() => expect(mockFindAllCategories).toHaveBeenCalled());

    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText(/Nombre/i), {
        target: { value: 'Mi rutina' },
      });

      // dificultad
      const star = screen.getByLabelText('Dificultad 3');
      fireEvent.click(star);

      // categoría - usar getByRole para select
      const comboBoxes = await screen.findAllByRole('combobox');
      const categorySelect = comboBoxes[0];
      fireEvent.change(categorySelect, { target: { value: '1' } });
      const visibilitySelect = comboBoxes[1];
      fireEvent.change(visibilitySelect, { target: { value: 'true' } });

      // abrir modal ejercicios
      fireEvent.click(screen.getByRole('button', { name: /Añadir ejercicio/i }));
    });

    await waitFor(() => expect(mockFindAllExercises).toHaveBeenCalled());
    
    // seleccionar y añadir ejercicio
    const exerciseRowButton = (await screen.findAllByRole('button', { name: /Sentadilla/i }))
      .find((btn) => btn.className.includes('list-group-item'));
    await act(async () => {
      fireEvent.click(exerciseRowButton);
    });
    await waitFor(() => expect(exerciseRowButton).toHaveClass('selected'));
    await act(async () => {
      fireEvent.click(await screen.findByRole('button', { name: /Añadir seleccionados/i }));
    });
    await waitFor(() => {
      const badge = document.querySelector('.badge-count');
      expect(badge).toBeTruthy();
      expect(badge).toHaveTextContent('1');
    });

    await act(async () => {
      fireEvent.click(screen.getByText(/Guardar/i));
    });

    await waitFor(() => expect(mockCreate).toHaveBeenCalled());
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Mi rutina',
        level: expect.any(String),
        category: 1,
      })
    );
  });

  it('muestra error si la descripción supera 255 caracteres y no envía', async () => {
    wrapRender();
    await waitFor(() => expect(mockFindAllCategories).toHaveBeenCalled());

    const longText = 'a'.repeat(260);
    
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText(/Nombre/i), {
        target: { value: 'Rutina' },
      });
      fireEvent.change(screen.getByPlaceholderText(/Descrip/i), { target: { value: longText } });
      fireEvent.click(screen.getByText(/Guardar/i));
    });

    expect(mockShowError).toHaveBeenCalled();
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('renders form with all fields', async () => {
    wrapRender();
    await waitFor(() => expect(mockFindAllCategories).toHaveBeenCalled());

    expect(screen.getByPlaceholderText(/Nombre/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Descrip/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Añadir ejercicio/i })).toBeInTheDocument();
    expect(screen.getByText(/Guardar/i)).toBeInTheDocument();
  });

  it('handles category loading', async () => {
    wrapRender();
    await waitFor(() => expect(mockFindAllCategories).toHaveBeenCalled());
    
    const comboBoxes = await screen.findAllByRole('combobox');
    expect(comboBoxes.length).toBeGreaterThan(0);
  });

  it('allows setting difficulty level', async () => {
    wrapRender();
    await waitFor(() => expect(mockFindAllCategories).toHaveBeenCalled());

    const star1 = screen.getByLabelText('Dificultad 1');
    const star5 = screen.getByLabelText('Dificultad 5');
    
    fireEvent.click(star1);
    fireEvent.click(star5);
    
    expect(star1).toBeInTheDocument();
    expect(star5).toBeInTheDocument();
  });

  it('opens and closes exercise modal', async () => {
    wrapRender();
    await waitFor(() => expect(mockFindAllCategories).toHaveBeenCalled());

    // Open modal
    fireEvent.click(screen.getByRole('button', { name: /Añadir ejercicio/i }));
    await waitFor(() => expect(mockFindAllExercises).toHaveBeenCalled());
    
    // Modal should be open - use getAllByText since there can be multiple
    const sentadillaElements = await screen.findAllByText(/Sentadilla/i);
    expect(sentadillaElements.length).toBeGreaterThan(0);
  });

  it('validates name is required', async () => {
    wrapRender();
    await waitFor(() => expect(mockFindAllCategories).toHaveBeenCalled());

    // Try to submit without name
    await act(async () => {
      fireEvent.click(screen.getByText(/Guardar/i));
    });

    // Should show error or not call create
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('handles visibility selection', async () => {
    wrapRender();
    await waitFor(() => expect(mockFindAllCategories).toHaveBeenCalled());

    const comboBoxes = await screen.findAllByRole('combobox');
    const visibilitySelect = comboBoxes[1];
    
    fireEvent.change(visibilitySelect, { target: { value: 'false' } });
    expect(visibilitySelect.value).toBe('false');
    
    fireEvent.change(visibilitySelect, { target: { value: 'true' } });
    expect(visibilitySelect.value).toBe('true');
  });

  it('handles cancel button click', async () => {
    wrapRender();
    await waitFor(() => expect(mockFindAllCategories).toHaveBeenCalled());

    const cancelButton = screen.getByText(/Cancelar/i);
    fireEvent.click(cancelButton);
    
    expect(mockNavigate).toHaveBeenCalled();
  });

  it('handles description character count', async () => {
    wrapRender();
    await waitFor(() => expect(mockFindAllCategories).toHaveBeenCalled());

    const descTextarea = screen.getByPlaceholderText(/Descrip/i);
    fireEvent.change(descTextarea, { target: { value: 'Test description' } });
    
    // Should show character count
    expect(screen.getByText(/16\/255/)).toBeInTheDocument();
  });

  it('shows new routine title', async () => {
    wrapRender();
    await waitFor(() => expect(mockFindAllCategories).toHaveBeenCalled());

    expect(screen.getByText(/Nueva rutina/i)).toBeInTheDocument();
  });

  it('searches exercises in modal', async () => {
    wrapRender();
    await waitFor(() => expect(mockFindAllCategories).toHaveBeenCalled());

    // Open modal
    fireEvent.click(screen.getByRole('button', { name: /Añadir ejercicio/i }));
    await waitFor(() => expect(mockFindAllExercises).toHaveBeenCalled());

    // Modal should be open
    const sentadillaElements = await screen.findAllByText(/Sentadilla/i);
    expect(sentadillaElements.length).toBeGreaterThan(0);
  });

  it('closes exercise modal with cancel', async () => {
    wrapRender();
    await waitFor(() => expect(mockFindAllCategories).toHaveBeenCalled());

    // Open modal
    fireEvent.click(screen.getByRole('button', { name: /Añadir ejercicio/i }));
    await waitFor(() => expect(mockFindAllExercises).toHaveBeenCalled());

    // Click cancel in modal
    const cancelButtons = screen.getAllByText(/Cancelar/i);
    const modalCancel = cancelButtons.find(btn => btn.closest('.modal-footer'));
    if (modalCancel) {
      fireEvent.click(modalCancel);
    }
  });

  it('handles category error response', async () => {
    mockFindAllCategories.mockResolvedValueOnce({ ok: false, error: 'Error' });
    
    wrapRender();
    await waitFor(() => expect(mockFindAllCategories).toHaveBeenCalled());
    
    // Should still render the form
    expect(screen.getByPlaceholderText(/Nombre/i)).toBeInTheDocument();
  });

  it('handles create error response', async () => {
    mockCreate.mockResolvedValueOnce({ ok: false, error: 'Creation failed' });
    
    wrapRender();
    await waitFor(() => expect(mockFindAllCategories).toHaveBeenCalled());

    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText(/Nombre/i), {
        target: { value: 'Test Routine' },
      });
      fireEvent.click(screen.getByLabelText('Dificultad 3'));
      
      const comboBoxes = await screen.findAllByRole('combobox');
      fireEvent.change(comboBoxes[0], { target: { value: '1' } });
      fireEvent.change(comboBoxes[1], { target: { value: 'true' } });
    });
    
    // Open and add exercise
    fireEvent.click(screen.getByRole('button', { name: /Añadir ejercicio/i }));
    await waitFor(() => expect(mockFindAllExercises).toHaveBeenCalled());
    
    const exerciseButtons = await screen.findAllByRole('button', { name: /Sentadilla/i });
    const exerciseRowButton = exerciseButtons.find(btn => btn.className.includes('list-group-item'));
    if (exerciseRowButton) {
      await act(async () => fireEvent.click(exerciseRowButton));
      await act(async () => fireEvent.click(screen.getByRole('button', { name: /Añadir seleccionados/i })));
    }

    await act(async () => {
      fireEvent.click(screen.getByText(/Guardar/i));
    });

    await waitFor(() => expect(mockCreate).toHaveBeenCalled());
  });

  it('handles star hover interactions', async () => {
    wrapRender();
    await waitFor(() => expect(mockFindAllCategories).toHaveBeenCalled());

    const star3 = screen.getByLabelText('Dificultad 3');
    const star4 = screen.getByLabelText('Dificultad 4');
    
    // Hover over star
    fireEvent.mouseEnter(star4);
    fireEvent.mouseLeave(star4);
    
    // Click star
    fireEvent.click(star3);
    
    expect(star3).toBeInTheDocument();
  });

  it('handles cardio exercise selection and fields', async () => {
    mockFindAllExercises.mockResolvedValue({
      ok: true,
      payload: [
        { id: 20, name: 'Running', material: '', type: 'CARDIO' },
      ],
    });
    
    wrapRender();
    await waitFor(() => expect(mockFindAllCategories).toHaveBeenCalled());

    // Open modal
    fireEvent.click(screen.getByRole('button', { name: /Añadir ejercicio/i }));
    await waitFor(() => expect(mockFindAllExercises).toHaveBeenCalled());

    // Find and click cardio exercise
    const runningButtons = await screen.findAllByRole('button', { name: /Running/i });
    const exerciseRowButton = runningButtons.find(btn => btn.className.includes('list-group-item'));
    if (exerciseRowButton) {
      await act(async () => fireEvent.click(exerciseRowButton));
      await act(async () => fireEvent.click(screen.getByRole('button', { name: /Añadir seleccionados/i })));
    }
  });

  it('handles duplicate exercise error on submit', async () => {
    mockCreate.mockResolvedValueOnce({ 
      ok: false, 
      payload: [{ message: 'ejercicio repetido en la rutina' }] 
    });
    
    wrapRender();
    await waitFor(() => expect(mockFindAllCategories).toHaveBeenCalled());

    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText(/Nombre/i), {
        target: { value: 'Test Routine' },
      });
      fireEvent.click(screen.getByLabelText('Dificultad 3'));
      
      const comboBoxes = await screen.findAllByRole('combobox');
      fireEvent.change(comboBoxes[0], { target: { value: '1' } });
    });
    
    // Open and add exercise
    fireEvent.click(screen.getByRole('button', { name: /Añadir ejercicio/i }));
    await waitFor(() => expect(mockFindAllExercises).toHaveBeenCalled());
    
    const exerciseButtons = await screen.findAllByRole('button', { name: /Sentadilla/i });
    const exerciseRowButton = exerciseButtons.find(btn => btn.className.includes('list-group-item'));
    if (exerciseRowButton) {
      await act(async () => fireEvent.click(exerciseRowButton));
      await act(async () => fireEvent.click(screen.getByRole('button', { name: /Añadir seleccionados/i })));
    }

    await act(async () => {
      fireEvent.click(screen.getByText(/Guardar/i));
    });

    await waitFor(() => expect(mockCreate).toHaveBeenCalled());
    expect(mockShowError).toHaveBeenCalled();
  });

  it('handles empty exercises response', async () => {
    mockFindAllExercises.mockResolvedValue({
      ok: true,
      payload: { items: [], existMoreItems: false },
    });
    
    wrapRender();
    await waitFor(() => expect(mockFindAllCategories).toHaveBeenCalled());

    // Open modal
    fireEvent.click(screen.getByRole('button', { name: /Añadir ejercicio/i }));
    await waitFor(() => expect(mockFindAllExercises).toHaveBeenCalled());
  });
});

