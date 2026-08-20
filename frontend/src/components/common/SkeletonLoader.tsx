import React from 'react';

export const SkeletonCard: React.FC = () => (
  <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#EAECF0] animate-pulse space-y-3 shadow-xs">
    <div className="h-4 bg-[#F1F7FA] rounded w-1/3"></div>
    <div className="h-8 bg-[#F1F7FA] rounded w-1/2"></div>
    <div className="h-3 bg-[#F1F7FA] rounded w-2/3"></div>
  </div>
);

export const SkeletonTable: React.FC = () => (
  <div className="border border-[#EAECF0] rounded-xl bg-[#FFFFFF] animate-pulse p-4 space-y-4 shadow-xs">
    <div className="h-6 bg-[#F1F7FA] rounded w-1/4"></div>
    {[...Array(5)].map((_, i) => (
      <div key={i} className="h-10 bg-[#F8FAFC] rounded w-full"></div>
    ))}
  </div>
);

