import React from 'react';

const LoadingSpinner = ({ text = "Carregando..." }) => (
  <div className="flex flex-col items-center justify-center py-16 text-textSecondary">
    <div className="w-12 h-12 border-4 border-border border-t-primary rounded-full animate-spin mb-6"></div>
    <p className="text-[1.1rem]">{text}</p>
  </div>
);

export default LoadingSpinner;