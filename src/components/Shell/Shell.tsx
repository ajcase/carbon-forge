import React, { useState } from 'react';
import { Content, Theme, Grid, Column } from '@carbon/react';
import AppHeader from './Header';

interface ShellProps {
  children: React.ReactNode;
}

const Shell: React.FC<ShellProps> = ({ children }) => {
  const [isSideNavExpanded, setIsSideNavExpanded] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<'g100' | 'white'>('g100');

  const handleSideNavExpand = () => {
    setIsSideNavExpanded(!isSideNavExpanded);
  };

  const handleThemeSwitch = () => {
    setCurrentTheme(currentTheme === 'g100' ? 'white' : 'g100');
  };

  return (
    <Theme theme={currentTheme} style={{ minHeight: '100vh' }}>
      <AppHeader 
        isSideNavExpanded={isSideNavExpanded} 
        onClickSideNavExpand={handleSideNavExpand}
        currentTheme={currentTheme}
        onThemeSwitch={handleThemeSwitch}
      />
      <Content style={{ backgroundColor: currentTheme === 'g100' ? '#161616' : '#ffffff', minHeight: 'calc(100vh - 48px)' }}>
        <Grid>{children}</Grid>
      </Content>
    </Theme>
  );
};

export default Shell; 