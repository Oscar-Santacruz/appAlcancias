import React, { useState } from 'react';
import { ConsentSettings, ConsentManagerProps } from '../types/consent';

const CookieConsent: React.FC<ConsentManagerProps> = ({ onAccept, onDecline }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [settings, setSettings] = useState<ConsentSettings>({
    analytics: true,
    necessary: true, // Siempre true ya que son necesarias
    timestamp: Date.now()
  });

  const handleAccept = () => {
    onAccept(settings);
  };

  const handleAcceptAll = () => {
    const allSettings: ConsentSettings = {
      analytics: true,
      necessary: true,
      timestamp: Date.now()
    };
    onAccept(allSettings);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg p-4 md:p-6 z-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">Respetamos tu privacidad</h3>
            <p className="text-gray-600 text-sm mb-2">
              Utilizamos cookies para mejorar tu experiencia y analizar el uso del sitio.
              Puedes elegir qué cookies aceptar. Las cookies necesarias no se pueden desactivar.
            </p>
            {showDetails && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.necessary}
                    disabled
                    className="mr-2"
                  />
                  <label className="text-sm text-gray-700">
                    Cookies necesarias (requeridas)
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.analytics}
                    onChange={(e) => setSettings({ ...settings, analytics: e.target.checked })}
                    className="mr-2"
                  />
                  <label className="text-sm text-gray-700">
                    Cookies analíticas (ayudan a mejorar el sitio)
                  </label>
                </div>
              </div>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 underline"
            >
              {showDetails ? 'Ocultar detalles' : 'Mostrar detalles'}
            </button>
            <button
              onClick={onDecline}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded"
            >
              Rechazar
            </button>
            <button
              onClick={handleAccept}
              className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded"
            >
              Aceptar selección
            </button>
            <button
              onClick={handleAcceptAll}
              className="px-4 py-2 text-sm text-white bg-green-600 hover:bg-green-700 rounded"
            >
              Aceptar todo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
