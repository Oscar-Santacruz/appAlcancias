import React, { useState, useRef, useEffect } from 'react';
import { Upload, RotateCw, RefreshCw, Palette, Instagram, MessageSquare, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import planAhorro from './naruto.png';
import ImageTest from './ImageTest';

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
  const [showImageTest, setShowImageTest] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImageUrl(url);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImageUrl(url);
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

  const captureImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return '';
    
    const context = canvas.getContext('2d');
    if (!context) return '';

    // Configurar canvas
    canvas.width = 800;
    canvas.height = 600;
    
    // Dibujar el contenido actual
    const cubeElement = document.querySelector('.cube-container');
    if (cubeElement instanceof HTMLElement) {
      const rect = cubeElement.getBoundingClientRect();
      context.fillStyle = 'white';
      context.fillRect(0, 0, canvas.width, canvas.height);
      
      await html2canvas(cubeElement).then(canvas => {
        context.drawImage(canvas, 0, 0);
      });
    }

    return canvas.toDataURL('image/png');
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

  const handleDownloadImage = async () => {
    const imageUrl = await captureImage();
    if (!imageUrl) return;

    const link = document.createElement('a');
    link.download = 'mi-alcancia-personalizada.png';
    link.href = imageUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 sm:p-8 w-full max-w-4xl">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8 text-center">Personaliza tu caja de ahorro!</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          <div className="space-y-4 sm:space-y-6 order-2 md:order-1">
            {/* Sección de Controles */}
            <div 
              className="flex flex-col items-center justify-center p-6 sm:p-8 border-2 border-dashed border-white/30 rounded-lg cursor-pointer hover:border-white/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <Upload className="w-10 h-10 sm:w-12 sm:h-12 text-white mb-4" />
              <p className="text-white text-center mb-2 text-sm sm:text-base">
                Toca para subir o arrastra y suelta
              </p>
              <p className="text-white/60 text-xs sm:text-sm">
                Soporta: JPG, PNG, WebP
              </p>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
            </div>

            {/* Botones de Control */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-4">
                <button
                  onClick={resetCube}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 active:bg-white/30 rounded-lg text-white transition-colors text-sm sm:text-base"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reiniciar
                </button>
                <button
                  onClick={() => setCubeState(prev => ({ ...prev, isAutoRotating: !prev.isAutoRotating }))}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 active:bg-white/30 rounded-lg text-white transition-colors text-sm sm:text-base"
                >
                  <RotateCw className="w-4 h-4" />
                  {cubeState.isAutoRotating ? 'Detener' : 'Rotar'}
                </button>
              </div>

              {/* Control de Velocidad */}
              <div className="space-y-2">
                <label className="text-white text-sm">Velocidad de Rotación</label>
                <input
                  type="range"
                  min="0.1"
                  max="3"
                  step="0.1"
                  value={cubeState.autoRotateSpeed}
                  onChange={(e) => setCubeState(prev => ({ ...prev, autoRotateSpeed: parseFloat(e.target.value) }))}
                  className="w-full"
                />
              </div>

              {/* Control de Color */}
              <div className="flex items-center gap-4">
                <Palette className="text-white w-4 h-4" />
                <input
                  type="color"
                  value={cubeColor}
                  onChange={(e) => setCubeColor(e.target.value)}
                  className="w-full h-10 sm:h-8 rounded cursor-pointer"
                />
              </div>

              {/* Campos de Meta y Meses */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-white text-sm">Meta de Ahorro (Gs.)</label>
                  <input
                    type="text"
                    value={meta}
                    onChange={handleMetaChange}
                    placeholder="Ejemplo: 1.000.000"
                    className="w-full px-4 py-2 bg-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/25"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-white text-sm">Plazo en Meses (máx. 60)</label>
                  <input
                    type="text"
                    value={meses}
                    onChange={handleMesesChange}
                    placeholder="Ejemplo: 12"
                    className="w-full px-4 py-2 bg-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/25"
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

              {/* Enlaces de contacto y descarga */}
              <div className="space-y-4">
                <div className="flex gap-4">
                  <a
                    href="https://www.instagram.com/burbuja_py/?hl=es"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg text-white transition-colors"
                  >
                    <Instagram className="w-5 h-5" />
                    Síguenos
                  </a>
                  <button
                    onClick={handleWhatsAppClick}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-lg text-white transition-colors"
                  >
                    <MessageSquare className="w-5 h-5" />
                    Contactar
                  </button>
                </div>

                <button
                  onClick={handleDownloadImage}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg text-white transition-colors"
                >
                  <Download className="w-5 h-5" />
                  Descargar Imagen
                </button>
              </div>
            </div>
          </div>

          {/* Vista Previa del Cubo 3D */}
          <div 
            className="perspective order-1 md:order-2"
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

        <div className="mt-6 sm:mt-8 text-white/70 text-xs sm:text-sm text-center">
          <p> Arrastra para rotar • Pellizca para zoom • Usa los controles para personalizar</p>
        </div>
      </div>
    </div>
  );
}

export default App;