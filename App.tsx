
import React, { useState, useCallback } from 'react';
import { generateYoutubeContent, generateThumbnail, generateVideo } from './services/geminiService';
import type { GeneratedContent } from './types';
import { Header } from './components/Header';
import { InputSection } from './components/InputSection';
import { OutputSection } from './components/OutputSection';
import { LoadingSpinner } from './components/LoadingSpinner';
import { GenerationControls } from './components/GenerationControls';

const App: React.FC = () => {
  const [userInput, setUserInput] = useState<string>('');
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [isThumbnailLoading, setIsThumbnailLoading] = useState<boolean>(false);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [thumbnailError, setThumbnailError] = useState<string | null>(null);

  const [isVideoLoading, setIsVideoLoading] = useState<boolean>(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [videoStatus, setVideoStatus] = useState<string | null>(null);


  const parseApiResponse = (responseText: string): GeneratedContent => {
    const extractSection = (startTag: string, endTag: string) => {
      try {
        const result = responseText.split(startTag)[1].split(endTag)[0].trim();
        return result;
      } catch (e) {
        console.warn(`Could not parse section with tags ${startTag} and ${endTag}`);
        return '';
      }
    };

    return {
      trendingTopic: extractSection('[TRENDING_TOPIC]', '[END_TRENDING_TOPIC]'),
      youtubeTitles: extractSection('[YOUTUBE_TITLES]', '[END_YOUTUBE_TITLES]'),
      hashtags: extractSection('[HASHTAGS]', '[END_HASHTAGS]'),
      youtubeDescription: extractSection('[YOUTUBE_DESCRIPTION]', '[END_YOUTUBE_DESCRIPTION]'),
      teluguScript: extractSection('[TELUGU_SCRIPT]', '[END_TELUGU_SCRIPT]'),
      videoPrompt: extractSection('[VIDEO_PROMPT]', '[END_VIDEO_PROMPT]'),
      thumbnailPrompt: extractSection('[THUMBNAIL_PROMPT]', '[END_THUMBNAIL_PROMPT]'),
    };
  };
  
  const handleGenerateContent = useCallback(async () => {
    if (!userInput.trim()) {
      setError('Please enter a topic or instruction.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedContent(null);
    setThumbnailUrl(null);
    setVideoUrl(null);
    setThumbnailError(null);
    setVideoError(null);
    setVideoStatus(null);


    try {
      const responseText = await generateYoutubeContent(userInput);
      if (responseText) {
        const parsedContent = parseApiResponse(responseText);
        setGeneratedContent(parsedContent);
      } else {
        throw new Error('Received an empty response from the AI.');
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred. Please check the console.');
    } finally {
      setIsLoading(false);
    }
  }, [userInput]);

  const handleGenerateThumbnail = useCallback(async () => {
    if (!generatedContent?.thumbnailPrompt) return;

    setIsThumbnailLoading(true);
    setThumbnailError(null);
    setThumbnailUrl(null);
    try {
      const cleanPrompt = generatedContent.thumbnailPrompt.replace('**THUMBNAIL GENERATION PROMPT:**', '').trim();
      const url = await generateThumbnail(cleanPrompt);
      setThumbnailUrl(url);
    } catch (err) {
      setThumbnailError(err instanceof Error ? err.message : 'Failed to generate thumbnail.');
    } finally {
      setIsThumbnailLoading(false);
    }
  }, [generatedContent]);

  const handleGenerateVideo = useCallback(async () => {
    if (!generatedContent?.videoPrompt) return;

    setIsVideoLoading(true);
    setVideoError(null);
    setVideoUrl(null);
    try {
      const cleanPrompt = generatedContent.videoPrompt.replace('**VIDEO GENERATION PROMPT:**', '').trim();
      const url = await generateVideo(cleanPrompt, setVideoStatus);
      setVideoUrl(url);
    } catch (err) {
      setVideoError(err instanceof Error ? err.message : 'Failed to generate video.');
    } finally {
      setIsVideoLoading(false);
    }
  }, [generatedContent]);


  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <p className="text-center text-gray-400 mb-8">
          Enter a topic, and I'll generate a complete YouTube content strategy for your Telugu channel.
        </p>

        <InputSection 
          userInput={userInput}
          setUserInput={setUserInput}
          onGenerate={handleGenerateContent}
          isLoading={isLoading}
        />

        {isLoading && <LoadingSpinner />}
        
        {error && (
          <div className="mt-8 bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 rounded-lg text-center">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}

        {generatedContent && !isLoading && (
          <>
            <OutputSection content={generatedContent} />
            <GenerationControls
              onGenerateThumbnail={handleGenerateThumbnail}
              isThumbnailLoading={isThumbnailLoading}
              thumbnailUrl={thumbnailUrl}
              thumbnailError={thumbnailError}
              onGenerateVideo={handleGenerateVideo}
              isVideoLoading={isVideoLoading}
              videoUrl={videoUrl}
              videoError={videoError}
              videoStatus={videoStatus}
            />
          </>
        )}
      </main>
      <footer className="text-center py-4 text-gray-600 text-sm">
        <p>Powered by Google Gemini</p>
      </footer>
    </div>
  );
};

export default App;
