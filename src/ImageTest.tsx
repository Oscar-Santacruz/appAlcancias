import React, { useState, useRef } from 'react';
import planAhorro from './naruto.png';
import { Upload } from 'lucide-react';

function ImageTest() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-blue-900 p-8">
      <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-lg rounded-xl p-8">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">Prueba de Superposición de Imágenes</h1>
        
        {/* Área de carga de imagen */}
        <div className="mb-8">
          <div 
            className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-white/30 rounded-lg cursor-pointer hover:border-white/50 transition-colors mb-4"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 text-white mb-4" />
            <p className="text-white text-center mb-2">
              Toca para subir o arrastra y suelta
            </p>
            <p className="text-white/60 text-sm">
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
        </div>

        {/* Visualización de imágenes superpuestas */}
        <div className="space-y-4">
          <h2 className="text-xl text-white font-semibold">Resultado con Superposición</h2>
          <div className="aspect-square bg-white/5 rounded-lg overflow-hidden relative">
            {selectedImage && (
              <img 
                src={selectedImage} 
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
        </div>

        {/* Vista previa de imágenes individuales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          <div className="space-y-4">
            <h2 className="text-xl text-white font-semibold">Plan de Ahorro</h2>
            <div className="aspect-square bg-white/5 rounded-lg overflow-hidden">
              <img 
                src={planAhorro} 
                alt="Plan de Ahorro" 
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl text-white font-semibold">Imagen de Fondo</h2>
            <div className="aspect-square bg-white/5 rounded-lg overflow-hidden">
              {selectedImage ? (
                <img 
                  src={selectedImage} 
                  alt="Fondo seleccionado" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/50">
                  No hay imagen seleccionada
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ImageTest;
