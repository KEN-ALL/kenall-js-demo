import React from 'react';
import { Link, Routes, Route } from 'react-router-dom';
import Index from './pages/index';
import Lookup from './pages/lookup';
import ReverseLookup from './pages/reverse-lookup';

function App() {
  const [menuShown, setMenuShown] = React.useState<boolean>(false);

  return (
    <div className="flex flex-col md:flex-row overflow-hidden min-h-screen relative" onClick={(e) => {e.stopPropagation(); setMenuShown(false);}}>
      <aside className="md:h-none h-screen md:static absolute inset-0">
        <header className="bg-gray-200 md:bg-transparent h-15 md:h-none flex items-center">
          <h1 className="py-3 px-5 md:pt-5 text-lg flex-grow"><Link to="/">ケンオール</Link></h1>
          <button className="block md:hidden px-2 py-1 m-2" onClick={(e) => { e.stopPropagation(); setMenuShown(!menuShown) }}>
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"></path></svg>
          </button>
        </header>
        <ul className={'z-20 duration-500 transion-right md:transition-none bg-white md:bg-transparent md:block p-5 md:p-0 md:mx-5 md:my-0 absolute top-10 bottom-0 w-1/2 md:w-auto md:static md:right-auto ' + (menuShown ? 'right-0' : '-right-full')}>
          <li><Link to="/lookup" className="text-gray-500 block">郵便番号正引き検索</Link></li>
          <li><Link to="/reverse-lookup" className="text-gray-500 block">郵便番号逆引き検索</Link></li>
        </ul>
      </aside>
      <main className="z-10 md:flex-1 px-5 md:py-5 mt-16 md:m-0">
        <Routes>
          <Route path="/lookup" element={<Lookup />} />
          <Route path="/reverse-lookup" element={<ReverseLookup />} />
          <Route path="/" element={<Index />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
