import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import {Provider, useDispatch, useSelector} from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import ExerciseForm from '../../modules/exercises/components/ExerciseForm';
import * as exerciseService from '../../backend/exerciseService';
import {IntlProvider} from "react-intl";
import {MemoryRouter, Route, Routes, useNavigate, useParams} from "react-router-dom";
import es from '../../i18n/messages/messages_es';
import rootReducer from "../../RoutineApp/rootReducer";
import * as common from '../../modules/common';

jest.mock('../../backend/exerciseService');
jest.mock('../../modules/common', () => ({
    ...jest.requireActual('../../modules/common'),
    showError: jest.fn(),
}));

jest.mock("react-router-dom", () => {
    const actual = jest.requireActual("react-router-dom");
    return {
        ...actual,
        useParams: jest.fn(() => ({})),
        useNavigate: () => jest.fn(),
    };
});

jest.mock("react-redux", () => {
    const actual = jest.requireActual("react-redux");
    return {
        ...actual,
        useSelector: jest.fn(),
        useDispatch: () => jest.fn()
    };
});

// Mock FileReader
class MockFileReader {
    constructor() {
        this.onloadend = null;
        this.result = null;
    }
    
    readAsDataURL(file) {
        // Simular lectura asíncrona
        const result = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
        setTimeout(() => {
            // Establecer el resultado en la instancia
            this.result = result;
            if (this.onloadend) {
                // También pasar el evento por si acaso
                this.onloadend({ 
                    target: { 
                        result: result
                    } 
                });
            }
        }, 10);
    }
}

global.FileReader = MockFileReader;

const makeStore = (preloadedState) =>
    configureStore({ reducer: rootReducer, preloadedState });

