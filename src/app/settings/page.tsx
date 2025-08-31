'use client';
import { useState } from 'react';
import { dataSync, exportUserData, clearUserData, getStorageInfo } from '@/lib/dataSync';

export default function SettingsPage() {
  const [storageInfo, setStorageInfo] = useState(getStorageInfo());
  const [importing, setImporting] = useState(false);
  
  const handleExport = async () => {
    try {
      await exportUserData();
      alert('Data exported successfully! Check your downloads folder.');
    } catch (error) {
      alert('Export failed. Please try again.');
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const success = await dataSync.importUserData(file);
      if (success) {
        alert('Data imported successfully!');
        window.location.reload(); // Refresh to show new data
      } else {
        alert('Import failed. Please check the file format.');
      }
    } catch (error) {
      alert('Import failed. Please try again.');
    } finally {
      setImporting(false);
    }
  };

  const handleClearAll = async () => {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      await clearUserData();
      alert('All data cleared successfully.');
      window.location.reload();
    }
  };

  const refreshStorage = () => {
    setStorageInfo(getStorageInfo());
  };

  const persistence = dataSync.getDataPersistence();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Data Management</h1>
          
          {/* Data Persistence Status */}
          <div className="mb-6 p-4 rounded-lg bg-blue-50 border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">Data Persistence</h3>
            <p className="text-blue-700 text-sm">{persistence.reason}</p>
            <div className={`inline-block px-2 py-1 rounded text-xs font-medium mt-2 ${
              persistence.persistent ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {persistence.persistent ? 'Persistent' : 'Session Only'}
            </div>
          </div>

          {/* Storage Usage */}
          <div className="mb-6 p-4 rounded-lg bg-gray-50 border border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-gray-800">Storage Usage</h3>
              <button 
                onClick={refreshStorage}
                className="text-sm text-purple-600 hover:text-purple-700"
              >
                Refresh
              </button>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${Math.min(storageInfo.percentage, 100)}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600">
              {(storageInfo.used / 1024).toFixed(1)} KB used of ~5MB available 
              ({storageInfo.percentage.toFixed(1)}%)
            </p>
          </div>

          {/* Export Data */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-3">Backup Your Data</h3>
            <p className="text-sm text-gray-600 mb-3">
              Export your preferences, mood data, and chat history as a JSON file. 
              This is completely free and works offline.
            </p>
            <button
              onClick={handleExport}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              📥 Export Data
            </button>
          </div>

          {/* Import Data */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-3">Restore Your Data</h3>
            <p className="text-sm text-gray-600 mb-3">
              Import a previously exported backup file to restore your data.
            </p>
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              disabled={importing}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
            />
            {importing && (
              <p className="text-sm text-purple-600 mt-2">Importing data...</p>
            )}
          </div>

          {/* Clear Data */}
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200">
            <h3 className="font-semibold text-red-800 mb-3">Clear All Data</h3>
            <p className="text-sm text-red-700 mb-3">
              This will permanently delete all your data including preferences, 
              mood history, and chat conversations.
            </p>
            <button
              onClick={handleClearAll}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              🗑️ Clear All Data
            </button>
          </div>

          {/* Privacy Notice */}
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <h3 className="font-semibold text-green-800 mb-2">Privacy Guarantee</h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>✅ All data stored locally on your device</li>
              <li>✅ No cloud storage or external servers</li>
              <li>✅ Export/import works completely offline</li>
              <li>✅ No subscription fees or premium features</li>
            </ul>
          </div>

          {/* Navigation */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <a 
              href="/dashboard" 
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              ← Back to Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
