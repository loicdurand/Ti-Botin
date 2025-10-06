import React from 'react';
import './App.css';
import { AppProvider } from "./context/AppContext";


function App() {
  return (
    <AppProvider>
      <div className="App">
        <h1>Carte du département</h1>
        <div id="map"></div>
      </div>
    </AppProvider>
  );
}

export default App;
