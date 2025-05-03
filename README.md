# Carbon Prototyper

Carbon Prototyper is a web application that enables rapid prototyping using IBM's Carbon Design System. Users can write natural language queries to generate UI components, convert components from other design systems to Carbon, and view code in multiple languages.

## Version 0.2.0 - Enhanced Prompt Interface

This version includes:

- Enhanced prompt interface with tabbed layout:
  - "Create New" component mode with quick examples
  - "Convert Existing" mode for transforming components from other design systems
- Dark theme styling throughout the application
- Code output enhancements:
  - Copy to clipboard functionality with success notification
  - Preview mode toggle (placeholder for future implementation)
  - Language switching with visual indicators
- Analytics tracking for user interactions

## Version 0.1.0 - UI Shell and Basic Layout

This initial version includes:

- Carbon UI Shell implementation with header and side navigation
- Split-screen layout for prompt input and code output
- Example code generation flow (frontend only)
- Language switching capability
- Basic styling and responsive layout

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

## Technology Stack

- React.js with TypeScript
- Carbon Design System
- React Syntax Highlighter

## Next Steps

- Implement the AI backend service using IBM Watsonx.ai
- Create the API proxy service for the frontend
- Add live preview capability for generated components
- Add more examples and improved documentation
