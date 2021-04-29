import React from 'react';
import { BrowserRouter as Router, Link, Route } from 'react-router-dom';
import AuthPage from './pages/Auth';
import MethodPage from './pages/Method';
import StorePage from './pages/Store';

function App() {
  return (
    <div className="App">
        <Router>
          <Link to="/auth">Auth</Link>{" "}
          <Link to="/method">Method</Link>{" "}
          <Link to="/store">Store</Link>{" "}
          <Route exact path="/method" component={MethodPage} />
          <Route exact path="/auth" component={AuthPage} />
          <Route exact path="/store" component={StorePage} />
        </Router>
    </div>
  );
}

export default App;
