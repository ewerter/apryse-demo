import { useState } from 'react'
import './App.css'
import WebviewerComponent from './components/WebviewerComponent' 

function App() {
  const [activeDocument, setActiveDocument] = useState(
    'https://pdftron.s3.amazonaws.com/downloads/pl/demo.pdf'
  );
  const [viewerSize, setViewerSize] = useState({ width: '100%', height: '90vh' });
  const [showUIComponents, setShowUIComponents] = useState(true);

  return (
    <div className="App">
      <div>
        <h1>Apryse Viewer Application</h1>
      </div>
      <WebviewerComponent 
        documentUrl={activeDocument} 
        viewerSize={viewerSize} 
        showUIComponents={showUIComponents} 
      />
    </div>
  )
}

export default App
