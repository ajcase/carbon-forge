import React, { useState } from 'react';
import { 
  TextArea, 
  Select, 
  SelectItem, 
  Button, 
  Tabs, 
  Tab, 
  FormGroup,
  Tile,
  Stack,
  Loading
} from '@carbon/react';
import { Send, ArrowsHorizontal } from '@carbon/icons-react';
import { generateCode, refineCode } from '../../services/api';
import './Prompt.scss';

interface PromptProps {
  onCodeGenerated: (code: string) => void;
}

type PromptMode = 'new' | 'convert';
type DesignSystem = 'material' | 'bootstrap' | 'ant' | 'chakra' | 'other';

const QUICK_EXAMPLES = [
  { title: 'Data Table', prompt: 'Create a data table with pagination for user management' },
  { title: 'Form', prompt: 'Build a multi-step user registration form with validation' },
  { title: 'Dashboard', prompt: 'Design a dashboard layout with summary cards and charts' },
  { title: 'Login', prompt: 'Create a login page with email and password fields plus social logins' },
];

export const Prompt: React.FC<PromptProps> = ({ onCodeGenerated }) => {
  const [prompt, setPrompt] = useState('');
  const [mode, setMode] = useState<PromptMode>('new');
  const [sourceDesignSystem, setSourceDesignSystem] = useState<DesignSystem>('material');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      let finalPrompt = prompt;
      if (mode === 'convert') {
        finalPrompt = `Convert the following ${getDesignSystemLabel(sourceDesignSystem)} component to Carbon Design System: ${prompt}`;
      } else {
        finalPrompt = `Create a Carbon Design System component for: ${prompt}`;
      }

      const response = await generateCode(finalPrompt);
      onCodeGenerated(response.code);
    } catch (err) {
      setError('Failed to generate code. Please try again.');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getDesignSystemLabel = (ds: DesignSystem): string => {
    switch (ds) {
      case 'material': return 'Material UI';
      case 'bootstrap': return 'Bootstrap';
      case 'ant': return 'Ant Design';
      case 'chakra': return 'Chakra UI';
      case 'other': return 'Other Design System';
    }
  };

  return (
    <Tile className="prompt">
      <Tabs>
        <Tab
          id="new-component-tab"
          title="New Component"
          onClick={() => setMode('new')}
        />
        <Tab
          id="convert-component-tab"
          title="Convert Component"
          onClick={() => setMode('convert')}
        />
      </Tabs>

      <Stack gap={3} className="prompt__content">
        {mode === 'convert' && (
          <FormGroup legendText="Source Design System">
            <Select 
              id="design-system-select" 
              labelText="Convert from" 
              value={sourceDesignSystem}
              onChange={(e) => setSourceDesignSystem(e.target.value as DesignSystem)}
            >
              <SelectItem value="material" text="Material UI" />
              <SelectItem value="bootstrap" text="Bootstrap" />
              <SelectItem value="ant" text="Ant Design" />
              <SelectItem value="chakra" text="Chakra UI" />
              <SelectItem value="other" text="Other" />
            </Select>
          </FormGroup>
        )}

        <TextArea
          labelText={mode === 'new' ? "Describe the component you want to create" : "Paste your component code"}
          placeholder={mode === 'new' 
            ? "e.g., Create a data table with pagination and sorting"
            : "Paste your component code here"}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={isLoading}
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