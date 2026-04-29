import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAppContext } from '../context/AppContext';
import type { Resource } from '../context/AppContext';
import { LogOut, Filter } from 'lucide-react';
import OfflineIndicator from '../components/OfflineIndicator';
import CommunityScore from '../components/CommunityScore';
import ResourceCard from '../components/ResourceCard';
import NudgeCarousel from '../components/NudgeCarousel';
import VoiceInput from '../components/VoiceInput';
import LocationSelector from '../components/LocationSelector';
import { motion, AnimatePresence } from 'framer-motion';

type FilterType = 'all' | 'water' | 'energy' | 'waste';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { resources } = useAppContext();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const filteredResources = activeFilter === 'all' 
    ? resources 
    : resources.filter(r => r.type === activeFilter);

  return (
    <div className="flex flex-col h-full bg-slate-50 relative pb-24 overflow-y-auto no-scrollbar">
      <OfflineIndicator />
      
      {/* Header */}
      <header className="px-6 py-4 flex justify-between items-center bg-white border-b border-slate-100 sticky top-0 z-20">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Hi, {user?.name} 👋</h1>
          <p className="text-slate-500 font-medium text-sm">Let's make an impact today</p>
        </div>
        <button 
          onClick={logout}
          className="p-3 bg-slate-100 rounded-full text-slate-600 hover:bg-slate-200 transition-colors"
          aria-label="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      {/* Main Content Area - Grid on PC */}
      <main className="flex-1 p-4 lg:p-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          
          {/* Left Column (Score and Map) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <CommunityScore />
            <LocationSelector />
          </div>

          {/* Right Column (Resources and Nudges) */}
          <div className="lg:col-span-7 flex flex-col gap-6 mt-6 lg:mt-0">
            
            {/* Resources Section */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-800">Local Resources</h2>
                <div className="flex gap-2">
                  {(['all', 'water', 'energy', 'waste'] as FilterType[]).map(filter => (
                    <button
                      key={filter}
                      onClick={() => setActiveFilter(filter)}
                      className={`p-2 rounded-xl text-sm font-bold transition-all capitalize ${
                        activeFilter === filter 
                          ? 'bg-slate-800 text-white shadow-md' 
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {filter === 'all' ? <Filter className="w-4 h-4" /> : filter}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <AnimatePresence>
                  {filteredResources.map((resource: Resource) => (
                    <motion.div
                      key={resource.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9, height: 0, marginTop: 0, marginBottom: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ResourceCard resource={resource} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Nudges Section */}
            <div className="bg-white pt-6 pb-2 rounded-3xl border border-slate-100 shadow-sm">
              <NudgeCarousel />
            </div>

          </div>
        </div>
        
        <div className="h-10 lg:hidden"></div> {/* Bottom padding for mobile Voice button */}
      </main>

      {/* Floating Action Button for Voice */}
      <div className="fixed bottom-6 left-0 right-0 flex justify-center z-30 pointer-events-none lg:absolute lg:bottom-10 lg:right-10 lg:left-auto">
        <div className="pointer-events-auto shadow-2xl rounded-full">
          <VoiceInput />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
