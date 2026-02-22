import {useState} from 'react';
import {useDispatch} from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';

import {showError, Button} from '../../common';
import * as actions from '../actions';
import backend from '../../../backend';
import { FormattedMessage } from 'react-intl';


const Login = () => {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    let form;

    const handleSubmit = async event => {

        event.preventDefault();

        if (form.checkValidity()) {

            backend.userService.login(
                userName, 
                password, 
                () => {
                    // Callback de reautenticación (cuando el token expira)
                    navigate('/users/login');
                    dispatch(actions.logout());
                },
                (authenticatedUser) => {
                    // Callback de éxito
                    dispatch(actions.loginCompleted(authenticatedUser));
                    navigate('/');
                }, 
                (errors) => {
                    // Callback de error
                    showError(errors);
                }
            );

        } else {
            form.classList.add('was-validated');
        }

    }

    return (
        <div className="container signup-container login-container py-5">
            <div className="row justify-content-center">
                <div className="col-12 col-md-10 col-lg-8 col-xl-6">
                    <div className="card bg-white border-0 shadow-lg auth-card-dark">
                        <h2 className="card-header text-center mb-0"><FormattedMessage id="project.login.title" defaultMessage="Iniciar sesión"/></h2>
                        <div className="card-body">
                        <form ref={node => form = node}
                                className="needs-validation" noValidate
                                onSubmit={e => handleSubmit(e)}>

                                <div className="form-row">
                                    <div className="col-md-12 mb-3">
                                        <div className="md-input">
                                            <input type="text" id="userName"
                                                   className="form-control md-control shadow-sm"
                                                   placeholder=" "
                                                   value={userName}
                                                   onChange={e => setUserName(e.target.value)}
                                                   autoFocus
                                                   required/>
                                            <label htmlFor="userName"><FormattedMessage id="project.login.username" defaultMessage="Nombre de usuario"/></label>
                                            <div className="invalid-feedback"><FormattedMessage id="project.login.requiredField" defaultMessage="Campo obligatorio"/>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            <div className="form-row">
                                <div className="col-md-12 mb-3">
                                    <div className="md-input">
                                    <input type="password" id="password" className="form-control md-control shadow-sm"
                                                placeholder=" "
                                                value={password}
                                                onChange={e => setPassword(e.target.value)}
                                                required/>
                                        <label htmlFor="password"><FormattedMessage id="project.login.password" defaultMessage="Contraseña"/></label>
                                        <div className="invalid-feedback"><FormattedMessage id="project.login.requiredField" defaultMessage="Campo obligatorio"/></div>
                                    </div>
                                </div>
                            </div>

                                <div className="form-row mt-2">
                                    <div className="col-md-12">
                                        <Button id="loginButton" type="submit" variant="primary" fullWidth>
                                            <FormattedMessage id="project.login.title" defaultMessage="Iniciar sesión" />
                                        </Button>
                                    </div>
                                </div>

                                <p className="mt-3 text-center mb-0 auth-alt small">
                                    <FormattedMessage id="project.login.noAccount" defaultMessage="¿No tienes cuenta aún?" />{' '}
                                    <Link to="/users/signup" className="ms-1">
                                        <FormattedMessage id="project.login.signup" defaultMessage="Regístrate" />
                                    </Link>
                                </p>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

}

export default Login;
