import React, { createContext, useContext, useState } from 'react';

export type ResourceStatus = 'good' | 'warning' | 'critical';

export interface Resource {
  id: string;
  name: string;
  type: 'water' | 'energy' | 'waste';
  status: ResourceStatus;
  value: number;
}

export interface Nudge {
  id: string;
  title: string;
  description: string;
  points: number;
  icon: string;
  completed: boolean;
}

interface AppContextType {
  score: number;
  resources: Resource[];
  nudges: Nudge[];
  completeNudge: (id: string) => void;
  lastSynced: Date;
  updateSyncTime: () => void;
}

const initialResources: Resource[] = [
  { id: '1', name: 'Water Supply', type: 'water', status: 'warning', value: 45 },
  { id: '2', name: 'Power Grid', type: 'energy', status: 'good', value: 80 },
  { id: '3', name: 'Waste Collection', type: 'waste', status: 'critical', value: 20 },
];

const initialNudges: Nudge[] = [
  { id: 'n1', title: 'Report Leak', description: 'Take a photo of a water leak', points: 10, icon: '💧', completed: false },
  { id: 'n2', title: 'Sort Waste', description: 'Separate plastics today', points: 5, icon: '♻️', completed: false },
  { id: 'n3', title: 'Solar Check', description: 'Clean solar panels', points: 15, icon: '☀️', completed: false },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [score, setScore] = useState<number>(65);
  const [resources] = useState<Resource[]>(initialResources);
  const [nudges, setNudges] = useState<Nudge[]>(initialNudges);
  const [lastSynced, setLastSynced] = useState<Date>(new Date());

  const completeNudge = (id: string) => {
    setNudges(prev => prev.map(n => {
      if (n.id === id && !n.completed) {
        setScore(s => Math.min(100, s + n.points));
        return { ...n, completed: true };
      }
      return n;
    }));
    updateSyncTime();
  };

  const updateSyncTime = () => {
    setLastSynced(new Date());
  };

  return (
    <AppContext.Provider value={{ score, resources, nudges, completeNudge, lastSynced, updateSyncTime }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
