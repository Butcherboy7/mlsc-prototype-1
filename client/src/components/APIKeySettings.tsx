
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Key, Check, X } from 'lucide-react';
import { openAIService } from '@/lib/openai';

interface APIKeySettingsProps {
  onApiKeySet?: () => void;
}

const APIKeySettings: React.FC<APIKeySettingsProps> = ({ onApiKeySet }) => {
  const [apiKey, setApiKey] = useState('');
  const [isSet, setIsSet] = useState(!!openAIService.getApiKey());

  const handleSetApiKey = () => {
    if (apiKey.trim()) {
      openAIService.setApiKey(apiKey.trim());
      setIsSet(true);
      setApiKey('');
      onApiKeySet?.();
    }
  };

  const handleRemoveApiKey = () => {
    localStorage.removeItem('openai_api_key');
    setIsSet(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Key className="w-5 h-5 mr-2" />
          OpenAI API Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isSet ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Badge variant="outline" className="bg-green-50 border-green-200">
                <Check className="w-3 h-3 mr-1 text-green-600" />
                API Key Configured
              </Badge>
            </div>
            <Button variant="outline" onClick={handleRemoveApiKey}>
              <X className="w-4 h-4 mr-2" />
              Remove
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium">OpenAI API Key</label>
              <Input
                type="password"
                placeholder="sk-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Your API key is stored locally and never sent to our servers.
              </p>
            </div>
            <Button onClick={handleSetApiKey} disabled={!apiKey.trim()}>
              Set API Key
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default APIKeySettings;
