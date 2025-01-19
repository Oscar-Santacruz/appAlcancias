export interface ImageValidationResult {
  isValid: boolean;
  error?: string;
  url?: string;
}

export interface ImageConfig {
  maxSizeInBytes: number;
  allowedTypes: string[];
  maxDimensions?: {
    width: number;
    height: number;
  };
}

export interface ProcessedImage {
  url: string;
  width: number;
  height: number;
  size: number;
  type: string;
}
