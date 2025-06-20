import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { PlayCircle, Loader2, ExternalLink } from 'lucide-react';
import { geminiService } from '@/lib/gemini';

interface VideoSearchButtonProps {
  content: string;
  mode: string;
  className?: string;
}

interface VideoResult {
  title: string;
  description: string;
  url: string;
}

const VideoSearchButton: React.FC<VideoSearchButtonProps> = ({ 
  content, 
  mode, 
  className = "" 
}) => {
  const [isSearching, setIsSearching] = useState(false);
  const [videoResult, setVideoResult] = useState<VideoResult | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string>('');

  const searchForVideo = async () => {
    setIsSearching(true);
    setError('');
    setVideoResult(null);
    
    try {
      const prompt = `Based on this educational content, find a specific educational YouTube video that would help explain these concepts. You should suggest a real, well-known educational video with accurate details.

Return ONLY in this exact format:
TITLE: [Specific video title from a real educational channel]
DESCRIPTION: [One line explaining why this video helps with the topic]
URL: [Direct YouTube video URL - use format: https://www.youtube.com/watch?v=VIDEO_ID]

Focus on popular educational channels like Khan Academy, 3Blue1Brown, Crash Course, Professor Leonard, MIT OpenCourseWare, etc.

Content to find video for:
${content.substring(0, 400)}...`;

      const response = await geminiService.contextualChat(prompt, mode, 'video-search');
      
      // Parse the response
      const lines = response.split('\n').filter(line => line.trim());
      const titleLine = lines.find(line => line.startsWith('TITLE:'));
      const descLine = lines.find(line => line.startsWith('DESCRIPTION:'));
      const urlLine = lines.find(line => line.startsWith('URL:'));
      
      if (titleLine && descLine && urlLine) {
        const title = titleLine.replace('TITLE:', '').trim();
        const description = descLine.replace('DESCRIPTION:', '').trim();
        let videoUrl = urlLine.replace('URL:', '').trim();
        
        // Validate and clean the URL
        if (!videoUrl.includes('youtube.com/watch') && !videoUrl.includes('youtu.be/')) {
          // If AI didn't provide a proper URL, create a targeted search
          const searchTerms = `${title} educational video`;
          videoUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchTerms)}`;
        }
        
        setVideoResult({
          title,
          description,
          url: videoUrl
        });
        setIsModalOpen(true);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Video search failed:', error);
      setError('Could not find a relevant video. Please try again or search YouTube manually.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={searchForVideo}
        disabled={isSearching}
        className={`h-8 px-3 text-xs transition-all duration-200 hover:scale-105 hover:shadow-md ${className}`}
      >
        {isSearching ? (
          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
        ) : (
          <PlayCircle className="w-3 h-3 mr-1" />
        )}
        {isSearching ? 'Searching...' : 'Explain with Video'}
      </Button>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md" aria-describedby="video-suggestion-description">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <PlayCircle className="w-5 h-5" />
              <span>Video Suggestion</span>
            </DialogTitle>
          </DialogHeader>
          <div id="video-suggestion-description" className="sr-only">
            AI-powered educational video recommendation based on the current content
          </div>

          {error ? (
            <div className="text-center py-6">
              <p className="text-destructive text-sm">{error}</p>
              <Button 
                variant="outline" 
                onClick={() => setIsModalOpen(false)}
                className="mt-4"
              >
                Close
              </Button>
            </div>
          ) : videoResult ? (
            <div className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-sm mb-2">{videoResult.title}</h3>
                  <p className="text-xs text-muted-foreground mb-3">{videoResult.description}</p>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => window.open(videoResult.url, '_blank')}
                      className="flex-1"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Watch on YouTube
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsModalOpen(false)}
                    >
                      Close
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <p className="text-xs text-muted-foreground text-center">
                This will search YouTube for the suggested video
              </p>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VideoSearchButton;