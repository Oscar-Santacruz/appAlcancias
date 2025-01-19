export interface ConsentSettings {
  analytics: boolean;
  necessary: boolean;
  timestamp: number;
}

export interface ConsentManagerProps {
  onAccept: (settings: ConsentSettings) => void;
  onDecline: () => void;
}
