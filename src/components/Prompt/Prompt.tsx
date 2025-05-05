import React, { useState, useRef, useEffect } from 'react';
import { 
  TextArea, 
  Button, 
  Stack, 
  Tile,
  Form,
  Select,
  SelectItem,
  Tabs,
  Tab,
  FormGroup,
  Tag,
  AILabel
} from '@carbon/react';
import { Send, ArrowsHorizontal } from '@carbon/icons-react';
import './Prompt.scss';

interface Message {
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface PromptProps {
  onSubmit: (prompt: string) => void;
  isLoading: boolean;
}

type PromptMode = 'new' | 'convert';
type DesignSystem = 'material' | 'bootstrap' | 'ant' | 'chakra' | 'other';

// Sample quick examples
const QUICK_EXAMPLES = [
  { title: 'Data Table', prompt: 'Create a data table with pagination for user management' },
  { title: 'Form', prompt: 'Build a multi-step user registration form with validation' },
  { title: 'Dashboard', prompt: 'Design a dashboard layout with summary cards and charts' },
  { title: 'Login', prompt: 'Create a login page with email and password fields plus social logins' },
];

export const Prompt: React.FC<PromptProps> = ({ onSubmit, isLoading }) => {
  const [promptText, setPromptText] = useState('');
  const [promptMode, setPromptMode] = useState<PromptMode>('new');
  const [sourceDesignSystem, setSourceDesignSystem] = useState<DesignSystem>('material');
  const [useExample, setUseExample] = useState<boolean>(false);
  const [tabIndex, setTabIndex] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleTabChange = ({ selectedIndex }: { selectedIndex: number }) => {
    setTabIndex(selectedIndex);
    setPromptMode(selectedIndex === 0 ? 'new' : 'convert');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptText.trim()) return;
    let finalPrompt = promptText;
    setMessages(prev => [...prev, {
      type: 'user',
      content: finalPrompt,
      timestamp: new Date()
    }]);
    if (promptMode === 'convert') {
      finalPrompt = `Convert the following ${getDesignSystemLabel(sourceDesignSystem)} component to Carbon Design System: ${promptText}`;
    } else {
      finalPrompt = `Create a Carbon Design System component for: ${promptText}`;
    }
    onSubmit(finalPrompt);
    setPromptText('');
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

  const handleExampleClick = (example: string) => {
    setPromptText(example);
    setUseExample(true);
  };

  const trackPromptSubmission = (mode: PromptMode) => {
    console.log('Analytics: Prompt submitted', { 
      mode, 
      designSystem: promptMode === 'convert' ? sourceDesignSystem : null 
    });
  };

  const aiLabel = <AILabel className="ai-label-container" />;

  return (
    <Tile className="prompt__container">
      {tabIndex === 0 && (
        <>
          <h3 className="prompt__heading">What do you want to create?</h3>
          <div className="prompt__messages-container">
            {messages.length === 0 && (
              <div className="prompt__examples-container">
                <h4 className="prompt__examples-heading">Quick Examples</h4>
                <div className="prompt__examples-list">
                  {QUICK_EXAMPLES.map((example, index) => (
                    <Tag 
                      key={index} 
                      type="blue" 
                      onClick={() => handleExampleClick(example.prompt)}
                      className="prompt__example-tag"
                    >
                      {example.title}
                    </Tag>
                  ))}
                </div>
              </div>
            )}
            {messages.map((message, index) => (
              <div
                key={index}
                className={`prompt__message prompt__message--${message.type}`}
              >
                <div className={`prompt__message-content prompt__message-content--${message.type}`}>
                  {message.content}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <Form onSubmit={handleSubmit} className="prompt__form">
            <Stack gap={3}>
              <TextArea
                id="prompt-input"
                labelText=""
                placeholder="Type your message here..."
                value={promptText}
                onChange={(e) => {
                  setPromptText(e.target.value);
                  setUseExample(false);
                }}
                rows={3}
                decorator={aiLabel}
                className="prompt__textarea"
              />
              <div className="prompt__button-container">
                <Button
                  kind="primary"
                  type="submit"
                  renderIcon={Send}
                  disabled={!promptText.trim() || isLoading}
                  onClick={() => trackPromptSubmission('new')}
                >
                  {isLoading ? 'Generating...' : 'Send'}
                </Button>
              </div>
            </Stack>
          </Form>
        </>
      )}
    </Tile>
  );
}; 