import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import axios from 'axios';

interface PlatformContextType {
  platformName: string;
  platformTagline: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  isLoading: boolean;
  refreshSettings: () => void;
}

const defaultContext: PlatformContextType = {
  platformName: 'MOLANG',
  platformTagline: 'Learning Management System',
  logoUrl: null,
  faviconUrl: null,
  maintenanceMode: false,
  maintenanceMessage: 'System under maintenance.',
  isLoading: true,
  refreshSettings: () => {},
};

const PlatformContext = createContext<PlatformContextType>(defaultContext);

export const usePlatform = () => useContext(PlatformContext);

interface ProviderProps {
  children: ReactNode;
}

export function PlatformProvider({ children }: ProviderProps) {
  const [settings, setSettings] = useState(defaultContext);

  const fetchSettings = async () => {
    try {
      const response = await axios.get('/api/v1/public/settings');
      if (response.data?.data) {
        const data = response.data.data;
        const newSettings = {
          platformName: data.platform_name || 'MOLANG',
          platformTagline: data.platform_tagline || 'Learning Management System',
          logoUrl: data.logo || null,
          faviconUrl: data.favicon || null,
          maintenanceMode: data.maintenance_mode === '1' || data.maintenance_mode === 'true',
          maintenanceMessage: data.maintenance_message || 'System under maintenance.',
          isLoading: false,
          refreshSettings: fetchSettings,
        };
        setSettings(newSettings);

        // Update Document Title
        if (data.platform_name) {
          document.title = data.platform_name;
        }

        // Update Favicon
        if (data.favicon) {
          let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
          if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
          }
          link.href = data.favicon;
        }
      }
    } catch (error) {
      console.error('Failed to load platform settings', error);
      setSettings((prev) => ({ ...prev, isLoading: false }));
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <PlatformContext.Provider value={settings}>
      {/* Jika maintenance mode aktif, dan tidak di rute admin/login, kita bisa blokir di tingkat routing atau di sini */}
      {/* Untuk saat ini, kita berikan data ke layout agar layout yang menangani maintenance mode */}
      {children}
    </PlatformContext.Provider>
  );
}
