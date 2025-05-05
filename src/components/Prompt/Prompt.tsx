import React, { useState } from 'react';
import { 
  TextArea, 
  Button, 
  Tile,
  Stack,
  Loading,
  AILabel
} from '@carbon/react';
import { Send, Watson, View, FolderOpen, Folders } from '@carbon/icons-react';
import { generateCode } from '../../services/api';
import './Prompt.scss';

interface PromptProps {
  onCodeGenerated: (code: string) => void;
}

const QUICK_EXAMPLES = [
  { title: 'Data Table', prompt: 'Create a data table with pagination for user management' },
  { title: 'Form', prompt: 'Build a multi-step user registration form with validation' },
  { title: 'Dashboard', prompt: 'Design a dashboard layout with summary cards and charts' },
  { title: 'Login', prompt: 'Create a login page with email and password fields plus social logins' },
];

export const Prompt: React.FC<PromptProps> = ({ onCodeGenerated }) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const finalPrompt = `Create a Carbon Design System component for: ${prompt}`;
      const response = await generateCode(finalPrompt);
      onCodeGenerated(response.code);
    } catch (err) {
      setError('Failed to generate code. Please try again.');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const aiLabel = (
    <AILabel className="ai-label-container" />
  );

  return (
    <Tile className="prompt">
        <h3>What do you want to create?</h3>
      <Stack gap={3} className="prompt__content">
        <TextArea
          labelText="Describe the component you want to create"
          placeholder="e.g., Create a data table with pagination and sorting"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={isLoading}
          className="prompt__textarea"
          decorator={aiLabel}
        />

        <div className="prompt__actions">
          <Button
            kind="primary"
            renderIcon={Send}
            onClick={handleSubmit}
            disabled={!prompt.trim() || isLoading}
          >
            {isLoading ? (
              <>
                <Loading small withOverlay={false} />
                <span style={{ marginLeft: '8px' }}>Generating...</span>
              </>
            ) : (
              'Generate Code'
            )}
          </Button>
        </div>

        {error && (
          <div className="prompt__error">
            {error}
          </div>
        )}
      </Stack>
    </Tile>
  );
}; 