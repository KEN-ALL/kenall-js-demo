import React from 'react';
import { Link, Switch, Route } from 'react-router-dom';
import Index from './pages/index';
import Autocomplete from './pages/autocomplete';

function App() {
  const [menuShown, setMenuShown] = React.useState<boolean>(false);

  return (
    <div className="flex flex-col md:flex-row" onClick={(e) => {e.stopPropagation(); setMenuShown(false);}}>
      <aside className="relative z-10">
        <header className="bg-gray-200 md:bg-transparent h-15 md:h-none flex items-center">
          <h1 className="py-3 px-5 md:pt-5 text-lg flex-grow"><Link to="/">ケンオール</Link></h1>
          <button className="block md:hidden px-2 py-1 m-2" onClick={(e) => { e.stopPropagation(); setMenuShown(!menuShown) }}>
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"></path></svg>
          </button>
        </header>
        <ul className={'duration-500 transion-right md:transition-none bg-white md:bg-transparent md:block p-5 md:p-0 md:mx-5 md:my-0 absolute top-10 w-1/2 h-screen md:w-auto md:static md:right-auto ' + (menuShown ? 'right-0' : '-right-full')}>
          <li><Link to="/autocomplete" className="text-gray-500 block">Autocomplete</Link></li>
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
