
import React from 'react';

interface GenerationControlsProps {
  onGenerateThumbnail: () => void;
  isThumbnailLoading: boolean;
  thumbnailUrl: string | null;
  thumbnailError: string | null;
  onGenerateVideo: () => void;
  isVideoLoading: boolean;
  videoUrl: string | null;
  videoError: string | null;
  videoStatus: string | null;
}

export const GenerationControls: React.FC<GenerationControlsProps> = ({
  onGenerateThumbnail,
  isThumbnailLoading,
  thumbnailUrl,
  thumbnailError,
  onGenerateVideo,
  isVideoLoading,
  videoUrl,
  videoError,
  videoStatus,
}) => {
  return (
    <div className="mt-10 bg-gray-800/50 border border-gray-700 rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-center mb-6 text-purple-400">Generate Media</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Thumbnail Generation */}
        <div className="flex flex-col items-center gap-4 p-4 bg-gray-800 rounded-lg">
          <h3 className="text-lg font-semibold">1. Generate Thumbnail</h3>
          <button
            onClick={onGenerateThumbnail}
            disabled={isThumbnailLoading || isVideoLoading}
            className="w-full flex items-center justify-center bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            {isThumbnailLoading ? 'Generating...' : 'Generate Thumbnail'}
          </button>
          <div className="w-full aspect-video bg-gray-700 rounded-md flex items-center justify-center mt-2">
            {isThumbnailLoading && <p className="text-gray-400">Creating image...</p>}
            {thumbnailError && <p className="text-red-400 text-center p-2">{thumbnailError}</p>}
            {thumbnailUrl && <img src={thumbnailUrl} alt="Generated Thumbnail" className="w-full h-full object-cover rounded-md" />}
            {!isThumbnailLoading && !thumbnailError && !thumbnailUrl && <p className="text-gray-500">Preview will appear here</p>}
          </div>
        </div>

        {/* Video Generation */}
        <div className="flex flex-col items-center gap-4 p-4 bg-gray-800 rounded-lg">
          <h3 className="text-lg font-semibold">2. Generate Video</h3>
          <button
            onClick={onGenerateVideo}
            disabled={isVideoLoading || isThumbnailLoading}
            className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            {isVideoLoading ? 'Generating...' : 'Generate Video'}
          </button>
          <div className="w-full aspect-video bg-gray-700 rounded-md flex items-center justify-center mt-2">
            {isVideoLoading && <p className="text-gray-400 text-center p-2">{videoStatus || 'Initializing...'}</p>}
            {videoError && <p className="text-red-400 text-center p-2">{videoError}</p>}
            {videoUrl && <video src={videoUrl} controls className="w-full h-full object-cover rounded-md" />}
            {!isVideoLoading && !videoError && !videoUrl && <p className="text-gray-500">Preview will appear here</p>}
          </div>
        </div>
      </div>
      {videoStatus && (
        <p className="text-center text-sm text-yellow-400 mt-4 animate-pulse">{videoStatus}</p>
      )}
    </div>
  );
};
