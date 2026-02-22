import React, { useState, useMemo, useRef, useEffect } from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {useNavigate} from 'react-router-dom';
import {showError, showSuccess, Avatar, Button} from '../../common';
import * as actions from '../actions';
import * as selectors from '../selectors';
import backend from '../../../backend';
import { FormattedMessage, useIntl } from 'react-intl';
import './UpdateProfile.css'; // <-- añade el CSS del tooltip

const MAX_SIZE = 16 * 1024 * 1024; // 16 MB
const OK_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/gif',
  'image/svg+xml',
];

const UpdateProfile = () => {

  const intl = useIntl();
  const user = useSelector(selectors.getUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName]   = useState(user.lastName);
  const [email, setEmail]         = useState(user.email);
  const [formation, setFormation] = useState(user?.formation ?? "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [heightCm, setHeightCm]   = useState(user?.heightCm ?? '');
  const [weightKg, setWeightKg]   = useState(user?.weightKg ?? '');
  const [gender, setGender]       = useState(user?.gender ?? '');
  const [file, setFile]           = useState(null);
  const [controlsOpen, setControlsOpen] = useState(false);
  const wrapperRef = useRef(null);
  const controlsRef = useRef(null);

  const fileInputRef = useRef(null);
  const openFilePicker = () => {
    if (!controlsOpen) setControlsOpen(true);
    fileInputRef.current?.click();
  };

  // Cerrar popover al hacer click fuera o con ESC
  useEffect(() => {
    if (!controlsOpen) return;
    const dialog = controlsRef.current;
    const onDocClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setControlsOpen(false);
        if (dialog && typeof dialog.close === 'function') {
          dialog.close();
        }
      }
    };
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setControlsOpen(false);
        if (dialog && typeof dialog.close === 'function') {
          dialog.close();
        }
      }
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [controlsOpen]);

  const previewUrl = useMemo(() => avatarUrl?.trim() || null, [avatarUrl]);

  // Refrescar perfil desde backend al entrar y sincronizar estados locales
  useEffect(() => {
    if (!user?.id) return;
    backend.userService.getProfile(
      (fresh) => {
        dispatch(actions.findProfileCompleted(fresh));
        setFirstName(fresh.firstName ?? '');
        setLastName(fresh.lastName ?? '');
        setEmail(fresh.email ?? '');
        setFormation(fresh.formation ?? '');
        setAvatarUrl(fresh.avatarUrl ?? '');
        setHeightCm(fresh.heightCm ?? '');
        setWeightKg(fresh.weightKg ?? '');
        setGender(fresh.gender ?? '');
      },
      (errors) => showError(errors)
    );
  }, [user?.id, dispatch]);

  const onFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;

    if (!OK_TYPES.includes(f.type)) {
      showError({ errorCode: 'project.error.avatar.format' });
      e.target.value = '';
      return;
    }
    if (f.size > MAX_SIZE) {
      showError({ errorCode: 'project.error.avatar.size' });
      e.target.value = '';
      return;
    }

    // revoca blob anterior si lo hubiera
    if (avatarUrl?.startsWith('blob:')) {
      try { URL.revokeObjectURL(avatarUrl); } catch {}
    }

    setFile(f);
    const localUrl = URL.createObjectURL(f);
    setAvatarUrl(localUrl);
    e.target.value = '';
  };

  const onClearAvatar = () => {
    setAvatarUrl('');
    setFile(null);
  };

  let form;

  async function fileToBase64Bytes(file) {
    const arrayBuffer = await file.arrayBuffer();
    let binary = '';
    const bytes = new Uint8Array(arrayBuffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary); 
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (form.checkValidity()) {
      const payload = {
        id: user.id,
        firstName: firstName.trim(),
        lastName:  lastName.trim(),
        email:     email.trim(),
        role:      user.role,            
        formation: (formation ?? '').trim()
      };
      // Optional physical data
      const h = String(heightCm).trim();
      const w = String(weightKg).trim();
      if (h !== '') payload.heightCm = Number(h);
      if (w !== '') payload.weightKg = Number(w);
      const g = String(gender || '').trim();
      if (g !== '') payload.gender = g.toUpperCase();
      
      if (file) {
        payload.avatarImage = await fileToBase64Bytes(file);
        payload.avatarImageType = file.type;
      }

      
      const trimmed = (avatarUrl ?? '').trim();
      const isExternal = /^https?:\/\//i.test(trimmed);
      if (trimmed === '' || isExternal) {
        payload.avatarUrl = trimmed;
      }
      // Si hay archivo, NO ponemos avatarUrl para no sobreescribir el BLOB.

      backend.userService.updateProfile(
        payload,
        (updatedUser) => {
            let url = updatedUser.avatarUrl || '';
            if (!url && file) {
            const base = window.location.origin.replace(':3000', ':8080'); // dev
            url = `${base}/trainium/users/${updatedUser?.id ?? user.id}/avatar`;
            }

            const needsBuster = /^https?:\/\//i.test(url);
            let realUrl = url;
            if (needsBuster) {
              const separator = url.includes('?') ? '&' : '?';
              realUrl = `${url}${separator}v=${Date.now()}`;
            }

            dispatch(actions.updateProfileCompleted({ ...updatedUser, avatarUrl: realUrl }));
            setAvatarUrl(realUrl);
            showSuccess(intl.formatMessage({
            id: 'project.profile.updated.message',
            defaultMessage: 'Tu perfil se ha actualizado correctamente'
            }));
            navigate('/users/view-profile');
        },
        (errors) => { showError(errors); }
    );
    } else {
      form.classList.add('was-validated');
    }
  };

  return (
    <div className="container signup-container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-10 col-lg-10 col-xl-9">
          <div className="card bg-white border-0 shadow-lg auth-card-dark p-5 rounded-5">
            <h2 className="card-header text-center mb-0">
              <FormattedMessage id="project.profile.update.title" defaultMessage="Actualizar perfil"/>
            </h2>
            <div className="card-body">
              <form ref={node => form = node} className="needs-validation" noValidate onSubmit={handleSubmit}>
                
                {/* Avatar + Popover de controles */}
                <div className="form-group">
                  <label className="form-label d-block">
                    <FormattedMessage id="project.profile.avatar" defaultMessage="Avatar" />
                  </label>

                  <div className={`avatar-center ${controlsOpen ? 'opened' : ''}`} style={{ '--avatar-size': '160px' }}>
                    <div ref={wrapperRef} className="avatar-wrapper">
                      <button
                        type="button"
                        className="avatar-preview clickable"
                        style={{
                          display: 'block',
                          marginBottom: 64,
                          borderRadius: '50%',
                          width: 160,
                          height: 160,
                          overflow: 'hidden',
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          cursor: 'pointer'
                        }}
                        aria-haspopup="dialog"
                        aria-expanded={controlsOpen}
                        onClick={() => setControlsOpen(v => !v)}
                      >
                        <Avatar seed={user?.avatarSeed || user?.userName} url={previewUrl} size={160} />
                      </button>
                      {controlsOpen && (
                        <dialog
                          ref={controlsRef}
                          className="avatar-controls-popover"
                          aria-label="Opciones de avatar"
                          open={controlsOpen}
                        >
                          <div className="form-group mb-2">
                            <label htmlFor="avatarUrl" className="form-label mb-1">Avatar URL</label>
                            <input
                              id="avatarUrl"
                              type="url"
                              className="form-control"
                              placeholder="https://example.com/avatar.png"
                              value={avatarUrl}
                              onChange={(e) => {
                                setAvatarUrl(e.target.value);
                                if (file) setFile(null);
                              }}
                            />
                          </div>

                          <div className="d-flex align-items-center gap-2 mb-2">
                            <button
                              type="button"
                              className="btn btn-secondary mr-2"
                              onClick={openFilePicker}
                            >
                              Subir imagen
                            </button>
                            <button type="button" className="btn btn-link p-0" onClick={onClearAvatar}>
                              Quitar avatar
                            </button>
                          </div>

                          <small className="text-muted">
                            Formatos: PNG, JPG, JPEG, WEBP, GIF, SVG · Máx. 16 MB
                          </small>

                          <input
                            ref={fileInputRef}
                            type="file"
                            accept={OK_TYPES.join(',')}
                            style={{ display: 'none' }}
                            onChange={onFileChange}
                          />
                        </dialog>
                      )}
                    </div>
                  </div>
                </div>

                {/* Fila 1: First Name - Last Name */}
                <div className="form-row">
                  <div className="col-md-6 mb-3">
                    <div className="md-input">
                      <input type="text" id="firstName" className="form-control md-control shadow-sm"
                             placeholder=" " value={firstName}
                             onChange={e => setFirstName(e.target.value)} autoFocus required />
                      <label htmlFor="firstName">
                        <FormattedMessage id="project.profile.firstName" defaultMessage="Nombre" />
                      </label>
                      <div className="invalid-feedback">
                        <FormattedMessage id="project.login.requiredField" defaultMessage="Campo obligatorio"/>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 mb-3">
                    <div className="md-input">
                      <input type="text" id="lastName" className="form-control md-control shadow-sm"
                             placeholder=" " value={lastName}
                             onChange={e => setLastName(e.target.value)} required />
                      <label htmlFor="lastName">
                        <FormattedMessage id="project.profile.lastName" defaultMessage="Apellidos"/>
                      </label>
                      <div className="invalid-feedback">
                        <FormattedMessage id="project.login.requiredField" defaultMessage="Campo obligatorio"/>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div className="form-row">
                  <div className="col-md-12 mb-3">
                    <div className="md-input">
                      <input type="email" id="email" className="form-control md-control shadow-sm"
                             placeholder=" " value={email}
                             onChange={e => setEmail(e.target.value)} required />
                      <label htmlFor="email">
                        <FormattedMessage id="project.profile.email" defaultMessage="Correo electrónico"/>
                      </label>
                      <div className="invalid-feedback">
                        <FormattedMessage id="project.profile.email.invalid" defaultMessage="Correo electrónico no válido"/>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Formation (opcional) */}
                {user.formation && (
                  <div className="form-row">
                    <div className="col-md-12 mb-3">
                      <div className="md-input">
                        <input type="text" id="formation" className="form-control md-control shadow-sm"
                               placeholder=" " value={formation ?? ''}
                               onChange={e => setFormation(e.target.value)} required />
                        <label htmlFor="formation">
                          <FormattedMessage id="project.profile.formation" defaultMessage="Formación"/>
                        </label>
                        <div className="invalid-feedback">
                          <FormattedMessage id="project.login.requiredField" defaultMessage="Campo obligatorio"/>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Height and Weight */}
                <div className="form-row">
                  <div className="col-md-6 mb-3">
                    <div className="md-input">
                      <input type="number" min="50" max="300" step="0.1" id="heightCm" className="form-control md-control shadow-sm"
                             placeholder=" " value={heightCm}
                             onChange={e => setHeightCm(e.target.value)} />
                      <label htmlFor="heightCm">
                        <FormattedMessage id="project.profile.heightCm" defaultMessage="Altura (cm)" />
                      </label>
                    </div>
                  </div>
                  <div className="col-md-6 mb-3">
                    <div className="md-input">
                      <input type="number" min="20" max="500" step="0.1" id="weightKg" className="form-control md-control shadow-sm"
                             placeholder=" " value={weightKg}
                             onChange={e => setWeightKg(e.target.value)} />
                      <label htmlFor="weightKg">
                        <FormattedMessage id="project.profile.weightKg" defaultMessage="Peso (kg)" />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Gender */}
                <div className="form-row">
                  <div className="col-md-12 mb-1">
                    <div className={`md-input ${gender ? 'has-value' : ''}`}>
                      <select
                        id="gender"
                        className="form-select md-control shadow-sm"
                        value={gender}
                        onChange={e => setGender(e.target.value)}
                      >
                        <option value="">Seleccionar...</option>
                        <option value="MALE">{intl.formatMessage({id:'project.profile.gender.value.MALE', defaultMessage:'Hombre'})}</option>
                        <option value="FEMALE">{intl.formatMessage({id:'project.profile.gender.value.FEMALE', defaultMessage:'Mujer'})}</option>
                        <option value="OTHER">{intl.formatMessage({id:'project.profile.gender.value.OTHER', defaultMessage:'Otro'})}</option>
                      </select>
                      <label htmlFor="gender">
                        <FormattedMessage id="project.profile.gender" defaultMessage="Género" />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="form-row mt-2">
                  <div className="col-md-12">
                    <Button type="submit" variant="primary" icon="fa-save" fullWidth>
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

export default UpdateProfile;
