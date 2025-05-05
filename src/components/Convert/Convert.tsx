import React, { useState } from 'react';
import { Select, SelectItem, TextArea, Button, AILabel } from '@carbon/react';
import './Convert.scss';

interface ConvertProps {
  onConvert: (sourceCode: string, sourceDesignSystem: string, targetFramework: string) => void;
  isLoading: boolean;
}

export const Convert: React.FC<ConvertProps> = ({ onConvert, isLoading }) => {
  const [sourceCode, setSourceCode] = useState('');
  const [sourceDesignSystem, setSourceDesignSystem] = useState('');
  const [targetFramework, setTargetFramework] = useState('react');

  const handleConvert = () => {
    onConvert(sourceCode, sourceDesignSystem, targetFramework);
  };

  const aiLabel = <AILabel className="ai-label-container" />;

  return (
    <div className="convert-controls">
    <h3 className="prompt__heading">What do you want to create?</h3>
      <Select
        id="design-system-select"
        labelText="Source Design System"
        value={sourceDesignSystem}
        onChange={(e) => setSourceDesignSystem(e.target.value)}
        className="convert-controls__select"
      >
        <SelectItem value="" text="Select a design system" />
        <SelectItem value="material-ui" text="Material UI" />
        <SelectItem value="bootstrap" text="Bootstrap" />
        <SelectItem value="ant-design" text="Ant Design" />
        <SelectItem value="chakra-ui" text="Chakra UI" />
        <SelectItem value="other" text="Other" />
      </Select>
      <Select
        id="framework-select"
        labelText="Target Framework"
        value={targetFramework}
        onChange={(e) => setTargetFramework(e.target.value)}
        className="convert-controls__select"
      >
        <SelectItem value="react" text="React" />
        <SelectItem value="web-components" text="Web Components" />
      </Select>
      <TextArea
        id="source-code"
        labelText="Source Code"
        value={sourceCode}
        onChange={(e) => setSourceCode(e.target.value)}
        rows={10}
        decorator={aiLabel}
        className="convert-controls__textarea"
      />
      <Button 
        onClick={handleConvert} 
        disabled={isLoading || !sourceCode || !sourceDesignSystem}
      >
        Convert Code
      </Button>
    </div>
  );
}; 