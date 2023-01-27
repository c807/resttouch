import { Injectable } from '@angular/core';
import { SharedModule } from '@shared/shared.module';

@Injectable({
  providedIn: SharedModule
})
export class DesktopNotificationService {

  constructor() { }

  requestPermission = async (): Promise<NotificationPermission> => {
    if (!('Notification' in window)) {
      return;
    }
    if (Notification.permission === 'default') {
      const result = await Notification.requestPermission();
      return result;
    } else {
      return Notification.permission;
    }
  }

  havePermission = async (): Promise<boolean> => Notification.permission === 'granted';

  createNotification = (title: string, delay: number = 5000, options?: NotificationOptions) => {
    if (Notification.permission === 'granted') {
      const notification = new Notification(title, options);
      if (delay !== null && delay !== undefined && +delay > 0) {
        setTimeout(notification.close.bind(notification), delay);
      }
    }
  }
}
