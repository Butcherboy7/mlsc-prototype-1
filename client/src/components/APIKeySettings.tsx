
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Key, Check } from 'lucide-react';

interface APIKeySettingsProps {
  onApiKeySet?: () => void;
}

const APIKeySettings: React.FC<APIKeySettingsProps> = ({ onApiKeySet }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Key className="w-5 h-5 mr-2" />
          AI Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Badge variant="outline" className="bg-green-50 border-green-200 dark:bg-green-900 dark:border-green-700">
              <Check className="w-3 h-3 mr-1 text-green-600 dark:text-green-400" />
              Gemini AI Ready
            </Badge>
          </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Your app is configured with Google Gemini AI for all AI features including chat, note generation, PDF summarization, and code assistance.
        </p>
      </CardContent>
    </Card>
  );
};

export default APIKeySettings;
