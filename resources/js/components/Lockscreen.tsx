import { useState, useEffect, type FormEvent } from 'react';
import { useLockscreen } from '@/context/LockscreenContext';
import { useAuth } from '@/context';
import { Lock, Mail, AlertCircle } from 'lucide-react';

export function Lockscreen() {
  const { isLocked, unlock } = useLockscreen();
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isUnlocking, setIsUnlocking] = useState(false);

  // Focus email input when lockscreen appears
  useEffect(() => {
    if (isLocked) {
      const input = document.getElementById('lockscreen-email');
      if (input) {
        setTimeout(() => input.focus(), 100);
      }
    }
  }, [isLocked]);

  // Reset form when lockscreen appears
  useEffect(() => {
    if (isLocked) {
      setEmail('');
      setError('');
    }
  }, [isLocked]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsUnlocking(true);

    try {
      const success = await unlock(email);
      
      if (!success) {
        setError('Email tidak sesuai. Silakan masukkan email yang benar.');
        setEmail('');
      }
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsUnlocking(false);
    }
  };

  if (!isLocked || !user) return null;

  return (
    <div className="lockscreen-overlay">
      <div className="lockscreen-backdrop" />
      
      <div className="lockscreen-content">
        <div className="lockscreen-card">
          {/* Lock Icon */}
          <div className="lockscreen-icon">
            <Lock size={48} />
          </div>

          {/* User Info */}
          <div className="lockscreen-user">
            {user.avatar ? (
              <img 
                src={user.avatar} 
                alt={user.name}
                className="lockscreen-avatar"
              />
            ) : (
              <div className="lockscreen-avatar-placeholder">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <h2 className="lockscreen-name">{user.name}</h2>
            <p className="lockscreen-subtitle">Sesi Anda terkunci karena tidak aktif</p>
          </div>

          {/* Unlock Form */}
          <form onSubmit={handleSubmit} className="lockscreen-form">
            <div className="lockscreen-input-group">
              <Mail className="lockscreen-input-icon" size={20} />
              <input
                id="lockscreen-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Masukkan email Anda"
                className="lockscreen-input"
                required
                disabled={isUnlocking}
                autoComplete="email"
              />
            </div>

            {error && (
              <div className="lockscreen-error">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="lockscreen-button"
              disabled={isUnlocking}
            >
              {isUnlocking ? (
                <>
                  <span className="lockscreen-spinner" />
                  Membuka...
                </>
              ) : (
                'Buka Kunci'
              )}
            </button>
          </form>

          <p className="lockscreen-hint">
            Masukkan email Anda untuk melanjutkan
          </p>
        </div>
      </div>

      <style>{`
        .lockscreen-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 9999;
          animation: lockscreen-fade-in 0.3s ease-out;
        }

        @keyframes lockscreen-fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .lockscreen-backdrop {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }

        .lockscreen-content {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: 1.5rem;
        }

        .lockscreen-card {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.18);
          border-radius: 24px;
          padding: 3rem 2.5rem;
          max-width: 420px;
          width: 100%;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          animation: lockscreen-slide-up 0.4s ease-out;
        }

        @keyframes lockscreen-slide-up {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .lockscreen-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 80px;
          height: 80px;
          margin: 0 auto 2rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 50%;
          color: white;
          box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
        }

        .lockscreen-user {
          text-align: center;
          margin-bottom: 2rem;
        }

        .lockscreen-avatar,
        .lockscreen-avatar-placeholder {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          margin: 0 auto 1rem;
          border: 3px solid rgba(255, 255, 255, 0.2);
        }

        .lockscreen-avatar {
          object-fit: cover;
        }

        .lockscreen-avatar-placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          font-size: 2rem;
          font-weight: 600;
        }

        .lockscreen-name {
          font-size: 1.5rem;
          font-weight: 600;
          color: white;
          margin: 0 0 0.5rem;
        }

        .lockscreen-subtitle {
          font-size: 0.95rem;
          color: rgba(255, 255, 255, 0.7);
          margin: 0;
        }

        .lockscreen-form {
          margin-bottom: 1.5rem;
        }

        .lockscreen-input-group {
          position: relative;
          margin-bottom: 1rem;
        }

        .lockscreen-input-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(255, 255, 255, 0.5);
          pointer-events: none;
        }

        .lockscreen-input {
          width: 100%;
          padding: 0.875rem 1rem 0.875rem 3rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          color: white;
          font-size: 1rem;
          transition: all 0.3s ease;
        }

        .lockscreen-input::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }

        .lockscreen-input:focus {
          outline: none;
          background: rgba(255, 255, 255, 0.15);
          border-color: rgba(102, 126, 234, 0.5);
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .lockscreen-input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .lockscreen-error {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 8px;
          color: #fca5a5;
          font-size: 0.875rem;
          margin-bottom: 1rem;
          animation: lockscreen-shake 0.4s ease;
        }

        @keyframes lockscreen-shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }

        .lockscreen-button {
          width: 100%;
          padding: 0.875rem 1.5rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          border-radius: 12px;
          color: white;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .lockscreen-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }

        .lockscreen-button:active:not(:disabled) {
          transform: translateY(0);
        }

        .lockscreen-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .lockscreen-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: lockscreen-spin 0.6s linear infinite;
        }

        @keyframes lockscreen-spin {
          to { transform: rotate(360deg); }
        }

        .lockscreen-hint {
          text-align: center;
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.6);
          margin: 0;
        }

        @media (max-width: 640px) {
          .lockscreen-card {
            padding: 2rem 1.5rem;
          }

          .lockscreen-icon {
            width: 64px;
            height: 64px;
          }

          .lockscreen-icon svg {
            width: 32px;
            height: 32px;
          }

          .lockscreen-avatar,
          .lockscreen-avatar-placeholder {
            width: 64px;
            height: 64px;
          }

          .lockscreen-name {
            font-size: 1.25rem;
          }
        }
      `}</style>
    </div>
  );
}
