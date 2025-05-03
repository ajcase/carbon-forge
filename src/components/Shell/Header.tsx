import React from 'react';
import {
  Header,
  HeaderContainer,
  HeaderName,
  HeaderNavigation,
  HeaderMenuButton,
  HeaderMenuItem,
  HeaderGlobalBar,
  HeaderGlobalAction,
  SkipToContent,
  SideNav,
  SideNavItems,
  SideNavLink,
  SideNavMenu,
  SideNavMenuItem,
} from '@carbon/react';
import { Switcher, Help, Information } from '@carbon/icons-react';

interface AppHeaderProps {
  isSideNavExpanded: boolean;
  onClickSideNavExpand: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({ 
  isSideNavExpanded, 
  onClickSideNavExpand 
}) => {
  return (
    <HeaderContainer
      render={({ isSideNavExpanded }) => (
        <Header aria-label="Carbon Prototyper">
          <SkipToContent />
          <HeaderMenuButton
            aria-label="Open menu"
            onClick={onClickSideNavExpand}
            isActive={isSideNavExpanded}
          />
          <HeaderName href="/" prefix="Carbon">
            Prototyper
          </HeaderName>
          <HeaderNavigation aria-label="Carbon Prototyper">
            <HeaderMenuItem href="#">New Component</HeaderMenuItem>
            <HeaderMenuItem href="#">Convert Component</HeaderMenuItem>
            <HeaderMenuItem href="#">Examples</HeaderMenuItem>
          </HeaderNavigation>
          <HeaderGlobalBar>
            <HeaderGlobalAction aria-label="Help" tooltipAlignment="center">
              <Help size={20} />
            </HeaderGlobalAction>
            <HeaderGlobalAction
              aria-label="Information"
              tooltipAlignment="center"
            >
              <Information size={20} />
            </HeaderGlobalAction>
            <HeaderGlobalAction
              aria-label="App Switcher"
              tooltipAlignment="end"
            >
              <Switcher size={20} />
            </HeaderGlobalAction>
          </HeaderGlobalBar>
          <SideNav
            aria-label="Side navigation"
            expanded={isSideNavExpanded}
            isPersistent={false}
          >
            <SideNavItems>
              <SideNavLink href="#" isActive>
                New Component
              </SideNavLink>
              <SideNavLink href="#">Convert Component</SideNavLink>
              <SideNavMenu renderIcon={Information} title="About">
                <SideNavMenuItem href="#">Carbon Design System</SideNavMenuItem>
                <SideNavMenuItem href="#">Documentation</SideNavMenuItem>
              </SideNavMenu>
              <SideNavLink href="#">Examples</SideNavLink>
            </SideNavItems>
          </SideNav>
        </Header>
      )}
    />
  );
};

export default AppHeader; 