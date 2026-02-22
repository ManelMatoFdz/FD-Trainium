import { FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import { Avatar } from '../../common';
import PropTypes from "prop-types";

const UsersTable = ({ list, onNavigate }) => {
    const navigate = useNavigate();

    const handleRowClick = (userId) => {
        navigate(`/users/${userId}`);
        if (typeof onNavigate === 'function') onNavigate(userId);
    };

    return (
        <div className="table-responsive mt-2">
            <table className="table table-hover routine-table-modern align-middle mb-0" data-testid="users-table">
                <thead>
                <tr>
                    <th><FormattedMessage id="project.users.table.avatar" defaultMessage="Avatar" /></th>
                    <th><FormattedMessage id="project.users.table.name" defaultMessage="Usuario" /></th>
                </tr>
                </thead>
                <tbody>
                {list && list.length > 0 ? (
                    list.map(u => (
                        <tr 
                            key={u.userName} 
                            onClick={() => handleRowClick(u.id)}
                            style={{ cursor: 'pointer' }}
                        >
                            <td>
                                <Avatar src={u.avatarUrl} seed={u.avatarSeed} size={40} />
                            </td>
                            <td>{u.userName}</td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="3" className="text-center text-muted py-4">
                            <FormattedMessage id="project.users.table.noUsers" defaultMessage="Ningún usuario ha guardado esta rutina." />
                        </td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>
    );
};

UsersTable.propTypes = {
    list: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.number.isRequired,
            userName: PropTypes.string.isRequired,
            avatarUrl: PropTypes.string,
            avatarSeed: PropTypes.string
        })
    ).isRequired
    ,
    onNavigate: PropTypes.func
};

UsersTable.defaultProps = {
    onNavigate: undefined
};

export default UsersTable;
