import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import AuthPage from './pages/Auth';
import MethodPage from './pages/Method';

function App() {
  return (
    <div className="App">
        <Router>
          <Route exact path="/method" component={MethodPage} />
          <Route exact path="/auth" component={AuthPage} />
        </Router>
    </div>
  );
}

export default App;
