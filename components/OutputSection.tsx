
import React from 'react';
import type { GeneratedContent } from '../types';
import { OutputCard } from './OutputCard';

interface OutputSectionProps {
  content: GeneratedContent;
}

export const OutputSection: React.FC<OutputSectionProps> = ({ content }) => {
  const sections: { title: string; contentKey: keyof GeneratedContent }[] = [
    { title: 'Trending Topic Analysis', contentKey: 'trendingTopic' },
    { title: 'High-CTR YouTube Titles', contentKey: 'youtubeTitles' },
    { title: 'Viral Hashtags', contentKey: 'hashtags' },
    { title: 'SEO YouTube Description', contentKey: 'youtubeDescription' },
    { title: 'Telugu Video Script', contentKey: 'teluguScript' },
    { title: 'AI Video Generation Prompt', contentKey: 'videoPrompt' },
    { title: 'AI Thumbnail Generation Prompt', contentKey: 'thumbnailPrompt' },
  ];

  return (
    <div className="mt-10 space-y-6">
      {sections.map(section => (
        content[section.contentKey] && (
          <OutputCard 
            key={section.contentKey}
            title={section.title}
            content={content[section.contentKey]}
          />
        )
      ))}
    </div>
  );
};
