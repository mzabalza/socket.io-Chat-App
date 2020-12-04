import React from 'react';
import { BrowserRouter, Route } from 'react-router-dom';

// COMPONENTS
import Join from './components/Join/Join';
import Chat from './components/Chat/Chat';

const App = () => (
    <BrowserRouter>
        <Route exact path="/" component={Join} />
        <Route exact path="/chat" component={Chat} />
    </BrowserRouter>
);

export default App;