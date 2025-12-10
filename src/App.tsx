import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import './App.css'
import WebviewerComponent from './components/WebviewerComponent' 

function App() {
  const [activeDocument, setActiveDocument] = useState(
    'https://pdftron.s3.amazonaws.com/downloads/pl/demo.pdf'
  );
  const [viewerSize, setViewerSize] = useState({ width: '100%', height: '90vh' });
  const [showUIComponents, setShowUIComponents] = useState(true);

  return (
    <Router>
    <div className="App">
      <NavBar />
      <div>
        <h1>Apryse Viewer Application</h1>
      </div>
      <Routes>
        <Route path="/" element={<WebviewerComponent  documentUrl={activeDocument} 
        viewerSize={viewerSize} 
        showUIComponents={showUIComponents} />} />
      </Routes>
    </div>
    </Router>
  )
}

export default App
