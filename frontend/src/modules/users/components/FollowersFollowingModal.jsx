import { useEffect, useRef } from 'react';
import { Button, LoadingSpinner } from '../../common';
import UsersTable from '../../routines/components/UsersTable';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';

const FollowersFollowingModal = ({ type, users, loading, onClose, isOwnProfile = false }) => {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && typeof dialog.showModal === 'function') {
      dialog.showModal();
    }
    return () => {
      if (dialog && typeof dialog.close === 'function') {
        dialog.close();
      }
    };
  }, []);

  const handleClose = () => {
    const dialog = dialogRef.current;
    if (dialog && typeof dialog.close === 'function') {
      dialog.close();
    }
    onClose();
  };

  const titleId = type === 'followers' ? 'project.profile.followers.title' : 'project.profile.following.title';
  const emptyId = (() => {
    if (isOwnProfile) {
      return type === 'followers'
        ? 'project.profile.followers.empty'
        : 'project.profile.following.empty';
    }
    return type === 'followers'
      ? 'project.profile.followers.empty.other'
      : 'project.profile.following.empty.other';
  })();

  // Extraer la operación ternaria anidada
  const renderBodyContent = () => {
    if (loading) {
      return (
        <div className="text-center py-4">
          <LoadingSpinner overlay={false} size="sm" message="" />
        </div>
      );
    }
    
    if (users && users.length > 0) {
      return <UsersTable list={users} onNavigate={() => handleClose()} />;
    }
    
    return (
      <div className="text-center text-muted py-4">
        <FormattedMessage id={emptyId} defaultMessage={type === 'followers' ? 'Aún no tienes seguidores.' : 'Aún no sigues a nadie.'} />
      </div>
    );
  };

  return (
    <div className="saved-users-popup-backdrop">
      <dialog
        ref={dialogRef}
        className="saved-users-popup"
        aria-modal="true"
        aria-labelledby="followers-following-modal-title"
      >
        <div className="popup-header d-flex justify-content-between align-items-center">
          <h5 id="followers-following-modal-title" className="m-0">
            <FormattedMessage id={titleId} defaultMessage={type === 'followers' ? 'Seguidores' : 'Seguidos'} />
          </h5>
          <Button variant="ghost" icon="fa-times" onClick={handleClose} ariaLabel="Cerrar">
            Cerrar
          </Button>
        </div>
        <div className="popup-body">
          {renderBodyContent()}
        </div>
      </dialog>
    </div>
  );
};

FollowersFollowingModal.propTypes = {
  type: PropTypes.oneOf(['followers', 'following']).isRequired,
  users: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      userName: PropTypes.string.isRequired,
      avatarUrl: PropTypes.string,
      avatarSeed: PropTypes.string
    })
  ),
  loading: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  isOwnProfile: PropTypes.bool
};

export default FollowersFollowingModal;
