import React, { useState } from 'react';
import { Grid, Column, Theme } from '@carbon/react';
import Shell from './components/Shell';
import Prompt from './components/Prompt';
import CodeOutput from './components/CodeOutput';

type LanguageOption = 'react' | 'angular' | 'vue' | 'svelte' | 'web-components';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState<LanguageOption>('react');

  const handleGenerateCode = async (prompt: string) => {
    setIsLoading(true);
    
    // Track analytics event for code generation
    console.log('Analytics: Code generation initiated', { prompt });
    
    // This is a placeholder. In the next implementation phase, 
    // we'll connect to the backend API
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Example response
      const exampleCode = `
import React from 'react';
import { 
  DataTable, 
  Table, 
  TableHead, 
  TableRow, 
  TableHeader, 
  TableBody, 
  TableCell,
  Pagination,
  Tile,
  TableContainer
} from '@carbon/react';

const UserManagementTable = () => {
  const [firstRowIndex, setFirstRowIndex] = React.useState(0);
  const [currentPageSize, setCurrentPageSize] = React.useState(10);

  const headers = [
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
    { key: 'role', header: 'Role' },
    { key: 'status', header: 'Status' },
  ];

  const rows = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      role: 'Admin',
      status: 'Active',
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      role: 'User',
      status: 'Inactive',
    },
    // Add more users as needed
  ];

  return (
    <Tile>
      <TableContainer title="User Management" description="List of all users">
        <DataTable headers={headers} rows={rows}>
          {({ rows, headers, getHeaderProps, getRowProps, getTableProps }) => (
            <Table {...getTableProps()}>
              <TableHead>
                <TableRow>
                  {headers.map((header) => (
                    <TableHeader {...getHeaderProps({ header })}>
                      {header.header}
                    </TableHeader>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow {...getRowProps({ row })}>
                    {row.cells.map((cell) => (
                      <TableCell key={cell.id}>{cell.value}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DataTable>
        <Pagination
          totalItems={rows.length}
          backwardText="Previous page"
          forwardText="Next page"
          pageSize={currentPageSize}
          pageSizes={[5, 10, 15, 25]}
          itemsPerPageText="Items per page"
          onChange={({ page, pageSize }) => {
            if (pageSize !== currentPageSize) {
              setCurrentPageSize(pageSize);
            }
            setFirstRowIndex(pageSize * (page - 1));
          }}
        />
      </TableContainer>
    </Tile>
  );
};

export default UserManagementTable;
      `;
      
      setCode(exampleCode);
      
      // Track analytics event for successful code generation
      console.log('Analytics: Code generation completed');
    } catch (error) {
      console.error('Error generating code:', error);
      // Track analytics event for failed code generation
      console.log('Analytics: Code generation failed', { error });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Shell>
      <div style={{ padding: '2rem', backgroundColor: '#161616', color: '#f4f4f4', minHeight: 'calc(100vh - 48px)' }}>
        <h1>Carbon Prototyper</h1>
        <p style={{ maxWidth: '800px', marginBottom: '2rem' }}>
          Generate Carbon Design System components using natural language. Describe what you need, and we'll create the code.
        </p>
        <Grid condensed>
          <Column lg={8} md={4} sm={4} style={{ height: '100%' }}>
            <Prompt onSubmit={handleGenerateCode} isLoading={isLoading} />
          </Column>
          <Column lg={8} md={4} sm={4} style={{ height: '100%' }}>
            <CodeOutput 
              code={code} 
              language={language} 
              onLanguageChange={setLanguage}
            />
          </Column>
        </Grid>
      </div>
    </Shell>
  );
}

export default App;
