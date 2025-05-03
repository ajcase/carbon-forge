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
  TabList,
  TabPanels,
  TabPanel,
  FormGroup,
  Tag
} from '@carbon/react';
import { Send, Add, ArrowsHorizontal } from '@carbon/icons-react';

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

const Prompt: React.FC<PromptProps> = ({ onSubmit, isLoading }) => {
  const [promptText, setPromptText] = useState('');
  const [promptMode, setPromptMode] = useState<PromptMode>('new');
  const [sourceDesignSystem, setSourceDesignSystem] = useState<DesignSystem>('material');
  const [useExample, setUseExample] = useState<boolean>(false);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!promptText.trim()) return;
    
    let finalPrompt = promptText;
    
    // Add user message to chat
    setMessages(prev => [...prev, {
      type: 'user',
      content: finalPrompt,
      timestamp: new Date()
    }]);
    
    // Enhance prompt based on mode
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

  // Track analytics event
  const trackPromptSubmission = (mode: PromptMode) => {
    console.log('Analytics: Prompt submitted', { 
      mode, 
      designSystem: promptMode === 'convert' ? sourceDesignSystem : null 
    });
  };

  const handleTabChange = (state: { selectedIndex: number }) => {
    setActiveTabIndex(state.selectedIndex);
    setPromptMode(state.selectedIndex === 0 ? 'new' : 'convert');
  };

  return (
    <Tile style={{ 
      backgroundColor: '#262626', 
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Tabs selectedIndex={activeTabIndex} onChange={handleTabChange}>
        <TabList aria-label="Prompt Type" contained>
          <Tab>Create New</Tab>
          <Tab>Convert Existing</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <div style={{ 
              flex: 1, 
              overflowY: 'auto',
              padding: '1rem',
              marginBottom: '1rem'
            }}>
              {messages.length === 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <h4>Quick Examples</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {QUICK_EXAMPLES.map((example, index) => (
                      <Tag 
                        key={index} 
                        type="blue" 
                        onClick={() => handleExampleClick(example.prompt)} 
                        style={{ cursor: 'pointer' }}
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
                  style={{
                    display: 'flex',
                    justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
                    marginBottom: '1rem'
                  }}
                >
                  <div
                    style={{
                      backgroundColor: message.type === 'user' ? '#0f62fe' : '#393939',
                      color: '#fff',
                      padding: '0.75rem 1rem',
                      borderRadius: '1rem',
                      maxWidth: '80%',
                      wordBreak: 'break-word'
                    }}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <Form onSubmit={handleSubmit} style={{ padding: '1rem' }}>
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
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
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
          </TabPanel>

          <TabPanel>
            <div style={{ 
              flex: 1, 
              overflowY: 'auto',
              padding: '1rem',
              marginBottom: '1rem'
            }}>
              {messages.map((message, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
                    marginBottom: '1rem'
                  }}
                >
                  <div
                    style={{
                      backgroundColor: message.type === 'user' ? '#0f62fe' : '#393939',
                      color: '#fff',
                      padding: '0.75rem 1rem',
                      borderRadius: '1rem',
                      maxWidth: '80%',
                      wordBreak: 'break-word'
                    }}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <Form onSubmit={handleSubmit} style={{ padding: '1rem' }}>
              <Stack gap={3}>
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
                
                <TextArea
                  id="convert-input"
                  labelText=""
                  placeholder="Paste your component code here..."
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  rows={3}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    kind="primary"
                    type="submit"
                    renderIcon={ArrowsHorizontal}
                    disabled={!promptText.trim() || isLoading}
                    onClick={() => trackPromptSubmission('convert')}
                  >
                    {isLoading ? 'Converting...' : 'Convert to Carbon'}
                  </Button>
                </div>
              </Stack>
            </Form>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Tile>
  );
};

export default Prompt; 