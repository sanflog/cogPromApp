import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { View, Text, Switch, StyleSheet, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';

import { Collapsible } from '@/components/Collapsible';
import { ExternalLink } from '@/components/ExternalLink';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

import {
  getNotificationSettings,
  saveNotificationSettings,
  updateNotificationScheduleFromSettings,
} from '@/scripts/notifications';



export default function TabTwoScreen() {
  const [isEnabled, setIsEnabled] = useState(true);
  const [interval, setInterval] = useState(30);
  const [quietStart, setQuietStart] = useState(23);
  const [quietEnd, setQuietEnd] = useState(8);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getNotificationSettings().then((s) => {
      setIsEnabled(s.isNotificationEnabled);
      setInterval(s.intervalMinutes);
      setQuietStart(s.quietHours.start);
      setQuietEnd(s.quietHours.end);
      setLoaded(true); // 読み込み完了フラグ
    });
  }, []);

  useEffect(() => {
    if (!loaded) return; // 読み込み完了後だけ実行
    const s = {
      isNotificationEnabled: isEnabled,
      intervalMinutes: interval,
      quietHours: {
        start: quietStart,
        end: quietEnd,
      },
    };
    saveNotificationSettings(s);
    updateNotificationScheduleFromSettings();
  }, [isEnabled, interval, quietStart, quietEnd]);

  return (
    <ParallaxScrollView headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Settings</ThemedText>
      </ThemedView>

      <ThemedView style={{ padding: 16 }}>
        <ThemedText>通知を有効にする</ThemedText>
        <Switch value={isEnabled} onValueChange={setIsEnabled} />

        <ThemedText style={{ marginTop: 16 }}>通知の間隔（分）</ThemedText>
        <Picker
          selectedValue={interval}
          onValueChange={(itemValue) => setInterval(itemValue)}
          style={{ height: 50, color: "white" }}
          dropdownIconColor="white"
          mode="dropdown"
        >
          <Picker.Item label="1分ごと" value={1} />
          <Picker.Item label="30分ごと" value={30} />
          <Picker.Item label="1時間ごと" value={60} />
        </Picker>

        <ThemedText style={{ marginTop: 16 }}>通知しない時間（開始）</ThemedText>
        <Picker
          selectedValue={quietStart}
          onValueChange={(itemValue) => setQuietStart(itemValue)}
          style={{ heightt: 50, color: "white" }}
          dropdownIconColor="white"
          mode="dropdown"
        >
          {Array.from({ length: 24 }, (_, i) => (
            <Picker.Item key={i} label={`${i}時`} value={i} />
          ))}
        </Picker>

        <ThemedText style={{ marginTop: 16 }}>通知しない時間（終了）</ThemedText>
        <Picker
          selectedValue={quietEnd}
          onValueChange={(itemValue) => setQuietEnd(itemValue)}
          style={{ height: 50, color: "white" }}
          dropdownIconColor="white"
          mode="dropdown"
        >
          {Array.from({ length: 24 }, (_, i) => (
            <Picker.Item key={i} label={`${i}時`} value={i} />
          ))}
        </Picker>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
});
