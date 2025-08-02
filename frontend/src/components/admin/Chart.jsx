import React from 'react';
import { useTranslation } from 'react-i18next';

const Chart = ({ 
  title, 
  data, 
  type = 'line', 
  height = 300,
  color = 'blue',
  showLegend = true,
  showGrid = true
}) => {
  const { t } = useTranslation();

  const getColorClasses = () => {
    const colors = {
      blue: {
        primary: 'rgb(59, 130, 246)',
        secondary: 'rgba(59, 130, 246, 0.1)',
        border: 'rgb(59, 130, 246)'
      },
      green: {
        primary: 'rgb(34, 197, 94)',
        secondary: 'rgba(34, 197, 94, 0.1)',
        border: 'rgb(34, 197, 94)'
      },
      red: {
        primary: 'rgb(239, 68, 68)',
        secondary: 'rgba(239, 68, 68, 0.1)',
        border: 'rgb(239, 68, 68)'
      },
      purple: {
        primary: 'rgb(147, 51, 234)',
        secondary: 'rgba(147, 51, 234, 0.1)',
        border: 'rgb(147, 51, 234)'
      },
      yellow: {
        primary: 'rgb(234, 179, 8)',
        secondary: 'rgba(234, 179, 8, 0.1)',
        border: 'rgb(234, 179, 8)'
      }
    };
    return colors[color] || colors.blue;
  };

  const renderChart = () => {
    if (!data || data.length === 0) {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500 dark:text-gray-400">
            {t('admin.dashboard.noData')}
          </p>
        </div>
      );
    }

    if (type === 'line') {
      return renderLineChart();
    } else if (type === 'bar') {
      return renderBarChart();
    } else if (type === 'pie') {
      return renderPieChart();
    }

    return null;
  };

  const renderLineChart = () => {
    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = Math.min(...data.map(d => d.value));
    const range = maxValue - minValue;

    return (
      <svg width="100%" height={height} className="overflow-visible">
        {showGrid && (
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(156, 163, 175, 0.2)" strokeWidth="1"/>
            </pattern>
          </defs>
        )}
        
        <rect width="100%" height="100%" fill="url(#grid)" />
        
        <polyline
          fill="none"
          stroke={getColorClasses().primary}
          strokeWidth="2"
          points={data.map((d, i) => {
            const x = (i / (data.length - 1)) * 100;
            const y = 100 - ((d.value - minValue) / range) * 80;
            return `${x}%,${y}%`;
          }).join(' ')}
        />
        
        {data.map((d, i) => {
          const x = (i / (data.length - 1)) * 100;
          const y = 100 - ((d.value - minValue) / range) * 80;
          return (
            <circle
              key={i}
              cx={`${x}%`}
              cy={`${y}%`}
              r="4"
              fill={getColorClasses().primary}
              className="hover:r-6 transition-all duration-200"
            />
          );
        })}
      </svg>
    );
  };

  const renderBarChart = () => {
    const maxValue = Math.max(...data.map(d => d.value));

    return (
      <div className="flex items-end justify-between h-full space-x-2">
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center">
            <div
              className="w-full bg-blue-500 hover:bg-blue-600 transition-colors duration-200 rounded-t"
              style={{ 
                height: `${(d.value / maxValue) * 100}%`,
                backgroundColor: getColorClasses().primary
              }}
            />
            <span className="text-xs text-gray-600 dark:text-gray-400 mt-2">
              {d.label}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const renderPieChart = () => {
    const total = data.reduce((sum, d) => sum + d.value, 0);
    let currentAngle = 0;

    return (
      <svg width="100%" height={height} className="overflow-visible">
        {data.map((d, i) => {
          const percentage = (d.value / total) * 100;
          const angle = (percentage / 100) * 360;
          const x1 = 50 + 40 * Math.cos((currentAngle * Math.PI) / 180);
          const y1 = 50 + 40 * Math.sin((currentAngle * Math.PI) / 180);
          const x2 = 50 + 40 * Math.cos(((currentAngle + angle) * Math.PI) / 180);
          const y2 = 50 + 40 * Math.sin(((currentAngle + angle) * Math.PI) / 180);
          
          const largeArcFlag = angle > 180 ? 1 : 0;
          
          const pathData = [
            `M 50 50`,
            `L ${x1} ${y1}`,
            `A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`,
            'Z'
          ].join(' ');

          currentAngle += angle;

          return (
            <path
              key={i}
              d={pathData}
              fill={`hsl(${(i * 137.5) % 360}, 70%, 60%)`}
              className="hover:opacity-80 transition-opacity duration-200"
            />
          );
        })}
      </svg>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
        {showLegend && data && data.length > 0 && (
          <div className="flex space-x-4">
            {data.map((d, i) => (
              <div key={i} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: `hsl(${(i * 137.5) % 360}, 70%, 60%)` }}
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {d.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div style={{ height: `${height}px` }}>
        {renderChart()}
      </div>
    </div>
  );
};

export default Chart; 