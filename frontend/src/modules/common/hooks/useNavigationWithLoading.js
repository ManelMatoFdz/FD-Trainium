import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Hook personalizado para manejar la navegación con spinner de carga
 * 
 * @returns {object} - { navigateWithLoading, isLoading, loadingMessage }
 */
const useNavigationWithLoading = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Cargando...');
  const navigate = useNavigate();

  const navigateWithLoading = (path, message = 'Cargando...') => {
    if (!path) return;
    
    setLoadingMessage(message);
    setIsLoading(true);
    
    // Navegar inmediatamente
    navigate(path);
    setIsLoading(false);
  };

  // Limpiar el estado de carga si el componente se desmonta
  useEffect(() => {
    return () => {
      setIsLoading(false);
    };
  }, []);

  return {
    navigateWithLoading,
    isLoading,
    loadingMessage,
  };
};

export default useNavigationWithLoading;