import { useState } from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import { UserContext } from './context/userContext';
import Home from './pages/Home';
import Settings from './pages/Settings';

function App() {
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(false);

  return (
    <UserContext value={{ user, setUser }}>
      <div>
        <Router>
          <div>
            <nav>
              <ul>
                <li>
                  <Link to='/'>Home</Link>
                </li>
                <li>
                  <Link to='/settings'>Settings</Link>
                </li>
              </ul>
            </nav>
            <Switch>
              <Route path='/settings'>
                <Settings />
              </Route>
              <Route path='/'>
                <Home />
              </Route>
            </Switch>
          </div>
        </Router>
      </div>
    </UserContext>
  );
}

export default App;
