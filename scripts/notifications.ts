import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import { Platform } from 'react-native';



export async function initializeNotificationSystem() {
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    const { status: newStatus } = await Notifications.requestPermissionsAsync();
    if (newStatus !== 'granted') {
      console.warn('通知の許可が得られませんでした');
      return;
    }
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  console.log('🔔 通知の初期化完了');
}

// 🔁 通知を30分おきにスケジュール（9:00〜22:00）
export async function scheduleMetacognitionReminders() {
  // 既存通知をキャンセル（重複防止）
  await Notifications.cancelAllScheduledNotificationsAsync();

  const now = new Date();
  const today = now.toISOString().split('T')[0]; // 'YYYY-MM-DD'

  const times: string[] = [];

  for (let hour = 9; hour <= 21; hour++) {
    times.push(`${hour.toString().padStart(2, '0')}:00`);
    times.push(`${hour.toString().padStart(2, '0')}:30`);
  }
  times.push(`22:00`);

  for (const time of times) {
    const [hourStr, minuteStr] = time.split(':');
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'メタ認知してますか？',
        body: '少し立ち止まって考えてみよう',
        sound: 'default',
      },
      trigger: {
        hour: parseInt(hourStr),
        minute: parseInt(minuteStr),
        repeats: true,
      },
    });
  }

  console.log('⏰ 通知スケジュールを登録しました');
}


export interface NotificationSettings {
  isNotificationEnabled: boolean;
  intervalMinutes: number;
  quietHours: {
    start: number;
    end: number;
  };
}

// デフォルト設定
const defaultSettings: NotificationSettings = {
  isNotificationEnabled: true,
  intervalMinutes: 30,
  quietHours: {
    start: 23,
    end: 8,
  },
};

// 保存
export async function saveNotificationSettings(settings: NotificationSettings) {
  await AsyncStorage.setItem('notificationSettings', JSON.stringify(settings));
}

// 取得
export async function getNotificationSettings(): Promise<NotificationSettings> {
  const stored = await AsyncStorage.getItem('notificationSettings');
  return stored ? JSON.parse(stored) : defaultSettings;
}

// 通知の再スケジュール
export async function updateNotificationScheduleFromSettings() {
  const settings = await getNotificationSettings();

  await Notifications.cancelAllScheduledNotificationsAsync();

  if (!settings.isNotificationEnabled) return;

  const times = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += settings.intervalMinutes) {
      // 静かな時間帯はスキップ
      if (!isInQuietHours(h, settings.quietHours.start, settings.quietHours.end)) {
        times.push({ hour: h, minute: m });
      }
    }
  }

  for (const { hour, minute } of times) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'メタ認知してますか？',
        body: '少し立ち止まって考えてみよう',
        sound: 'default',
      },
      trigger: { hour, minute, repeats: true },
    });
  }
}

// 静かな時間帯かどうかを判定
function isInQuietHours(hour: number, start: number, end: number): boolean {
  if (start < end) return hour >= start && hour < end;
  return hour >= start || hour < end;
}