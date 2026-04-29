import React, { useState, useEffect } from 'react';
import { CloudOff, Cloud, RefreshCw } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { lastSynced } = useAppContext();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const timeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-slate-100 text-xs font-medium text-slate-500 rounded-b-xl border-b border-slate-200">
      <div className="flex items-center gap-2">
        {isOnline ? (
          <><Cloud className="w-4 h-4 text-green-500" /> <span>Online</span></>
        ) : (
          <><CloudOff className="w-4 h-4 text-red-500" /> <span>Offline Mode</span></>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span>Synced: {timeAgo(lastSynced)}</span>
        <RefreshCw className={`w-3 h-3 ${isOnline ? 'text-slate-400' : 'text-slate-300'}`} />
      </div>
    </div>
  );
};

export default OfflineIndicator;
