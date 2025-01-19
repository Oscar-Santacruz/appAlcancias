import React, { useState, useRef, useEffect } from 'react';
import { Upload, RotateCw, RefreshCw, Palette, Instagram, MessageSquare, Download, Camera } from 'lucide-react';
import html2canvas from 'html2canvas';
import planAhorro from './naruto.png';
import ImageTest from './ImageTest';
import ImageService from './services/imageService';
import CookieConsent from './components/CookieConsent';
import ConsentService from './services/consentService';
import type { ConsentSettings } from './types/consent';

interface CubeState {
  rotateX: number;
  rotateY: number;
  rotateZ: number;
  scale: number;
  translateX: number;
  translateY: number;
  autoRotateSpeed: number;
  isAutoRotating: boolean;
}

interface TouchInfo {
  initialDistance: number;
  initialScale: number;
}

function App() {
  const [showCookieConsent, setShowCookieConsent] = useState(false);
  const [showImageTest, setShowImageTest] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [cubeColor, setCubeColor] = useState('#C9802C'); 
  const [meta, setMeta] = useState('');
  const [meses, setMeses] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cubeRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDraggingRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  const touchInfoRef = useRef<TouchInfo | null>(null);

  const [cubeState, setCubeState] = useState<CubeState>({
    rotateX: -20,
    rotateY: 0,
    rotateZ: 0,
    scale: 1,
    translateX: 0,
    translateY: 0,
    autoRotateSpeed: 1,
    isAutoRotating: true
  });

  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      if (cubeState.isAutoRotating) {
        setCubeState(prev => ({
          ...prev,
          rotateY: prev.rotateY + (deltaTime * 0.05 * prev.autoRotateSpeed)
        }));
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [cubeState.isAutoRotating, cubeState.autoRotateSpeed]);

  useEffect(() => {
    // Cleanup function para revocar URLs de objetos al desmontar
    return () => {
      if (imageUrl) {
        ImageService.getInstance().revokeObjectURL(imageUrl);
      }
    };
  }, []);

  useEffect(() => {
    const consentService = ConsentService.getInstance();
    if (!consentService.hasValidConsent()) {
      setShowCookieConsent(true);
    } else {
      const consent = consentService.getConsent();
      if (consent?.analytics) {
        initializeAnalytics();
      }
    }
  }, []);

  const handleConsentAccept = (settings: ConsentSettings) => {
    const consentService = ConsentService.getInstance();
    consentService.saveConsent(settings);
    setShowCookieConsent(false);
    
    if (settings.analytics) {
      initializeAnalytics();
    }
  };

  const handleConsentDecline = () => {
    const consentService = ConsentService.getInstance();
    consentService.saveConsent({
      analytics: false,
      necessary: true,
      timestamp: Date.now()
    });
    setShowCookieConsent(false);
  };

  const initializeAnalytics = () => {
    // @ts-ignore
    window.gtag('js', new Date());
    // @ts-ignore
    window.gtag('config', 'G-LVFQ9RQXFJ', {
      'cookie_domain': 'burbujapy.store',
      'debug_mode': false,
      'send_page_view': true,
      'allow_google_signals': true,
      'allow_ad_personalization_signals': true
    });
  };

  // Mouse Events
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;

    const deltaX = e.clientX - lastMousePosRef.current.x;
    const deltaY = e.clientY - lastMousePosRef.current.y;

    setCubeState(prev => ({
      ...prev,
      rotateY: prev.rotateY + deltaX * 0.5,
      rotateX: prev.rotateX + deltaY * 0.5
    }));

    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // Touch Events
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      isDraggingRef.current = true;
      lastMousePosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else if (e.touches.length === 2) {
      // Initialize pinch-to-zoom
      const distance = getTouchDistance(e.touches[0], e.touches[1]);
      touchInfoRef.current = {
        initialDistance: distance,
        initialScale: cubeState.scale
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault(); // Prevent scrolling while interacting with cube

    if (e.touches.length === 1 && isDraggingRef.current) {
      const deltaX = e.touches[0].clientX - lastMousePosRef.current.x;
      const deltaY = e.touches[0].clientY - lastMousePosRef.current.y;

      setCubeState(prev => ({
        ...prev,
        rotateY: prev.rotateY + deltaX * 0.5,
        rotateX: prev.rotateX + deltaY * 0.5
      }));

      lastMousePosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else if (e.touches.length === 2 && touchInfoRef.current) {
      // Handle pinch-to-zoom
      const currentDistance = getTouchDistance(e.touches[0], e.touches[1]);
      const scale = (currentDistance / touchInfoRef.current.initialDistance) * touchInfoRef.current.initialScale;
      
      setCubeState(prev => ({
        ...prev,
        scale: Math.max(0.5, Math.min(2, scale))
      }));
    }
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
    touchInfoRef.current = null;
  };

  const getTouchDistance = (touch1: Touch, touch2: Touch) => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setCubeState(prev => ({
      ...prev,
      scale: Math.max(0.5, Math.min(2, prev.scale - e.deltaY * 0.001))
    }));
  };

  const resetCube = () => {
    setCubeState({
      rotateX: -20,
      rotateY: 0,
      rotateZ: 0,
      scale: 1,
      translateX: 0,
      translateY: 0,
      autoRotateSpeed: 1,
      isAutoRotating: true
    });
    setImageUrl(null); 
    setCubeColor('#C9802C'); 
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageService = ImageService.getInstance();
      
      // Revocar URL anterior si existe
      if (imageUrl) {
        imageService.revokeObjectURL(imageUrl);
      }

      const result = await imageService.validateAndProcessImage(file);
      if (result.isValid && result.url) {
        setImageUrl(result.url);
        setImageError(null);
      } else {
        setImageError(result.error || 'Error al procesar la imagen');
      }
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = async (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      const imageService = ImageService.getInstance();
      
      // Revocar URL anterior si existe
      if (imageUrl) {
        imageService.revokeObjectURL(imageUrl);
      }

      const result = await imageService.validateAndProcessImage(file);
      if (result.isValid && result.url) {
        setImageUrl(result.url);
        setImageError(null);
      } else {
        setImageError(result.error || 'Error al procesar la imagen');
      }
    }
  };

  const formatNumber = (num: string) => {
    return num.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const handleMetaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setMeta(formatNumber(value));
  };

  const handleMesesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (parseInt(value) <= 60) {
      setMeses(value);
    }
  };

  const handleDownload = async () => {
    const cubeElement = document.querySelector('.cube-container');
    if (!cubeElement || !(cubeElement instanceof HTMLElement)) return;
    
    try {
      // Guardamos la rotación actual
      const currentTransform = cubeRef.current?.style.transform;
      
      // Detenemos la rotación automática temporalmente
      setCubeState(prev => ({ ...prev, isAutoRotating: false }));
      
      // Esperamos un momento para asegurar que la rotación se detuvo
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const canvas = await html2canvas(cubeElement, {
        backgroundColor: null,
        scale: 2, // Mejor calidad
        logging: false,
        useCORS: true,
        allowTaint: true,
        onclone: (clonedDoc) => {
          // Ajustamos el elemento clonado para asegurar que capture bien
          const clonedCube = clonedDoc.querySelector('.cube-container');
          if (clonedCube instanceof HTMLElement) {
            clonedCube.style.transform = 'none';
            clonedCube.style.margin = '0';
          }
        }
      });
      
      // Restauramos la rotación automática si estaba activa
      if (cubeState.isAutoRotating) {
        setCubeState(prev => ({ ...prev, isAutoRotating: true }));
      }
      
      const link = document.createElement('a');
      link.download = 'mi-alcancia-3d.png';
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error al generar la imagen:', error);
      alert('Hubo un error al generar la imagen. Por favor intenta de nuevo.');
    }
  };

  const handleWhatsAppClick = async () => {
    if (!meta || !meses) {
      alert('Por favor, ingresa el monto y los meses de ahorro');
      return;
    }

    const mensualidad = parseInt(meta.replace(/\./g, '')) / parseInt(meses);
    const message = `¡Hola! Me interesa una alcancía personalizada 🐷\n\n` +
                   `Meta de ahorro: Gs. ${meta}\n` +
                   `Plazo: ${meses} meses\n` +
                   `Ahorro mensual: Gs. ${formatNumber(Math.ceil(mensualidad).toString())}\n\n` +
                   `¿Me pueden ayudar a hacer realidad mi meta de ahorro? 🎯`;

    const whatsappUrl = `https://wa.me/595985601514?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleScreenshot = async () => {
    const mainContainer = document.querySelector('.min-h-screen');
    if (!mainContainer || !(mainContainer instanceof HTMLElement)) return;
    
    try {
      // Detenemos la rotación automática temporalmente
      const wasRotating = cubeState.isAutoRotating;
      setCubeState(prev => ({ ...prev, isAutoRotating: false }));
      
      // Esperamos un momento para asegurar que la rotación se detuvo
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const canvas = await html2canvas(mainContainer, {
        scale: 3, // Aumentamos la escala para mejor calidad
        logging: false,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        removeContainer: true,
        foreignObjectRendering: true,
        imageTimeout: 0,
        onclone: (clonedDoc) => {
          // Aseguramos que los estilos se mantienen en el clon
          const clonedElement = clonedDoc.querySelector('.min-h-screen');
          if (clonedElement instanceof HTMLElement) {
            clonedElement.style.width = '100%';
            clonedElement.style.height = '100%';
          }
        }
      });
      
      // Restauramos la rotación automática si estaba activa
      if (wasRotating) {
        setCubeState(prev => ({ ...prev, isAutoRotating: true }));
      }
      
      const link = document.createElement('a');
      link.download = 'alcancia-screenshot.png';
      link.href = canvas.toDataURL('image/png', 1.0); // Máxima calidad
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error al capturar la pantalla:', error);
      alert('Hubo un error al capturar la pantalla. Por favor intenta de nuevo.');
    }
  };

  const cubeStyle = {
    transform: `
      translateX(${cubeState.translateX}px)
      translateY(${cubeState.translateY}px)
      scale(${cubeState.scale})
      rotateX(${cubeState.rotateX}deg)
      rotateY(${cubeState.rotateY}deg)
      rotateZ(${cubeState.rotateZ}deg)
    `
  };

  if (showImageTest) {
    return (
      <div>
        <ImageTest />
        <button
          onClick={() => setShowImageTest(false)}
          className="fixed top-4 left-4 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white"
        >
          Volver a la Alcancía
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-blue-900 flex items-center justify-center p-4">
      {showCookieConsent && (
        <CookieConsent
          onAccept={handleConsentAccept}
          onDecline={handleConsentDecline}
        />
      )}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 sm:p-8 w-full max-w-4xl">
        <div className="flex flex-col items-center space-y-6">
          {/* Inputs de Meta y Meses al inicio */}
          <div className="w-full max-w-sm space-y-4">
            <div>
              <label className="block text-white mb-2">Meta de Ahorro</label>
              <input
                type="text"
                placeholder="Meta de ahorro (Gs.)"
                value={meta}
                onChange={handleMetaChange}
                className="w-full px-4 py-2 bg-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>
            <div>
              <label className="block text-white mb-2">Plazo de Ahorro</label>
              <input
                type="text"
                placeholder="Meses (máx. 60)"
                value={meses}
                onChange={handleMesesChange}
                className="w-full px-4 py-2 bg-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>
            {meta && meses && (
              <div className="bg-white/10 p-4 rounded-lg">
                <p className="text-white text-sm">
                  Ahorro mensual sugerido: Gs. {formatNumber(Math.ceil(parseInt(meta.replace(/\./g, '')) / parseInt(meses)).toString())}
                </p>
              </div>
            )}
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            style={{ display: 'none' }}
          />

          {/* Cubo */}
          <div className="cube-container mb-8">
            <div 
              className="perspective"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onWheel={handleWheel}
            >
              <div 
                ref={cubeRef}
                className="cube"
                style={cubeStyle}
              >
                {[...Array(6)].map((_, index) => {
                  const getFaceName = (index: number) => {
                    switch(index) {
                      case 0: return "Frente";
                      case 1: return "Atrás";
                      case 2: return "Derecha";
                      case 3: return "Izquierda";
                      case 4: return "Arriba";
                      case 5: return "Base";
                      default: return "";
                    }
                  };

                  return (
                    <div
                      key={index}
                      className={`cube-face cube-face-${index + 1}`}
                      style={{
                        backgroundImage: index !== 1 && index !== 5 ? 
                          (imageUrl ? `url(${imageUrl})` : 'none') : 'none',
                        backgroundColor: index === 5 ? '#C9802C' : (!imageUrl ? cubeColor : 'transparent'),
                      }}
                    >
                      {index === 1 && (
                        <div className="absolute inset-0 w-full h-full">
                          {imageUrl && (
                            <img 
                              src={imageUrl} 
                              alt="Fondo seleccionado" 
                              className="w-full h-full object-cover absolute inset-0"
                            />
                          )}
                          <img 
                            src={planAhorro} 
                            alt="Plan de Ahorro" 
                            className="w-full h-full object-contain absolute inset-0"
                          />
                        </div>
                      )}
                      <span className="face-label">{getFaceName(index)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Botones de control */}
          <div className="flex gap-4 w-full max-w-sm">
            <button
              onClick={() => setCubeState(prev => ({ ...prev, isAutoRotating: !prev.isAutoRotating }))}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
            >
              <RotateCw size={24} />
              <span>{cubeState.isAutoRotating ? 'Detener' : 'Rotar'}</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
            >
              <Upload size={18} />
              <span>Personaliza</span>
            </button>
          </div>

          {/* Botones de redes sociales */}
          <div className="flex gap-4 w-full max-w-sm">
            <button
              onClick={() => window.open('https://www.instagram.com/burbujapy/', '_blank')}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCAF45] hover:from-[#9B4DCA] hover:via-[#FD3535] hover:to-[#FCB75E] rounded-lg text-white transition-colors"
            >
              <Instagram size={24} />
              <span>Sígueme</span>
            </button>

            <button
              onClick={handleWhatsAppClick}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#25D366] hover:bg-[#128C7E] rounded-lg text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824zm-3.423-14.416c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm.029 18.88c-1.161 0-2.305-.292-3.318-.844l-3.677.964.984-3.595c-.607-1.052-.927-2.246-.926-3.468.001-3.825 3.113-6.937 6.937-6.937 1.856.001 3.598.723 4.907 2.034 1.31 1.311 2.031 3.054 2.03 4.908-.001 3.825-3.113 6.938-6.937 6.938z"/>
              </svg>
              <span>Escríbeme</span>
            </button>
          </div>
        </div>
      </div>

      {imageError && (
        <div className="error-message">
          {imageError}
        </div>
      )}
    </div>
  );
}

export default App;