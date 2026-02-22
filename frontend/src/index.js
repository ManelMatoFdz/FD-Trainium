import React from 'react';
import ReactDOM from 'react-dom/client';

import { HashRouter as Router } from "react-router-dom";
import {Provider} from 'react-redux';
// Service worker deshabilitado - no existe service-worker.js en el build
// import registerServiceWorker from './registerServiceWorker';


import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap';
import '@fortawesome/fontawesome-free/css/all.css';
import 'react-toastify/dist/ReactToastify.css';

import RoutineApp from './RoutineApp';
import {App} from './modules/app';
import backend from './backend';
import {NetworkError} from './backend';
import app from './modules/app';
import './index.css';
import {initReactIntl} from "./i18n";
import {IntlProvider} from "react-intl";

/* Configure backend proxy. */
backend.init(() => RoutineApp.dispatch(app.actions.error(new NetworkError())));

/* Configure i18n. */
const {locale, messages} = initReactIntl();

/* Render application. */
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <Provider store={RoutineApp}>
            <IntlProvider locale={locale} messages={messages}>
                <Router>
                    <App/>
                </Router>
            </IntlProvider>
        </Provider>
    </React.StrictMode>);
// registerServiceWorker();
