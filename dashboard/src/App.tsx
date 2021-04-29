import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import MethodPage from './pages/Method';

function App() {
  return (
    <div className="App">
        <Router>
          <Route exact path="/method" component={MethodPage} />
        </Router>
    </div>
  );
}

export default App;
