import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import backend from '../../../backend';
import { Avatar, LoadingSpinner } from '../../common';
import { FormattedMessage } from 'react-intl';

const BlockedUsers = () => {
    const user = useSelector(state => state.users.user);
    const [blockedUsers, setBlockedUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user?.id) return;
        setLoading(true);
        backend.userService.getBlockedUsers(
            user.id,
            (list) => {
                setBlockedUsers(Array.isArray(list) ? list : []);
                setLoading(false);
            },
            () => {
                setBlockedUsers([]);
                setLoading(false);
            }
        );
    }, [user?.id]);

    const goToUser = (id) => navigate(`/users/${id}`);

    if (loading) {
        return (
            <div className="container mt-5 text-center">
                <LoadingSpinner overlay size="md" message="Cargando usuarios bloqueados..." />
            </div>
        );
    }

    return (
        <div className="container py-5">
            <h2 className="mb-4">
                <FormattedMessage id="project.header.blockedUsers" defaultMessage="Usuarios Bloqueados" />
            </h2>

            {blockedUsers.length === 0 ? (
                <p className="text-muted">
                    <FormattedMessage id="project.header.blockedUsers.empty" defaultMessage="No tienes usuarios bloqueados." />
                </p>
            ) : (
                <ul className="list-group">
                    {blockedUsers.map(u => (
                        <li key={u.id} className="list-group-item p-0">
                            <button
                                type="button"
                                className="list-group-item list-group-item-action d-flex align-items-center"
                                style={{ border: 'none', background: 'none', padding: '0.75rem 1rem', cursor: 'pointer' }}
                                onClick={() => goToUser(u.id)}
                            >
                                <Avatar seed={u.avatarSeed || u.userName} url={u.avatarUrl} size={36} />
                                <span className="ml-3">
                                    <strong>{u.userName}</strong>
                                    {u.firstName || u.lastName ? (
                                        <small className="text-muted ml-1">{[u.firstName, u.lastName].filter(Boolean).join(' ')}</small>
                                    ) : null}
                                </span>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default BlockedUsers;
