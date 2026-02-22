import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { IntlProvider } from 'react-intl';

import CategorySelector from '../../modules/routines/components/CategorySelector';
import rootReducer from '../../RoutineApp/rootReducer';
import es from '../../i18n/messages/messages_es';

const makeStore = (preloadedState) =>
  configureStore({ reducer: rootReducer, preloadedState });

describe('CategorySelector', () => {
  it('renders categories from store', () => {
    const store = makeStore({ routines: { categories: [{ id: 'A', name: 'Fuerza' }, { id: 'B', name: 'Cardio' }] } });
    render(
      <Provider store={store}>
        <IntlProvider locale="es" messages={es}>
          <CategorySelector name="categoryId" />
        </IntlProvider>
      </Provider>
    );
    expect(screen.getByRole('option', { name: /Fuerza/i })).toBeTruthy();
    expect(screen.getByRole('option', { name: /Cardio/i })).toBeTruthy();
  });
});

