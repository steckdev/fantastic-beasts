export class MotionService {
  private lastAccel = 0;
  private stepCount = 0;
  private isListening = false;
  private onStepCallback: ((steps: number) => void) | null = null;

  async requestPermission(): Promise<boolean> {
    if (
      typeof window !== 'undefined' &&
      typeof (DeviceMotionEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission === 'function'
    ) {
      try {
        const response = await (DeviceMotionEvent as unknown as { requestPermission: () => Promise<string> }).requestPermission();
        return response === 'granted';
      } catch (err) {
        console.warn('DeviceMotion permission error:', err);
        return false;
      }
    }
    return true; // Non-iOS or older permission model
  }

  startListening(callback: (steps: number) => void): void {
    if (this.isListening) return;
    this.onStepCallback = callback;
    this.isListening = true;

    if (typeof window !== 'undefined') {
      window.addEventListener('devicemotion', this.handleMotion);
    }
  }

  stopListening(): void {
    this.isListening = false;
    if (typeof window !== 'undefined') {
      window.removeEventListener('devicemotion', this.handleMotion);
    }
  }

  private handleMotion = (event: DeviceMotionEvent) => {
    const acc = event.accelerationIncludingGravity;
    if (!acc || acc.x === null || acc.y === null || acc.z === null) return;

    const magnitude = Math.sqrt(acc.x * acc.x + acc.y * acc.y + acc.z * acc.z);
    const delta = Math.abs(magnitude - this.lastAccel);
    this.lastAccel = magnitude;

    // Peak threshold for a human walking stride
    if (delta > 3.2 && delta < 12) {
      this.stepCount++;
      if (this.onStepCallback) {
        this.onStepCallback(this.stepCount);
      }
    }
  };
}

export const motionService = new MotionService();
