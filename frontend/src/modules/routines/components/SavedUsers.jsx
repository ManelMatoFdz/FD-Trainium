import { useState, useEffect } from 'react';
import { Button, LoadingSpinner } from '../../common';
import UsersTable from './UsersTable';
import backend from '../../../backend';
import PropTypes from "prop-types";
import { toast } from "react-toastify";

const SavedUsers = ({ routineId, onClose }) => {
    const [visible, setVisible] = useState(false);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUsers = async () => {
            setLoading(true);
            try {
                const response = await backend.routineService.getUsersWhoSavedRoutine(routineId);
                if (response.ok && response.payload) {
                    setUsers(response.payload.items || []);
                } else {
                    setUsers([]);
                    toast.error("No se pudieron cargar los usuarios de esta rutina.");
                }
            } catch (error) {
                setUsers([]);
                toast.error("Error cargando usuarios que guardaron la rutina.");
                console.error(error);
            }
            setLoading(false);
        };
        loadUsers();
    }, [routineId]);

    useEffect(() => {
        const timeout = setTimeout(() => setVisible(true), 300);
        return () => clearTimeout(timeout);
    }, []);

    const handleClose = () => {
        setVisible(false);
        setTimeout(onClose, 300);
    };

    return (
        <div className="saved-users-popup-backdrop">
            <div className={`saved-users-popup ${visible ? 'slide-up' : 'slide-down'}`}>
                <div className="popup-header d-flex justify-content-between align-items-center">
                    <h5>Usuarios que guardaron esta rutina</h5>
                    <Button
                        variant="ghost"
                        icon="fa-times"
                        iconOnly
                        onClick={handleClose}
                        ariaLabel="Cerrar"
                    >
                        Cerrar
                    </Button>
                </div>
                <div className="popup-body">
                    {loading ? (
                            <div className="text-center py-4">
                                <LoadingSpinner overlay={false} size="sm" message="" />
                            </div>
                        ) : (
                            <UsersTable list={users} />
                        )}
                </div>
            </div>
        </div>
    );
};

SavedUsers.propTypes = {
    routineId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    onClose: PropTypes.func.isRequired,
};

export default SavedUsers;