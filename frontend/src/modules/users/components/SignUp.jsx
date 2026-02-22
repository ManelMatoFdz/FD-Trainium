import {useState} from 'react';
import {useDispatch} from 'react-redux';
import { useNavigate} from 'react-router-dom';

import {showError, Button} from '../../common';
import * as actions from '../actions';
import backend from '../../../backend';
import { FormattedMessage } from 'react-intl';

const SignUp = () => {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail]  = useState('');
    const [passwordsDoNotMatch, setPasswordsDoNotMatch] = useState(false);
    const [option, setOption] = useState("User");
    const [formation, setFormation] = useState('');
    let form;
    let confirmPasswordInput;

    const handleSubmit = async event => {

        event.preventDefault();

        if (form.checkValidity() && checkConfirmPassword()) {

            const user = {
                userName: userName.trim(),
                password: password,
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                email: email.trim(),
                role: option.trim(),
                formation: option === "Trainer" ? formation.trim() : ""
            };

            backend.userService.signUp(user, () => {
                navigate('/users/login');
                dispatch(actions.logout());
            }, (authenticatedUser) => {
                dispatch(actions.signUpCompleted(authenticatedUser));
                navigate('/');
            }, (errors) => {
                showError(errors);
            });

        } else {

            form.classList.add('was-validated');

        }

    }

    const checkConfirmPassword = () => {

        if (password !== confirmPassword) {

            confirmPasswordInput.setCustomValidity('error');
            setPasswordsDoNotMatch(true);

            return false;

        } else {
            return true;
        }

    }

    const handleConfirmPasswordChange = value => {

        confirmPasswordInput.setCustomValidity('');
        setConfirmPassword(value);
        setPasswordsDoNotMatch(false);

    }

   return (
    <div className="container signup-container py-5">
        {/*<Errors errors={backendErrors} onClose={() => setBackendErrors(null)}/> */}
        <div className="row justify-content-center">
          <div className="col-12 col-md-10 col-lg-8 col-xl-6">
            <div className="card bg-white border-0 shadow-lg auth-card-dark">
                <h2 className="card-header text-center mb-0"><FormattedMessage id="project.auth.signup.title" defaultMessage="Registro"/></h2>

                <div className="card-body">
                {/* Selector de rol con nuevo estilo oscuro */}
                    <div className="d-flex justify-content-center mb-4 role-toggle-dark">
                        <fieldset className="role-toggle-group">
                            <legend className="visually-hidden">
                                <FormattedMessage id="project.auth.signup.role.select" defaultMessage="Seleccionar rol" />
                            </legend>
                            <button
                                type="button"
                                className={`btn-role ${option === "User" ? 'btn-role-active' : ''}`}
                                onClick={() => setOption("User")}
                                aria-pressed={option === 'User'}
                            ><FormattedMessage id="project.auth.signup.role.user" defaultMessage="Usuario" /></button>
                            <button
                                type="button"
                                className={`btn-role ${option === "Trainer" ? 'btn-role-active' : ''}`}
                                onClick={() => setOption("Trainer")}
                                aria-pressed={option === 'Trainer'}
                            ><FormattedMessage id="project.auth.signup.role.trainer" defaultMessage="Entrenador" /></button>
                        </fieldset>
                    </div>

                    <form id="signupForm" ref={node => form = node}
                        className="needs-validation" noValidate
                        onSubmit={handleSubmit}>

                        {/* Fila 1: user name - email */}
                        <div className="form-row">
                            <div className="col-md-6 mb-3">
                                <div className="md-input">
                                    <input type="text" id="userName" className="form-control md-control shadow-sm"
                                        placeholder=" "
                                        value={userName}
                                        onChange={e => setUserName(e.target.value)}
                                        autoFocus
                                        required/>
                                    <label htmlFor="userName"><FormattedMessage id="project.auth.signup.username" defaultMessage="Nombre de usuario"/></label>
                                    <div className="invalid-feedback"><FormattedMessage id="project.login.requiredField" defaultMessage="Campo obligatorio"/>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6 mb-3">
                                <div className="md-input">
                                    <input type="email" id="email" className="form-control md-control shadow-sm"
                                        placeholder=" "
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        required/>
                                    <label htmlFor="email"><FormattedMessage id="project.auth.signup.email" defaultMessage="Correo electrónico"/></label>
                                    <div className="invalid-feedback"><FormattedMessage id="project.auth.signup.email.invalid" defaultMessage="Correo electrónico no válido"/></div>
                                </div>
                            </div>
                        </div>

                        {/* Fila 2: nombre - apellidos */}
                        <div className="form-row">
                            <div className="col-md-6 mb-3">
                                <div className="md-input">
                                    <input type="text" id="firstName" className="form-control md-control shadow-sm"
                                        placeholder=" "
                                        value={firstName}
                                        onChange={e => setFirstName(e.target.value)}
                                        required/>
                                    <label htmlFor="firstName"><FormattedMessage id="project.auth.signup.firstName" defaultMessage="Nombre"/></label>
                                    <div className="invalid-feedback"><FormattedMessage id="project.login.requiredField" defaultMessage="Campo obligatorio"/>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6 mb-3">
                                <div className="md-input">
                                    <input type="text" id="lastName" className="form-control md-control shadow-sm"
                                        placeholder=" "
                                        value={lastName}
                                        onChange={e => setLastName(e.target.value)}
                                        required/>
                                    <label htmlFor="lastName"><FormattedMessage id="project.auth.signup.lastName" defaultMessage="Apellidos"/></label>
                                    <div className="invalid-feedback"><FormattedMessage id="project.login.requiredField" defaultMessage="Campo obligatorio"/>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Fila 3: password ancho completo */}
                        <div className="form-row">
                            <div className="col-md-12 mb-3">
                                <div className="md-input">
                                    <input type="password" id="password" className="form-control md-control shadow-sm"
                                        placeholder=" "
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        required/>
                                    <label htmlFor="password"><FormattedMessage id="project.auth.signup.password" defaultMessage="Contraseña"/></label>
                                    <div className="invalid-feedback"><FormattedMessage id="project.login.requiredField" defaultMessage="Campo obligatorio"/>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Fila 4: confirmar password ancho completo */}
                        <div className="form-row">
                            <div className="col-md-12 mb-3">
                                <div className="md-input">
                                    <input ref={node => confirmPasswordInput = node}
                                        type="password" id="confirmPassword" className="form-control md-control shadow-sm"
                                        placeholder=" "
                                        value={confirmPassword}
                                        onChange={e => handleConfirmPasswordChange(e.target.value)}
                                        required/>
                                    <label htmlFor="confirmPassword"><FormattedMessage id="project.auth.signup.confirmPassword" defaultMessage="Confirmar contraseña" /></label>
                                    <div className="invalid-feedback">
                                        {passwordsDoNotMatch ? <FormattedMessage id="project.auth.signup.password.mismatch" defaultMessage="Las contraseñas no coinciden" />
                                            : <FormattedMessage id="project.login.requiredField" defaultMessage="Campo obligatorio" />}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Campo condicional para Trainer */}
                        {option === "Trainer" && (
                            <div className="form-row">
                                <div className="col-md-12 mb-3">
                                    <div className="md-input">
                                        <input type="text" id="formation" className="form-control md-control shadow-sm"
                                            placeholder=" "
                                            value={formation}
                                            onChange={e => setFormation(e.target.value)}
                                            required/>
                                        <label htmlFor="formation"><FormattedMessage id="project.auth.signup.formation" defaultMessage="Experiencia"/></label>
                                        <div className="invalid-feedback"><FormattedMessage id="project.login.requiredField" defaultMessage="Campo obligatorio"/></div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="form-row mt-2">
                            <div className="col-md-12">
                                <Button type="submit" variant="primary" fullWidth>
                                    <FormattedMessage id="project.auth.signup.submit" defaultMessage="Crear cuenta" />
                                </Button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
          </div>
        </div>
    </div>
);


}

export default SignUp;
