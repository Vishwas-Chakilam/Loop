import Toast from 'react-native-toast-message';

interface ToastOptions {
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
}

class ToastManager {
  show(options: ToastOptions) {
    Toast.show({
      type: options.type,
      text1: options.title,
      text2: options.message,
      visibilityTime: 4000,
      autoHide: true,
      topOffset: 60,
    });
  }

  success(title: string, message?: string) {
    this.show({ type: 'success', title, message });
  }

  error(title: string, message?: string) {
    this.show({ type: 'error', title, message });
  }

  info(title: string, message?: string) {
    this.show({ type: 'info', title, message });
  }
}

export const toast = new ToastManager();