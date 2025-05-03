#Carbon Prototyper - Product Requirements Document

##Overview
Carbon Prototyper is a web application that enables rapid prototyping using IBM's Carbon Design System. Users can write natural language queries to generate UI components, convert components from other design systems to Carbon, and view code in multiple languages.

Documentation resources for context:
- https://react.carbondesignsystem.com/
- https://carbondesignsystem.com/

##Key Features
1. User Interface
IBM Carbon UI Shell as the primary layout framework
Clean, responsive design using Carbon Grid system
Split-screen view with query input and code output
Language selector for output code format

2. AI-Powered Code Generation
Natural language prompt interface
Support for describing new UI components
Support for converting from other design systems (Material, Bootstrap, etc.)
Integration with IBM Watsonx.ai LLM

3. Code Output
Syntax-highlighted code preview
Copy code functionality
Primary output in React
Additional language support for Angular, Vue, Svelte, and Web Components

4. Backend Architecture
API proxy to handle requests to IBM Watsonx.ai
Authentication and rate limiting
Response caching for performance
Session management

##Technical Requirements
###Frontend
React.js framework
Carbon Design System library
Code editor/viewer component
Context-aware prompt suggestions

###Backend
Node.js API service
IBM Watsonx.ai integration
Environment-based configuration

###User Flow
User navigates to the application
User enters a natural language prompt (e.g., "Create a data table with pagination for user management")
System processes request through Watsonx.ai
Generated code displays in the output panel
User can copy code or switch language formats
User can refine prompt for iterative improvements

##Implementation Plan
Setup project structure and dependencies
Implement UI Shell and basic layout
Create prompt input interface
Build backend API proxy to Watsonx.ai
Implement code generation and display
Add language switching functionality
Add component conversion features
Testing and refinement
Documentation