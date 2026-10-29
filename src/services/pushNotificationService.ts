import { PushNotification, Subscriber, Recipe } from '../types';
import { soundEffects } from './soundEffects';

const STORAGE_NOTIFICATIONS_KEY = 'culinary_blog_notifications_en_v4';
const STORAGE_SUBSCRIBERS_KEY = 'culinary_blog_subscribers_en_v4';
const STORAGE_PERMISSION_KEY = 'culinary_blog_push_granted_en_v4';
const BROADCAST_CHANNEL_NAME = 'culinary_blog_broadcast_push_en_v4';

type NotificationListener = (notification: PushNotification) => void;

class PushNotificationService {
  private listeners: Set<NotificationListener> = new Set();
  private channel: BroadcastChannel | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      // Clean up legacy keys
      try {
        ['culinary_blog_notifications_v1', 'culinary_blog_notifications_v2', 'culinary_blog_subscribers_v1', 'culinary_blog_subscribers_v2'].forEach(k => localStorage.removeItem(k));
      } catch {
        // Ignore
      }

      if ('BroadcastChannel' in window) {
        try {
          this.channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
          this.channel.onmessage = (event) => {
            if (event.data && event.data.type === 'NEW_PUSH') {
              const notif: PushNotification = event.data.notification;
              soundEffects.playPushNotificationChime();
              this.listeners.forEach((fn) => fn(notif));
            }
          };
        } catch {
          // BroadcastChannel fallback
        }
      }
    }
  }

  public subscribe(listener: NotificationListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getStoredNotifications(): PushNotification[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(STORAGE_NOTIFICATIONS_KEY);
      if (data) return JSON.parse(data);
    } catch {
      // Ignore
    }
    return [];
  }

  public saveNotifications(notifications: PushNotification[]) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_NOTIFICATIONS_KEY, JSON.stringify(notifications));
    } catch {
      // Ignore
    }
  }

  public getStoredSubscribers(): Subscriber[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(STORAGE_SUBSCRIBERS_KEY);
      if (data) return JSON.parse(data);
    } catch {
      // Ignore
    }
    return [];
  }

  public saveSubscribers(subscribers: Subscriber[]) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_SUBSCRIBERS_KEY, JSON.stringify(subscribers));
    } catch {
      // Ignore
    }
  }

  public async requestBrowserPermission(): Promise<NotificationPermission> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        localStorage.setItem(STORAGE_PERMISSION_KEY, 'true');
      }
      return permission;
    } catch {
      return 'denied';
    }
  }

  public isBrowserPermissionGranted(): boolean {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }
    return Notification.permission === 'granted';
  }

  /**
   * Dispatch push notification to all subscribers & tabs immediately
   */
  public dispatchPush(notification: Omit<PushNotification, 'id' | 'sentAt' | 'read'>): PushNotification {
    const fullNotification: PushNotification = {
      ...notification,
      id: 'push_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      sentAt: new Date().toISOString(),
      read: false,
    };

    // 1. Save to localStorage
    const current = this.getStoredNotifications();
    const updated = [fullNotification, ...current].slice(0, 50);
    this.saveNotifications(updated);

    // 2. Play sound chime
    soundEffects.playPushNotificationChime();

    // 3. Trigger native browser Web Notification if allowed
    if (this.isBrowserPermissionGranted()) {
      try {
        new Notification(fullNotification.title, {
          body: fullNotification.message,
          icon: fullNotification.recipeImage || '/favicon.ico',
          badge: '/favicon.ico',
          tag: fullNotification.id,
        });
      } catch {
        // Notification constructor error
      }
    }

    // 4. Broadcast to other open browser tabs
    if (this.channel) {
      try {
        this.channel.postMessage({
          type: 'NEW_PUSH',
          notification: fullNotification,
        });
      } catch {
        // Broadcast error
      }
    }

    // 5. Notify all in-app components
    this.listeners.forEach((fn) => fn(fullNotification));

    return fullNotification;
  }

  /**
   * Convenience trigger when recipe is published
   */
  public notifyRecipePublished(recipe: Recipe, authorName: string) {
    return this.dispatchPush({
      title: `🍽️ New Dish Alert: ${recipe.title}`,
      message: `Chef ${authorName} just published a new signature recipe: "${recipe.title}". Cooks in only ${recipe.cookTime} mins, discover the secret!`,
      recipeId: recipe.id,
      recipeSlug: recipe.slug,
      recipeTitle: recipe.title,
      recipeImage: recipe.images.find(img => img.isPrimary)?.originalUrl || recipe.images[0]?.originalUrl,
      authorName,
      priority: 'urgent',
      segment: 'All Subscribers',
      reachCount: 1480,
    });
  }
}

export const pushNotificationService = new PushNotificationService();
