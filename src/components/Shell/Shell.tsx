import React, { useState } from 'react';
import { Content, Theme } from '@carbon/react';
import AppHeader from './Header';

interface ShellProps {
  children: React.ReactNode;
}

const Shell: React.FC<ShellProps> = ({ children }) => {
  const [isSideNavExpanded, setIsSideNavExpanded] = useState(false);

  const handleSideNavExpand = () => {
    setIsSideNavExpanded(!isSideNavExpanded);
  };

  return (
    <Theme theme="g100" style={{ minHeight: '100vh' }}>
      <AppHeader 
        isSideNavExpanded={isSideNavExpanded} 
        onClickSideNavExpand={handleSideNavExpand} 
      />
      <Content style={{ backgroundColor: '#161616', minHeight: 'calc(100vh - 48px)' }}>
        {children}
      </Content>
    </Theme>
  );
};

export default Shell; 