import { useState, useEffect} from "react";
import PropTypes from 'prop-types';
import { toast } from "react-toastify";
import backend from "../../../backend";
import {Button} from "../../common";

/**
 * FollowButton - Botón para seguir/dejar de seguir a un usuario
 * @param {Object} props
 * @param {number} props.userId - ID del usuario a seguir/dejar de seguir
 * @param {function} props.onFollowChange - Callback opcional cuando cambia el estado (recibe isFollowing)
 */
const FollowButton = ({ userId, onFollowChange, buttonStyle = {}, buttonVariant = 'success' }) => {
    const [isFollowing, setIsFollowing] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) return;

        // Verificar si ya estamos siguiendo a este usuario
        backend.userService.isFollowingUser(
            userId,
            (response) => {
                setIsFollowing(response);
                setLoading(false);
            },
            (err) => {
                console.error("Error al verificar estado de seguimiento:", err);
                setLoading(false);
            }
        );
    }, [userId]);

    const handleFollow = async () => {
        if (!userId || loading) return;
        setLoading(true);
        
        backend.userService.followUser(
            userId,
            () => {
                setIsFollowing(true);
                setLoading(false);
                toast.success("Ahora sigues a este usuario");
                if (onFollowChange) onFollowChange(true);
            },
            (err) => {
                console.error("Error al seguir usuario:", err);
                setLoading(false);
                toast.error("No se pudo seguir al usuario");
            }
        );
    };

    const handleUnfollow = async () => {
        if (!userId || loading) return;
        setLoading(true);
        
        backend.userService.unfollowUser(
            userId,
            () => {
                setIsFollowing(false);
                setLoading(false);
                toast.info("Has dejado de seguir a este usuario");
                if (onFollowChange) onFollowChange(false);
            },
            (err) => {
                console.error("Error al dejar de seguir usuario:", err);
                setLoading(false);
                toast.error("No se pudo dejar de seguir al usuario");
            }
        );
    };

    if (!userId) return null;

    const baseStyle = {
        borderRadius: 6,
        padding: '0.35rem 0.9rem',
        fontWeight: 600,
        ...(buttonStyle || {})
    };

    const followStyle = {
        backgroundColor: '#5bc0ff',
        borderColor: '#5bc0ff',
        color: '#fff',
        ...baseStyle
    };

    const unfollowStyle = {
        backgroundColor: '#f0f0f0',
        borderColor: '#dcdcdc',
        color: '#111',
        ...baseStyle
    };

    return isFollowing ? (
        <Button
            variant="outline"
            size="sm"
            onClick={handleUnfollow}
            disabled={loading}
            icon="fa-user-minus"
            style={unfollowStyle}
        >
            Dejar de seguir
        </Button>
    ) : (
        <Button
            variant={buttonVariant}
            size="sm"
            onClick={handleFollow}
            disabled={loading}
            icon="fa-user-plus"
            style={followStyle}
        >
            Seguir
        </Button>
    );
};

FollowButton.propTypes = {
    userId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    onFollowChange: PropTypes.func,
    buttonStyle: PropTypes.object,
    buttonVariant: PropTypes.string
};

export default FollowButton;
