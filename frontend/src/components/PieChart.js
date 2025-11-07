import React from 'react';

const PieChart = ({ protein, carbs, fats }) => {
  const total = protein + carbs + fats;
  
  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-gray-500">No macro data available</p>
      </div>
    );
  }

  const proteinPercent = (protein / total) * 100;
  const carbsPercent = (carbs / total) * 100;
  const fatsPercent = (fats / total) * 100;

  // Calculate angles for pie chart (in degrees)
  const proteinAngle = (proteinPercent / 100) * 360;
  const carbsAngle = (carbsPercent / 100) * 360;
  const fatsAngle = (fatsPercent / 100) * 360;

  // SVG path calculations
  const radius = 80;
  const centerX = 100;
  const centerY = 100;

  const getPath = (startAngle, endAngle) => {
    if (endAngle - startAngle === 0) return '';
    
    const startRad = ((startAngle - 90) * Math.PI) / 180;
    const endRad = ((endAngle - 90) * Math.PI) / 180;
    
    const start = {
      x: centerX + radius * Math.cos(startRad),
      y: centerY + radius * Math.sin(startRad)
    };
    const end = {
      x: centerX + radius * Math.cos(endRad),
      y: centerY + radius * Math.sin(endRad)
    };
    
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    return `M ${centerX} ${centerY} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
  };

  let currentAngle = 0;
  const proteinPath = proteinAngle > 0 ? getPath(currentAngle, currentAngle + proteinAngle) : '';
  currentAngle += proteinAngle;
  const carbsPath = carbsAngle > 0 ? getPath(currentAngle, currentAngle + carbsAngle) : '';
  currentAngle += carbsAngle;
  const fatsPath = fatsAngle > 0 ? getPath(currentAngle, currentAngle + fatsAngle) : '';

  return (
    <div className="flex flex-col items-center">
      <svg width="200" height="200" className="mb-4">
        <g>
          {proteinPath && (
            <path
              d={proteinPath}
              fill="#3B82F6"
              stroke="white"
              strokeWidth="2"
            />
          )}
          {carbsPath && (
            <path
              d={carbsPath}
              fill="#10B981"
              stroke="white"
              strokeWidth="2"
            />
          )}
          {fatsPath && (
            <path
              d={fatsPath}
              fill="#F59E0B"
              stroke="white"
              strokeWidth="2"
            />
          )}
        </g>
      </svg>
      <div className="flex gap-6 justify-center flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded"></div>
          <span className="text-sm text-gray-700">
            Protein: {protein.toFixed(1)}g ({proteinPercent.toFixed(1)}%)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span className="text-sm text-gray-700">
            Carbs: {carbs.toFixed(1)}g ({carbsPercent.toFixed(1)}%)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-500 rounded"></div>
          <span className="text-sm text-gray-700">
            Fats: {fats.toFixed(1)}g ({fatsPercent.toFixed(1)}%)
          </span>
        </div>
      </div>
    </div>
  );
};

export default PieChart;

