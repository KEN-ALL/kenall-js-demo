import React from 'react';
import { Link, Switch, Route } from 'react-router-dom';
import Index from './pages/index';
import Autocomplete from './pages/autocomplete';

function App() {
  return (
    <div className="flex">
      <aside className="m-5">
        <header>
          <h1 className="px-3 mb-3 text-lg"><Link to="/">ケンオール</Link></h1>
        </header>
        <ul>
          <li><Link to="/autocomplete" className="px-3 py-2 text-gray-500">Autocomplete</Link></li>
        </ul>
      </aside>
      <main className="flex-1 m-5">
        <Switch>
          <Route path="/autocomplete">
            <Autocomplete />
          </Route>
          <Route path="/">
            <Index />
          </Route>
        </Switch> 
      </main>
    </div>
  );
}

export default App;
