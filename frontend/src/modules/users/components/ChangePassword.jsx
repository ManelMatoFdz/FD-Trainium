import {useState} from 'react';
import {useSelector} from 'react-redux';
import {useNavigate} from 'react-router-dom';

import {showError, showSuccess, Button} from '../../common';
import * as selectors from '../selectors';
import backend from '../../../backend';
import { FormattedMessage, useIntl } from 'react-intl';

const ChangePassword = () => {

    const intl = useIntl();
    const user = useSelector(selectors.getUser);
    const navigate = useNavigate();
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [passwordsDoNotMatch, setPasswordsDoNotMatch] = useState(false);
    let form;
    let confirmNewPasswordInput;

    const handleSubmit = async event => {
        event.preventDefault();
        if (form.checkValidity() && checkConfirmNewPassword()) {
            backend.userService.changePassword(user.id, oldPassword, newPassword, () => {
                showSuccess(intl.formatMessage({
                    id: 'project.auth.password.updated.message',
                    defaultMessage: 'Tu contraseña se ha actualizado correctamente'
                }));
                navigate('/');
            }, (errors) => { showError(errors); });
        } else {
            form.classList.add('was-validated');
        }
    };

    const checkConfirmNewPassword = () => {
        if (newPassword !== confirmNewPassword) {
            confirmNewPasswordInput.setCustomValidity('error');
            setPasswordsDoNotMatch(true);
            return false;
        } else { return true; }
    };

    const handleConfirmNewPasswordChange = e => {
        confirmNewPasswordInput.setCustomValidity('');
        setConfirmNewPassword(e.target.value);
        setPasswordsDoNotMatch(false);
    };

    return (
        <div className="container signup-container py-5">
            <div className="row justify-content-center">
                <div className="col-12 col-md-10 col-lg-8 col-xl-6">
                    <div className="card bg-white border-0 shadow-lg auth-card-dark">
                        <h2 className="card-header text-center mb-0"><FormattedMessage id="project.auth.password.change.title" defaultMessage="Cambiar contraseña" /></h2>
                        <div className="card-body">
                            <form ref={node => form = node}
                                  className="needs-validation" noValidate
                                  onSubmit={handleSubmit}>

                                <div className="form-row">
                                    <div className="col-md-12 mb-3">
                                        <div className="md-input">
                                            <input type="password" id="oldPassword" className="form-control md-control shadow-sm"
                                                   placeholder=" " value={oldPassword}
                                                   onChange={e => setOldPassword(e.target.value)} autoFocus required />
                                            <label htmlFor="oldPassword"><FormattedMessage id="project.auth.password.old" defaultMessage="Contraseña actual" /></label>
                                            <div className="invalid-feedback"><FormattedMessage id="project.login.requiredField" defaultMessage="Campo obligatorio" /></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="col-md-12 mb-3">
                                        <div className="md-input">
                                            <input type="password" id="newPassword" className="form-control md-control shadow-sm"
                                                   placeholder=" " value={newPassword}
                                                   onChange={e => setNewPassword(e.target.value)} required />
                                            <label htmlFor="newPassword"><FormattedMessage id="project.auth.password.new" defaultMessage="Nueva contraseña" /></label>
                                            <div className="invalid-feedback"><FormattedMessage id="project.login.requiredField" defaultMessage="Campo obligatorio"/>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="col-md-12 mb-3">
                                        <div className="md-input">
                                            <input ref={node => confirmNewPasswordInput = node}
                                                   type="password" id="confirmNewPassword" className="form-control md-control shadow-sm"
                                                   placeholder=" " value={confirmNewPassword}
                                                   onChange={handleConfirmNewPasswordChange} required />
                                            <label htmlFor="confirmNewPassword"><FormattedMessage id="project.auth.password.confirm" defaultMessage="Confirmar nueva contraseña" /></label>
                                            <div className="invalid-feedback">
                                                {passwordsDoNotMatch ? <FormattedMessage id="project.auth.password.mismatch" defaultMessage="Las contraseñas no coinciden" />
                                                    : <FormattedMessage id="project.common.required" defaultMessage="Campo obligatorio" />}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="form-row mt-2">
                                    <div className="col-md-12">
                                        <Button type="submit" variant="primary" fullWidth>
                                            <FormattedMessage id="project.common.save" defaultMessage="Guardar"/>
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
};

export default ChangePassword;
