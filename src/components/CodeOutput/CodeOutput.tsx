import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy } from '@carbon/icons-react';
import { Button, InlineNotification, Loading } from '@carbon/react';
import './CodeOutput.scss';

interface CodeOutputProps {
  code: string;
  language: string;
  isLoading?: boolean;
}

export const CodeOutput: React.FC<CodeOutputProps> = ({ code, language, isLoading = false }) => {
  const [showCopyNotification, setShowCopyNotification] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setShowCopyNotification(true);
      setTimeout(() => setShowCopyNotification(false), 3000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  // Map language to syntax highlighter language
  const getSyntaxLanguage = () => {
    switch (language.toLowerCase()) {
      case 'react':
        return 'jsx';
      case 'angular':
        return 'typescript';
      case 'vue':
        return 'javascript';
      default:
        return 'javascript';
    }
  };

  return (
    <div className="code-output">
      <div className="code-output__header">
      <h3 className="prompt__heading">Generated Code</h3>
        <Button
          kind="ghost"
          size="sm"
          renderIcon={Copy}
          iconDescription="Copy code"
          onClick={handleCopy}
          disabled={!code || isLoading}
        >
          Copy
        </Button>
      </div>
      
      {showCopyNotification && (
        <InlineNotification
          kind="success"
          title="Code copied to clipboard"
          hideCloseButton
          lowContrast
        />
      )}

      <div className="code-output__content">
        {isLoading ? (
          <div className="code-output__loading">
            <Loading withOverlay={false} />
            <p>Generating code...</p>
          </div>
        ) : code ? (
          <SyntaxHighlighter
            language={getSyntaxLanguage()}
            style={vscDarkPlus}
            customStyle={{
              margin: 0,
              padding: '1rem',
              borderRadius: '4px',
              backgroundColor: 'var(--cds-layer)',
              fontSize: '14px',
              lineHeight: '1.5',
              fontFamily: 'IBM Plex Mono, monospace'
            }}
            showLineNumbers
            wrapLines
          >
            {code}
          </SyntaxHighlighter>
        ) : (
          <div className="code-output__empty">
            <p>Your generated code will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
}; 