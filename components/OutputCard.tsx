
import React from 'react';
import { CopyButton } from './CopyButton';

interface OutputCardProps {
  title: string;
  content: string;
}

export const OutputCard: React.FC<OutputCardProps> = ({ title, content }) => {
  // Simple markdown-like rendering for lists
  const renderContent = () => {
    return content.split('\n').map((line, index) => {
      if (line.trim().startsWith('- ') || line.trim().startsWith('• ')) {
        return (
          <li key={index} className="ml-4 list-disc list-inside text-gray-300">
            {line.replace(/[-•]\s*/, '')}
          </li>
        );
      }
      if (line.trim().startsWith('###')) {
         return <h3 key={index} className="text-lg font-semibold text-purple-300 mt-2 mb-1">{line.replace(/###\s*\d\.\s*/, '')}</h3>;
      }
      if (line.trim().startsWith('**')) {
        return <p key={index} className="font-bold my-1 text-gray-200">{line.replace(/\*\*/g, '')}</p>
      }
      return <p key={index} className="my-1 text-gray-300">{line}</p>;
    });
  };

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg shadow-lg overflow-hidden">
      <div className="flex justify-between items-center p-4 bg-gray-800 border-b border-gray-700">
        <h2 className="text-xl font-semibold text-purple-400">{title}</h2>
        <CopyButton textToCopy={content} />
      </div>
      <div className="p-5 text-gray-300 prose prose-invert prose-p:my-1 prose-li:my-0.5 max-w-none whitespace-pre-wrap">
        {renderContent()}
      </div>
    </div>
  );
};
