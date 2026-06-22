import './css/App.css';
import AppShell from './layouts/AppShell';
import { UserContextProvider } from './Context/UserContext';

function App() {
  return (
    <div className="App">
      <UserContextProvider>
        <AppShell />
      </UserContextProvider>
    </div>
  );
}

export default App;
