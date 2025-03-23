import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';

const useAuth = (requireAdmin = false) => {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('authToken');
    navigate('/');
  };

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        navigate('/');
        return;
      }

      try {
        const secureResponse = await client.get('/api/Account/secure', {
          headers: {
            Auth: token,
          },
        });

        if (secureResponse.status !== 200) {
          localStorage.removeItem('authToken');
          navigate('/');
          return;
        }

        if (requireAdmin) {
          const accessResponse = await client.get('/api/Account/access', {
            headers: {
              Auth: token,
            },
          });

          if (accessResponse.status === 200 && accessResponse.data === false) {
            navigate('/projects');
          }
        }
      } catch (error) {
        localStorage.removeItem('authToken');
        navigate('/');
      }
    };

    checkAuth();
  }, [navigate, requireAdmin]);

  return { logout };
};

export default useAuth;