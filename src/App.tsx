import React, { useState } from 'react';
import { Theme, ContentSwitcher, Switch, TextArea, Select, SelectItem, Button, Column } from '@carbon/react';
import Shell from './components/Shell';
import { Prompt } from './components/Prompt/Prompt';
import { Convert } from './components/Convert/Convert';
import { CodeOutput } from './components/CodeOutput/CodeOutput';
import './App.scss';

function App() {
  const [generatedCode, setGeneratedCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sourceCode, setSourceCode] = useState('');
  const [sourceDesignSystem, setSourceDesignSystem] = useState('');
  const [targetFramework, setTargetFramework] = useState('react');
  const [activeMode, setActiveMode] = useState(0);
  const [selectedModel, setSelectedModel] = useState('meta-llama/llama-3-3-70b-instruct');

  const handleModeChange = ({ index }: { index?: number }) => {
    if (typeof index === 'number') {
      setActiveMode(index);
      setGeneratedCode(''); // Clear output when switching modes
    }
  };

  const handleGenerateCode = async (prompt: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, model: selectedModel }),
      });
      const data = await response.json();
      setGeneratedCode(data.code);
    } catch (error) {
      console.error('Error generating code:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConvertCode = async (sourceCode: string, sourceDesignSystem: string, targetFramework: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/convert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sourceCode,
          sourceDesignSystem,
          targetFramework,
          model: selectedModel,
        }),
      });
      const data = await response.json();
      setGeneratedCode(data.code);
    } catch (error) {
      console.error('Error converting code:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Shell>
      <Column lg={16}>
      <div className="main-container">
        <div className="app-content">
          <h1>Forge</h1>
          <p className="app-description">
            Transform your UI. Accelerate your migration to Carbon.
          </p>
          <div className="switchers-container">
            <ContentSwitcher
              onChange={handleModeChange}
              selectedIndex={activeMode}
              className="mode-switcher"
              size="lg"
            >
              <Switch name="generate" text="Generate" />
              <Switch name="convert" text="Convert" />
            </ContentSwitcher>
            <div className="model-group">
              <span className="model-label">Model</span>
              <Select
                id="model-select"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="model-select"
                size="lg"
                labelText=""
              >
                <SelectItem value="meta-llama/llama-3-3-70b-instruct" text="Llama 3" />
                <SelectItem value="ibm/granite-13b-instruct-v2" text="Granite 13B" />
              </Select>
            </div>
          </div>
          {activeMode === 0 && (
            <div className="app-layout">
              <div className="app-panel">
                <Prompt onSubmit={handleGenerateCode} isLoading={isLoading} />
              </div>
              <div className="app-panel">
                <CodeOutput code={generatedCode} language="react" isLoading={isLoading} />
              </div>
            </div>
          )}
          {activeMode === 1 && (
            <div className="app-layout">
              <div className="app-panel">
                <Convert onConvert={handleConvertCode} isLoading={isLoading} />
              </div>
              <div className="app-panel">
                <CodeOutput code={generatedCode} language="react" isLoading={isLoading} />
              </div>
            </div>
          )}
        </div>
      </div>
      </Column>
    </Shell>
  );
}

export default App;