describe('ExerciseForm', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        common.showError.mockClear();
        useSelector.mockImplementation((selectorCb) =>
            selectorCb({
                users: {
                    user: { id: 1, role: "ADMIN", userName: "Admin", isPremium: true }
                }
            })
        );
        exerciseService.create.mockResolvedValue({ ok: true, payload: { id: 99 } });
        exerciseService.findById.mockResolvedValue({
            ok: true,
            payload: {
                id: 99,
                name: 'Press banca',
                material: 'Barra',
                muscles: ['CHEST'],
                description: 'Ejercicio de pecho',
                image: null
            }
        });
        exerciseService.update.mockResolvedValue({
            ok: true,
            payload: {
                id: 99,
                name: 'Press banca',
                material: 'Barra',
                muscles: ['CHEST'],
                description: 'Ejercicio de pecho',
                image: null
            }
        });
    });

    it('crea un ejercicio nuevo correctamente', async () => {
        const { useParams } = require('react-router-dom');
        useParams.mockReturnValue({});
        const store = makeStore({ users: { user: { id: 1, role: 'ADMIN', userName: 'Admin', isPremium: true } } });
        render(
            <Provider store={store}>
                <IntlProvider locale="es" messages={es}>
                    <MemoryRouter initialEntries={['/exercises/new']}>
                        <ExerciseForm />
                    </MemoryRouter>
                </IntlProvider>
            </Provider>
        );

        // --- Rellenar formulario ---
        fireEvent.change(screen.getByPlaceholderText('Nombre del ejercicio'), {
            target: { value: 'Press banca' },
        });

        fireEvent.change(screen.getByPlaceholderText('Material necesario (opcional)'), {
            target: { value: 'Barra' },
        });

        const selectControl = screen.getAllByRole("combobox")[0];
        fireEvent.keyDown(selectControl, { key: "ArrowDown" });
        const option1 = await screen.findByText("Pectorales");
        fireEvent.click(option1);
        expect(screen.getByText("Pectorales")).toBeTruthy();

        fireEvent.keyDown(selectControl, { key: "ArrowDown" });
        const option2 = await screen.findByText("Tríceps");
        fireEvent.click(option2);
        expect(screen.getByText('Pectorales')).toBeTruthy();
        expect(screen.getByText('Tríceps')).toBeTruthy();

        fireEvent.change(screen.getByPlaceholderText('Describe el ejercicio'), {
            target: { value: 'Ejercicio de pecho' },
        });

        const submitBtn = screen.getByRole('button', { name: /Crear/i });
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(exerciseService.create).toHaveBeenCalledWith({
                name: 'Press banca',
                material: 'Barra',
                muscles: ['CHEST', 'TRICEPS'],
                description: 'Ejercicio de pecho',
                type: 'REPS',
                status: undefined,
            });
        });
    });

    it('muestra aviso de cuenta básica para trainer sin premium', async () => {
        const { useParams } = require('react-router-dom');
        useParams.mockReturnValue({});
        useSelector.mockImplementation((selectorCb) =>
            selectorCb({
                users: {
                    user: { id: 2, role: "TRAINER", userName: "Trainer", isPremium: false }
                }
            })
        );

        const store = makeStore({ users: { user: { id: 2, role: 'TRAINER', userName: 'Trainer', isPremium: false } } });


        render(
            <Provider store={store}>
                <IntlProvider locale="es" messages={es}>
                    <MemoryRouter initialEntries={['/exercises/new']}>
                        <ExerciseForm />
                    </MemoryRouter>
                </IntlProvider>
            </Provider>
        );

        expect(await screen.findByText(/Cuenta Básica/i)).toBeTruthy();
        expect(screen.getByText(/No puedes crear ejercicios/i)).toBeTruthy();
    });

    it('modo edición carga datos existentes y permite actualizar', async () => {
        const store = makeStore({ users: { user: { id: 1, role: 'ADMIN', userName: 'Admin', isPremium: true } } });

        const { useParams } = require("react-router-dom");
        useParams.mockReturnValue({ exerciseId: "99" });

        exerciseService.findById.mockResolvedValue({
            ok: true,
            payload: {
                id: 99,
                name: "Press banca",
                material: "Barra",
                muscles: ["CHEST"],
                description: "Vieja descripción",
                image: null
            }
        });

        exerciseService.update.mockResolvedValue({
            ok: true,
            payload: {
                id: 99,
                name: "Press banca",
                material: "Barra",
                muscles: ["CHEST"],
                description: "Nueva desc",
                image: null
            }
        });

        render(
            <Provider store={store}>
                <IntlProvider locale="es" messages={es}>
                    <MemoryRouter initialEntries={['/exercises/99/edit']}>
                        <Routes>
                            <Route path="/exercises/:exerciseId/edit" element={<ExerciseForm />} />
                        </Routes>
                    </MemoryRouter>
                </IntlProvider>
            </Provider>
        );

        await waitFor(() => {
            expect(screen.getByDisplayValue('Press banca')).toBeTruthy();
        });

        fireEvent.change(screen.getByPlaceholderText("Describe el ejercicio"),
            { target: { value: "Nueva desc" }
        });

        const submitBtn = screen.getByRole('button', { name: /Guardar/i });
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(exerciseService.update).toHaveBeenCalledWith("99", {
                name: "Press banca",
                material: "Barra",
                muscles: ["CHEST"],
                description: "Nueva desc",
                type: "REPS",
                status: undefined
            });
        });
    });

    it('valida que el nombre sea requerido', async () => {
        const { useParams } = require('react-router-dom');
        useParams.mockReturnValue({});
        const store = makeStore({ users: { user: { id: 1, role: 'ADMIN', userName: 'Admin', isPremium: true } } });
        render(
            <Provider store={store}>
                <IntlProvider locale="es" messages={es}>
                    <MemoryRouter initialEntries={['/exercises/new']}>
                        <ExerciseForm />
                    </MemoryRouter>
                </IntlProvider>
            </Provider>
        );

        const submitBtn = screen.getByRole('button', { name: /Crear/i });
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(exerciseService.create).not.toHaveBeenCalled();
        });
    });

    it('permite seleccionar múltiples músculos', async () => {
        const { useParams } = require('react-router-dom');
        useParams.mockReturnValue({});
        const store = makeStore({ users: { user: { id: 1, role: 'ADMIN', userName: 'Admin', isPremium: true } } });
        render(
            <Provider store={store}>
                <IntlProvider locale="es" messages={es}>
                    <MemoryRouter initialEntries={['/exercises/new']}>
                        <ExerciseForm />
                    </MemoryRouter>
                </IntlProvider>
            </Provider>
        );

        fireEvent.change(screen.getByPlaceholderText('Nombre del ejercicio'), {
            target: { value: 'Dominadas' },
        });

        const selectControl = screen.getAllByRole("combobox")[0];
        fireEvent.keyDown(selectControl, { key: "ArrowDown" });
        const option1 = await screen.findByText("Espalda");
        fireEvent.click(option1);

        fireEvent.keyDown(selectControl, { key: "ArrowDown" });
        const option2 = await screen.findByText("Bíceps");
        fireEvent.click(option2);

        expect(screen.getByText('Espalda')).toBeTruthy();
        expect(screen.getByText('Bíceps')).toBeTruthy();
    });

    it('muestra botón de guardar en modo edición', async () => {
        const { useParams } = require('react-router-dom');
        useParams.mockReturnValue({ exerciseId: "99" });
        const store = makeStore({ users: { user: { id: 1, role: 'ADMIN', userName: 'Admin', isPremium: true } } });

        render(
            <Provider store={store}>
                <IntlProvider locale="es" messages={es}>
                    <MemoryRouter initialEntries={['/exercises/99/edit']}>
                        <Routes>
                            <Route path="/exercises/:exerciseId/edit" element={<ExerciseForm />} />
                        </Routes>
                    </MemoryRouter>
                </IntlProvider>
            </Provider>
        );

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /Guardar/i })).toBeTruthy();
        });
    });

    it('muestra botón de crear en modo nuevo', async () => {
        const { useParams } = require('react-router-dom');
        useParams.mockReturnValue({});
        const store = makeStore({ users: { user: { id: 1, role: 'ADMIN', userName: 'Admin', isPremium: true } } });

        render(
            <Provider store={store}>
                <IntlProvider locale="es" messages={es}>
                    <MemoryRouter initialEntries={['/exercises/new']}>
                        <ExerciseForm />
                    </MemoryRouter>
                </IntlProvider>
            </Provider>
        );

        expect(screen.getByRole('button', { name: /Crear/i })).toBeTruthy();
    });

    it('permite añadir material opcional', async () => {
        const { useParams } = require('react-router-dom');
        useParams.mockReturnValue({});
        const store = makeStore({ users: { user: { id: 1, role: 'ADMIN', userName: 'Admin', isPremium: true } } });

        render(
            <Provider store={store}>
                <IntlProvider locale="es" messages={es}>
                    <MemoryRouter initialEntries={['/exercises/new']}>
                        <ExerciseForm />
                    </MemoryRouter>
                </IntlProvider>
            </Provider>
        );

        const materialInput = screen.getByPlaceholderText('Material necesario (opcional)');
        fireEvent.change(materialInput, { target: { value: 'Mancuernas' } });

        expect(materialInput.value).toBe('Mancuernas');
    });

    it('muestra área de drag & drop para subir imagen', async () => {
        const { useParams } = require('react-router-dom');
        useParams.mockReturnValue({});
        const store = makeStore({ users: { user: { id: 1, role: 'ADMIN', userName: 'Admin', isPremium: true } } });

        render(
            <Provider store={store}>
                <IntlProvider locale="es" messages={es}>
                    <MemoryRouter initialEntries={['/exercises/new']}>
                        <ExerciseForm />
                    </MemoryRouter>
                </IntlProvider>
            </Provider>
        );

        expect(screen.getByText(/Arrastra una imagen aquí o haz clic para seleccionar/i)).toBeTruthy();
        expect(screen.getByText(/PNG, JPG, GIF hasta 5MB/i)).toBeTruthy();
    });

    it('permite seleccionar imagen mediante input file', async () => {
        const { useParams } = require('react-router-dom');
        useParams.mockReturnValue({});
        const store = makeStore({ users: { user: { id: 1, role: 'ADMIN', userName: 'Admin', isPremium: true } } });

        render(
            <Provider store={store}>
                <IntlProvider locale="es" messages={es}>
                    <MemoryRouter initialEntries={['/exercises/new']}>
                        <ExerciseForm />
                    </MemoryRouter>
                </IntlProvider>
            </Provider>
        );

        const fileInput = document.querySelector('input[type="file"]');
        expect(fileInput).toBeTruthy();

        const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
        Object.defineProperty(file, 'size', { value: 1024 * 1024 }); // 1MB

        await act(async () => {
            fireEvent.change(fileInput, { target: { files: [file] } });
        });

        await waitFor(() => {
            const preview = screen.queryByAltText('Vista previa del ejercicio');
            expect(preview).toBeTruthy();
        }, { timeout: 3000 });
    });

    it('muestra vista previa de imagen después de seleccionar', async () => {
        const { useParams } = require('react-router-dom');
        useParams.mockReturnValue({});
        const store = makeStore({ users: { user: { id: 1, role: 'ADMIN', userName: 'Admin', isPremium: true } } });

        render(
            <Provider store={store}>
                <IntlProvider locale="es" messages={es}>
                    <MemoryRouter initialEntries={['/exercises/new']}>
                        <ExerciseForm />
                    </MemoryRouter>
                </IntlProvider>
            </Provider>
        );

        const fileInput = document.querySelector('input[type="file"]');
        const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
        Object.defineProperty(file, 'size', { value: 1024 * 1024 });

        await act(async () => {
            fireEvent.change(fileInput, { target: { files: [file] } });
        });

        await waitFor(() => {
            expect(screen.getByAltText('Vista previa del ejercicio')).toBeTruthy();
            expect(screen.getByRole('button', { name: /Cambiar imagen/i })).toBeTruthy();
            expect(screen.getByRole('button', { name: /Eliminar/i })).toBeTruthy();
        }, { timeout: 3000 });
    });

    it('permite eliminar imagen seleccionada', async () => {
        const { useParams } = require('react-router-dom');
        useParams.mockReturnValue({});
        const store = makeStore({ users: { user: { id: 1, role: 'ADMIN', userName: 'Admin', isPremium: true } } });

        render(
            <Provider store={store}>
                <IntlProvider locale="es" messages={es}>
                    <MemoryRouter initialEntries={['/exercises/new']}>
                        <ExerciseForm />
                    </MemoryRouter>
                </IntlProvider>
            </Provider>
        );

        const fileInput = document.querySelector('input[type="file"]');
        const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
        Object.defineProperty(file, 'size', { value: 1024 * 1024 });

        await act(async () => {
            fireEvent.change(fileInput, { target: { files: [file] } });
        });

        await waitFor(() => {
            expect(screen.getByAltText('Vista previa del ejercicio')).toBeTruthy();
        }, { timeout: 3000 });

        const removeButton = screen.getByRole('button', { name: /Eliminar/i });
        await act(async () => {
            fireEvent.click(removeButton);
        });

        await waitFor(() => {
            expect(screen.queryByAltText('Vista previa del ejercicio')).toBeNull();
            expect(screen.getByText(/Arrastra una imagen aquí o haz clic para seleccionar/i)).toBeTruthy();
        }, { timeout: 3000 });
    });

    it('permite cambiar imagen seleccionada', async () => {
        const { useParams } = require('react-router-dom');
        useParams.mockReturnValue({});
        const store = makeStore({ users: { user: { id: 1, role: 'ADMIN', userName: 'Admin', isPremium: true } } });

        render(
            <Provider store={store}>
                <IntlProvider locale="es" messages={es}>
                    <MemoryRouter initialEntries={['/exercises/new']}>
                        <ExerciseForm />
                    </MemoryRouter>
                </IntlProvider>
            </Provider>
        );

        const fileInput = document.querySelector('input[type="file"]');
        const file1 = new File(['dummy content 1'], 'test1.png', { type: 'image/png' });
        Object.defineProperty(file1, 'size', { value: 1024 * 1024 });

        await act(async () => {
            fireEvent.change(fileInput, { target: { files: [file1] } });
        });

        await waitFor(() => {
            expect(screen.getByAltText('Vista previa del ejercicio')).toBeTruthy();
        }, { timeout: 3000 });

        const changeButton = screen.getByRole('button', { name: /Cambiar imagen/i });
        await act(async () => {
            fireEvent.click(changeButton);
        });

        const file2 = new File(['dummy content 2'], 'test2.jpg', { type: 'image/jpeg' });
        Object.defineProperty(file2, 'size', { value: 1024 * 1024 });

        await act(async () => {
            fireEvent.change(fileInput, { target: { files: [file2] } });
        });

        await waitFor(() => {
            expect(screen.getByAltText('Vista previa del ejercicio')).toBeTruthy();
        }, { timeout: 3000 });
    });

    it('valida que solo se acepten archivos de imagen', async () => {
        const { useParams } = require('react-router-dom');
        useParams.mockReturnValue({});
        const store = makeStore({ users: { user: { id: 1, role: 'ADMIN', userName: 'Admin', isPremium: true } } });

        render(
            <Provider store={store}>
                <IntlProvider locale="es" messages={es}>
                    <MemoryRouter initialEntries={['/exercises/new']}>
                        <ExerciseForm />
                    </MemoryRouter>
                </IntlProvider>
            </Provider>
        );

        const fileInput = document.querySelector('input[type="file"]');
        const invalidFile = new File(['dummy content'], 'test.pdf', { type: 'application/pdf' });
        Object.defineProperty(invalidFile, 'size', { value: 1024 * 1024 });

        await act(async () => {
            fireEvent.change(fileInput, { target: { files: [invalidFile] } });
        });

        await waitFor(() => {
            expect(common.showError).toHaveBeenCalled();
        });
    });

    it('valida que el tamaño de imagen no exceda 5MB', async () => {
        const { useParams } = require('react-router-dom');
        useParams.mockReturnValue({});
        const store = makeStore({ users: { user: { id: 1, role: 'ADMIN', userName: 'Admin', isPremium: true } } });

        render(
            <Provider store={store}>
                <IntlProvider locale="es" messages={es}>
                    <MemoryRouter initialEntries={['/exercises/new']}>
                        <ExerciseForm />
                    </MemoryRouter>
                </IntlProvider>
            </Provider>
        );

        const fileInput = document.querySelector('input[type="file"]');
        const largeFile = new File(['dummy content'], 'test.png', { type: 'image/png' });
        Object.defineProperty(largeFile, 'size', { value: 6 * 1024 * 1024 }); // 6MB

        await act(async () => {
            fireEvent.change(fileInput, { target: { files: [largeFile] } });
        });

        await waitFor(() => {
            expect(common.showError).toHaveBeenCalled();
        });
    });

    it('permite drag & drop de imagen', async () => {
        const { useParams } = require('react-router-dom');
        useParams.mockReturnValue({});
        const store = makeStore({ users: { user: { id: 1, role: 'ADMIN', userName: 'Admin', isPremium: true } } });

        render(
            <Provider store={store}>
                <IntlProvider locale="es" messages={es}>
                    <MemoryRouter initialEntries={['/exercises/new']}>
                        <ExerciseForm />
                    </MemoryRouter>
                </IntlProvider>
            </Provider>
        );

        const dropZone = screen.getByRole('button', {name: /arrastra una imagen aquí/i,});
        const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
        Object.defineProperty(file, 'size', { value: 1024 * 1024 });

        const dataTransfer = {
            files: [file],
        };

        await act(async () => {
            fireEvent.dragOver(dropZone, { dataTransfer });
            fireEvent.drop(dropZone, { dataTransfer });
        });

        await waitFor(() => {
            expect(screen.getByAltText('Vista previa del ejercicio')).toBeTruthy();
        }, { timeout: 3000 });
    });

    it('muestra imagen existente en modo edición', async () => {
        const { useParams } = require('react-router-dom');
        useParams.mockReturnValue({ exerciseId: "99" });
        const store = makeStore({ users: { user: { id: 1, role: 'ADMIN', userName: 'Admin', isPremium: true } } });

        exerciseService.findById.mockResolvedValue({
            ok: true,
            payload: {
                id: 99,
                name: "Press banca",
                material: "Barra",
                muscles: ["CHEST"],
                description: "Descripción",
                image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
            }
        });

        render(
            <Provider store={store}>
                <IntlProvider locale="es" messages={es}>
                    <MemoryRouter initialEntries={['/exercises/99/edit']}>
                        <Routes>
                            <Route path="/exercises/:exerciseId/edit" element={<ExerciseForm />} />
                        </Routes>
                    </MemoryRouter>
                </IntlProvider>
            </Provider>
        );

        await waitFor(() => {
            expect(screen.getByAltText('Vista previa del ejercicio')).toBeTruthy();
        });
    });
});
