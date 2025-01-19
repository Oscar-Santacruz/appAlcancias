import { ImageValidationResult, ImageConfig, ProcessedImage } from '../types/image';

const DEFAULT_CONFIG: ImageConfig = {
  maxSizeInBytes: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  maxDimensions: {
    width: 4096,
    height: 4096
  }
};

class ImageService {
  private static instance: ImageService;
  private objectUrls: Set<string> = new Set();
  private config: ImageConfig;

  private constructor(config: ImageConfig = DEFAULT_CONFIG) {
    this.config = config;
  }

  public static getInstance(config?: ImageConfig): ImageService {
    if (!ImageService.instance) {
      ImageService.instance = new ImageService(config);
    }
    return ImageService.instance;
  }

  public async validateAndProcessImage(file: File): Promise<ImageValidationResult> {
    try {
      // Validar tipo de archivo
      if (!this.config.allowedTypes.includes(file.type)) {
        return {
          isValid: false,
          error: `Tipo de archivo no permitido. Tipos permitidos: ${this.config.allowedTypes.join(', ')}`
        };
      }

      // Validar tamaño
      if (file.size > this.config.maxSizeInBytes) {
        return {
          isValid: false,
          error: `El archivo es demasiado grande. Tamaño máximo: ${this.config.maxSizeInBytes / (1024 * 1024)}MB`
        };
      }

      // Validar dimensiones
      const dimensions = await this.getImageDimensions(file);
      if (this.config.maxDimensions) {
        if (dimensions.width > this.config.maxDimensions.width || 
            dimensions.height > this.config.maxDimensions.height) {
          return {
            isValid: false,
            error: `Dimensiones de imagen demasiado grandes. Máximo: ${this.config.maxDimensions.width}x${this.config.maxDimensions.height}`
          };
        }
      }

      // Crear URL segura
      const url = URL.createObjectURL(file);
      this.objectUrls.add(url);

      return {
        isValid: true,
        url
      };
    } catch (error) {
      return {
        isValid: false,
        error: 'Error al procesar la imagen'
      };
    }
  }

  private getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve({
          width: img.width,
          height: img.height
        });
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Error al cargar la imagen'));
      };

      img.src = url;
    });
  }

  public revokeObjectURL(url: string): void {
    if (this.objectUrls.has(url)) {
      URL.revokeObjectURL(url);
      this.objectUrls.delete(url);
    }
  }

  public cleanup(): void {
    this.objectUrls.forEach(url => {
      URL.revokeObjectURL(url);
    });
    this.objectUrls.clear();
  }
}

export default ImageService;
