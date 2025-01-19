import { ConsentSettings } from '../types/consent';

const CONSENT_KEY = 'cookie_consent';

class ConsentService {
  private static instance: ConsentService;

  private constructor() {}

  public static getInstance(): ConsentService {
    if (!ConsentService.instance) {
      ConsentService.instance = new ConsentService();
    }
    return ConsentService.instance;
  }

  public getConsent(): ConsentSettings | null {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    return null;
  }

  public saveConsent(settings: ConsentSettings): void {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(settings));
  }

  public clearConsent(): void {
    localStorage.removeItem(CONSENT_KEY);
  }

  public hasValidConsent(): boolean {
    const consent = this.getConsent();
    if (!consent) return false;
    
    // Considerar el consentimiento válido por 6 meses
    const sixMonthsInMs = 180 * 24 * 60 * 60 * 1000;
    return Date.now() - consent.timestamp < sixMonthsInMs;
  }
}

export default ConsentService;
