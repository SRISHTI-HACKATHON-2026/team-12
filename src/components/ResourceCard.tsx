import React from 'react';
import type { Resource } from '../context/AppContext';
import { Droplet, Zap, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface ResourceCardProps {
  resource: Resource;
}

const ResourceCard: React.FC<ResourceCardProps> = ({ resource }) => {
  const getIcon = () => {
    switch (resource.type) {
      case 'water': return <Droplet className="w-8 h-8" />;
      case 'energy': return <Zap className="w-8 h-8" />;
      case 'waste': return <Trash2 className="w-8 h-8" />;
    }
  };

  const getStatusColor = () => {
    switch (resource.status) {
      case 'good': return 'bg-green-100 text-green-600 border-green-200';
      case 'warning': return 'bg-yellow-100 text-yellow-600 border-yellow-200';
      case 'critical': return 'bg-red-100 text-red-600 border-red-200';
    }
  };

  const getStatusText = () => {
    switch (resource.status) {
      case 'good': return 'Healthy';
      case 'warning': return 'Attention';
      case 'critical': return 'Critical';
    }
  };

  return (
    <motion.div 
      whileHover={{ y: -2 }}
      className={`p-4 rounded-3xl border-2 flex items-center gap-4 ${getStatusColor()}`}
    >
      <div className="p-3 bg-white bg-opacity-50 rounded-2xl">
        {getIcon()}
      </div>
      <div className="flex-1">
        <h3 className="font-bold text-lg">{resource.name}</h3>
        <p className="font-medium opacity-80">{getStatusText()} • {resource.value}%</p>
      </div>
      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center font-bold shadow-sm">
        {resource.status === 'good' ? '👍' : resource.status === 'warning' ? '⚠️' : '🚨'}
      </div>
    </motion.div>
  );
};

export default ResourceCard;
