import React from 'react';
import ReactDOM from 'react-dom';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, View } from '@carbon/icons-react';
import { Button, InlineNotification, Loading, Modal } from '@carbon/react';
import { SandpackProvider, SandpackLayout, SandpackCodeEditor, SandpackPreview } from '@codesandbox/sandpack-react';
import { sandpackDark } from '@codesandbox/sandpack-themes';
import './CodeOutput.scss';

interface CodeOutputProps {
  code: string;
  language: string;
  isLoading?: boolean;
}

export const CodeOutput: React.FC<CodeOutputProps> = ({ code, language, isLoading = false }) => {
  const [showCopyNotification, setShowCopyNotification] = React.useState(false);
  const [showPreview, setShowPreview] = React.useState(false);

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

  const files = {
    '/App.js': `import React from 'react';
import '@carbon/styles/css/styles.css';

${code}`,
    '/index.js': `import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,
    '/index.html': `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Carbon Component Preview</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`
  };

  const PreviewModal = () => {
    if (!showPreview) return null;
    
    return ReactDOM.createPortal(
      <Modal
        open={true}
        modalHeading="Live Preview"
        modalLabel="Code Preview"
        primaryButtonText="Close"
        onRequestClose={() => setShowPreview(false)}
        onRequestSubmit={() => setShowPreview(false)}
        size="lg"
        modalAriaLabel="Live preview of generated code"
        passiveModal={false}
        hasScrollingContent={true}
      >
        <div style={{ height: '80vh', width: '100%', position: 'relative' }}>
          <SandpackProvider
            template="react"
            theme={sandpackDark}
            files={files}
            options={{
              activeFile: '/App.js',
              visibleFiles: ['/App.js', '/index.js'],
              externalResources: ['https://unpkg.com/@carbon/styles/css/styles.css']
            }}
            customSetup={{
              dependencies: {
                "@carbon/react": "^1.81.0",
                "@carbon/styles": "^1.80.0",
                "@carbon/icons-react": "^11.59.0",
                "@carbon/type": "^11.39.0",
                'react': '^18.2.0',
                'react-dom': '^18.2.0',
                'react-router-dom': '^7.0.0'
              }
            }}
          >
            <SandpackLayout>
              <SandpackCodeEditor
                showLineNumbers
                showInlineErrors
                wrapContent
              />
              <SandpackPreview />
            </SandpackLayout>
          </SandpackProvider>
        </div>
      </Modal>,
      document.body
    );
  };

  return (
    <div className="code-output">
      <div className="code-output__header">
        <h3 className="prompt__heading">Generated Code</h3>
        <div className="code-output__actions">
          <Button
            kind="ghost"
            size="sm"
            renderIcon={View}
            iconDescription="View live preview"
            onClick={() => setShowPreview(true)}
            disabled={!code || isLoading}
          >
            View live preview
          </Button>
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

      <PreviewModal />
    </div>
  );
}; 