import React, { useState } from 'react';
import { Theme, ContentSwitcher, Switch, TextArea, Select, SelectItem, Button } from '@carbon/react';
import Shell from './components/Shell';
import { Prompt } from './components/Prompt/Prompt';
import { CodeOutput } from './components/CodeOutput/CodeOutput';
import './App.scss';

function App() {
  const [generatedCode, setGeneratedCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sourceCode, setSourceCode] = useState('');
  const [sourceDesignSystem, setSourceDesignSystem] = useState('');
  const [targetFramework, setTargetFramework] = useState('react');
  const [activeMode, setActiveMode] = useState(0);

  const handleModeChange = ({ index }: { index?: number }) => {
    if (typeof index === 'number') {
      setActiveMode(index);
      setGeneratedCode(''); // Clear output when switching modes
    }
  };

  const handleGenerateCode = async (prompt: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });
      const data = await response.json();
      setGeneratedCode(data.code);
    } catch (error) {
      console.error('Error generating code:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConvertCode = async () => {
    if (!sourceCode || !sourceDesignSystem) return;
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/convert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sourceCode,
          sourceDesignSystem,
          targetFramework,
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
      <div className="app-content">
        <h1>Carbon Prototyper</h1>
        <p className="app-description">
          Generate and convert components using IBM Carbon Design System
        </p>
        <ContentSwitcher
          onChange={handleModeChange}
          selectedIndex={activeMode}
          className="mode-switcher"
          size="lg"
        >
          <Switch name="generate" text="Generate" />
          <Switch name="convert" text="Convert" />
        </ContentSwitcher>
        {activeMode === 0 && (
          <div className="app-layout">
            <div className="app-panel">
              <Prompt onCodeGenerated={setGeneratedCode} />
            </div>
            <div className="app-panel">
              <CodeOutput code={generatedCode} language="react" isLoading={isLoading} />
            </div>
          </div>
        )}
        {activeMode === 1 && (
          <div className="app-layout">
            <div className="app-panel">
              <div className="convert-controls">
                <Select
                  id="design-system-select"
                  labelText="Source Design System"
                  value={sourceDesignSystem}
                  onChange={(e) => setSourceDesignSystem(e.target.value)}
                >
                  <SelectItem value="" text="Select a design system" />
                  <SelectItem value="material-ui" text="Material UI" />
                  <SelectItem value="bootstrap" text="Bootstrap" />
                  <SelectItem value="ant-design" text="Ant Design" />
                  <SelectItem value="chakra-ui" text="Chakra UI" />
                </Select>
                <Select
                  id="framework-select"
                  labelText="Target Framework"
                  value={targetFramework}
                  onChange={(e) => setTargetFramework(e.target.value)}
                >
                  <SelectItem value="react" text="React" />
                  <SelectItem value="angular" text="Angular" />
                  <SelectItem value="vue" text="Vue" />
                </Select>
                <TextArea
                  id="source-code"
                  labelText="Source Code"
                  value={sourceCode}
                  onChange={(e) => setSourceCode(e.target.value)}
                  rows={10}
                />
                <Button onClick={handleConvertCode} disabled={isLoading || !sourceCode || !sourceDesignSystem}>
                  Convert Code
                </Button>
              </div>
            </div>
            <div className="app-panel">
              <CodeOutput code={generatedCode} language="react" isLoading={isLoading} />
            </div>
          </div>
        )}
      </div>
    </Shell>
  );
}

export default App;
