import * as SQLite from 'expo-sqlite';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

let db: SQLite.SQLiteDatabase | null = null;

// 🔓 DBを開く関数（他ファイルからも使える）
export async function openDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync('skills.db');
    console.log('📁 データベースを開きました');
  }
  return db;
}

// 🛠️ 初期化関数（起動時1回でOK）
export async function setupDatabase() {
  const db = await openDatabase();

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS skills_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      skill TEXT NOT NULL,
      note TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log('✅ skills_log テーブル作成完了');
}

// 🚀 初回起動時だけ初期化する関数
export async function initializeAppDatabaseOnce() {
  const flag = await AsyncStorage.getItem('db_initialized');

  if (flag !== 'true') {
    console.log('🆕 初回起動：DB初期化します');
    try {
      await setupDatabase();
      await AsyncStorage.setItem('db_initialized', 'true');
    } catch (error) {
      console.error('❌ DB初期化エラー:', error);
    }
  } else {
    console.log('🔁 すでに初期化済み');
  }
}

// 🗑️ DBファイルと初期化フラグを完全にリセット（開発用）
export async function resetDatabaseAll() {
  const dbPath = `${FileSystem.documentDirectory}SQLite/skills.db`;

  try {
    const info = await FileSystem.getInfoAsync(dbPath);
    if (info.exists) {
      await FileSystem.deleteAsync(dbPath, { idempotent: true });
      console.log('🗑️ データベースファイル削除完了');
    } else {
      console.log('⚠️ データベースファイルは存在しません');
    }

    await AsyncStorage.removeItem('db_initialized');
    console.log('🔄 初期化フラグをリセットしました');

    // キャッシュしてたdbも忘れる
    db = null;
  } catch (error) {
    console.error('❌ DB削除失敗:', error);
  }
}
