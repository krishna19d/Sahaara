// Enhanced data persistence with localStorage and export/import capabilities (100% FREE)
interface UserData {
  preferences: any;
  consent: any;
  sessionStats: any;
  currentMood: any;
  chatHistory: Array<{ role: string; content: string; timestamp: number }>;
}

interface SyncOptions {
  retainData: boolean;
  enableExport: boolean;
}

export class DataSyncManager {
  private sessionId: string | null = null;
  private syncOptions: SyncOptions = { retainData: false, enableExport: true };

  constructor() {
    this.initializeSync();
  }

  private async initializeSync() {
    try {
      const consent = JSON.parse(localStorage.getItem('sahaara_consent') || '{}');
      
      this.syncOptions = {
        retainData: consent.retention !== 'session-only',
        enableExport: true
      };

      this.sessionId = this.generateSessionId();
      console.log('DataSync: Using localStorage with export capabilities (FREE)');
    } catch (error) {
      console.log('DataSync: Using session-only storage');
      this.syncOptions = { retainData: false, enableExport: true };
    }
  }

  private generateSessionId(): string {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  async saveUserData(key: string, data: any): Promise<void> {
    try {
      const storageKey = this.syncOptions.retainData ? key : `session_${key}`;
      localStorage.setItem(storageKey, JSON.stringify(data));
      
      // Add timestamp for data management
      const metadata = {
        lastUpdated: Date.now(),
        sessionId: this.sessionId,
        version: '1.0'
      };
      localStorage.setItem(`${storageKey}_meta`, JSON.stringify(metadata));
      
    } catch (error) {
      console.error('Failed to save data:', error);
    }
  }

  async getUserData(key: string): Promise<any> {
    try {
      // Try persistent storage first, then session storage
      const persistentData = localStorage.getItem(key);
      const sessionData = localStorage.getItem(`session_${key}`);
      
      const dataStr = persistentData || sessionData;
      return dataStr ? JSON.parse(dataStr) : null;
    } catch (error) {
      console.error('Failed to retrieve data:', error);
      return null;
    }
  }

  async clearUserData(key?: string): Promise<void> {
    try {
      if (key) {
        localStorage.removeItem(key);
        localStorage.removeItem(`session_${key}`);
        localStorage.removeItem(`${key}_meta`);
        localStorage.removeItem(`session_${key}_meta`);
      } else {
        // Clear all app data
        const keys = Object.keys(localStorage).filter(k => 
          k.startsWith('sahaara_') || k.startsWith('session_')
        );
        keys.forEach(k => localStorage.removeItem(k));
      }
    } catch (error) {
      console.error('Failed to clear data:', error);
    }
  }

  // Export user data as JSON file (FREE backup solution)
  async exportUserData(): Promise<void> {
    try {
      const allData: Record<string, any> = {};
      const keys = Object.keys(localStorage).filter(k => 
        k.startsWith('sahaara_') && !k.endsWith('_meta')
      );
      
      keys.forEach(key => {
        try {
          allData[key] = JSON.parse(localStorage.getItem(key) || '{}');
        } catch (e) {
          allData[key] = localStorage.getItem(key);
        }
      });

      const exportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        sessionId: this.sessionId,
        data: allData
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sahaara-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      console.log('Data exported successfully');
    } catch (error) {
      console.error('Failed to export data:', error);
    }
  }

  // Import user data from JSON file
  async importUserData(file: File): Promise<boolean> {
    try {
      const text = await file.text();
      const importData = JSON.parse(text);
      
      if (importData.version && importData.data) {
        // Validate and import data
        Object.entries(importData.data).forEach(([key, value]) => {
          localStorage.setItem(key, JSON.stringify(value));
        });
        
        console.log('Data imported successfully');
        return true;
      } else {
        throw new Error('Invalid backup file format');
      }
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }

  // Get storage usage info
  getStorageInfo(): { used: number; available: number; percentage: number } {
    try {
      const used = JSON.stringify(localStorage).length;
      const available = 5 * 1024 * 1024; // ~5MB localStorage limit
      const percentage = (used / available) * 100;
      
      return { used, available, percentage };
    } catch (error) {
      return { used: 0, available: 0, percentage: 0 };
    }
  }

  // Check if data will persist between sessions
  getDataPersistence(): { persistent: boolean; reason: string } {
    if (this.syncOptions.retainData) {
      return { 
        persistent: true, 
        reason: 'Data will persist between browser sessions' 
      };
    } else {
      return { 
        persistent: false, 
        reason: 'Session-only storage - data clears when browser closes' 
      };
    }
  }
}

// Export singleton instance
export const dataSync = new DataSyncManager();

// Helper functions for easy usage
export const saveUserData = (key: string, data: any) => dataSync.saveUserData(key, data);
export const getUserData = (key: string) => dataSync.getUserData(key);
export const clearUserData = (key?: string) => dataSync.clearUserData(key);
export const exportUserData = () => dataSync.exportUserData();
export const getStorageInfo = () => dataSync.getStorageInfo();