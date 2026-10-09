export const haptics = {
  trigger(pattern: number | number[] = 50, enabled: boolean = true) {
    if (!enabled) return;
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch (_) {
        // Silently ignore if not permitted or unsupported
      }
    }
  },
  light(enabled: boolean = true) {
    this.trigger(25, enabled);
  },
  medium(enabled: boolean = true) {
    this.trigger(50, enabled);
  },
  encounter(enabled: boolean = true) {
    this.trigger([40, 50, 60], enabled);
  },
  success(enabled: boolean = true) {
    this.trigger([40, 60, 40], enabled);
  },
  mark(enabled: boolean = true) {
    this.trigger([80, 50, 80, 50, 160], enabled);
  },
  apparate(enabled: boolean = true) {
    this.trigger([60, 40, 100], enabled);
  }
};
