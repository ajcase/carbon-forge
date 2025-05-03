import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { 
  Tile, 
  Button, 
  OverflowMenu, 
  OverflowMenuItem, 
  Toggle,
  Stack,
  InlineNotification
} from '@carbon/react';
import { Copy, Code, Checkmark, View, ViewOff } from '@carbon/icons-react';

type LanguageOption = 'react' | 'angular' | 'vue' | 'svelte' | 'web-components';

interface CodeOutputProps {
  code: string;
  language: LanguageOption;
  onLanguageChange: (language: LanguageOption) => void;
}

const CodeOutput: React.FC<CodeOutputProps> = ({ 
  code, 
  language, 
  onLanguageChange 
}) => {
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    
    // Track analytics event
    console.log('Analytics: Code copied', { language });
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  // Track language change analytics
  const handleLanguageChange = (lang: LanguageOption) => {
    console.log('Analytics: Language changed', { from: language, to: lang });
    onLanguageChange(lang);
  };

  // Map language to syntax highlighter language
  const getSyntaxLanguage = () => {
    switch (language) {
      case 'react':
      case 'vue':
      case 'svelte':
        return 'jsx';
      case 'angular':
        return 'typescript';
      case 'web-components':
        return 'javascript';
      default:
        return 'jsx';
    }
  };

  return (
    <Tile style={{ backgroundColor: '#262626', height: '100%' }}>
      <Stack gap={5}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Toggle
            id="preview-toggle"
            labelText="Preview Component"
            labelA="Code"
            labelB="Preview"
            defaultToggled={showPreview}
            onChange={() => setShowPreview(!showPreview)}
            size="sm"
          />
          <div>
            <OverflowMenu flipped ariaLabel="Language options">
              <OverflowMenuItem 
                itemText={language === 'react' ? "React ✓" : "React"} 
                onClick={() => handleLanguageChange('react')}
              />
              <OverflowMenuItem 
                itemText={language === 'angular' ? "Angular ✓" : "Angular"} 
                onClick={() => handleLanguageChange('angular')}
              />
              <OverflowMenuItem 
                itemText={language === 'vue' ? "Vue ✓" : "Vue"} 
                onClick={() => handleLanguageChange('vue')}
              />
              <OverflowMenuItem 
                itemText={language === 'svelte' ? "Svelte ✓" : "Svelte"} 
                onClick={() => handleLanguageChange('svelte')}
              />
              <OverflowMenuItem 
                itemText={language === 'web-components' ? "Web Components ✓" : "Web Components"} 
                onClick={() => handleLanguageChange('web-components')}
              />
            </OverflowMenu>
            <Button 
              hasIconOnly 
              renderIcon={Copy} 
              tooltipPosition="bottom"
              tooltipAlignment="center"
              iconDescription="Copy code"
              onClick={handleCopyCode}
              kind="ghost"
            />
          </div>
        </div>
        
        {copied && (
          <InlineNotification
            kind="success"
            title="Copied!"
            subtitle="Code copied to clipboard"
            lowContrast
            hideCloseButton
          />
        )}
        
        <div style={{ position: 'relative' }}>
          {showPreview ? (
            <div style={{ 
              padding: '1rem',
              backgroundColor: '#f4f4f4',
              color: '#161616',
              borderRadius: '4px',
              height: '500px',
              overflow: 'auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column'
            }}>
              <View size={32} style={{ marginBottom: '1rem' }} />
              <p>Component preview will be shown here in a future update</p>
            </div>
          ) : code ? (
            <SyntaxHighlighter
              language={getSyntaxLanguage()}
              style={atomDark}
              customStyle={{
                margin: 0,
                borderRadius: '4px',
                maxHeight: '500px',
                overflow: 'auto',
                backgroundColor: '#1e1e1e'
              }}
            >
              {code}
            </SyntaxHighlighter>
          ) : (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              height: '500px',
              backgroundColor: '#262A32',
              borderRadius: '4px',
              color: '#8D8D8D',
              flexDirection: 'column'
            }}>
              <Code size={32} style={{ marginBottom: '1rem' }} />
              <span>Generated code will appear here</span>
              <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                Try entering a prompt on the left to generate a component
              </p>
            </div>
          )}
        </div>
      </Stack>
    </Tile>
  );
};

export default CodeOutput; 