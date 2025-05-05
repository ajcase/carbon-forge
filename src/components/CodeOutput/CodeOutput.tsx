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

  return (
    <div className="code-output">
      <div className="code-output__header">
        <h3>Generated Code</h3>
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
            language={language}
            style={vscDarkPlus}
            customStyle={{ margin: 0 }}
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