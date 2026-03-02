import './App.css'
import Sidebar from './components/Sidebar/Sidebar'
import { type ModelData } from './components/viewport/Experience'

import { useState, lazy, Suspense } from 'react'
import ObjectsContext from './ObjectsContext'
import Viewport from './components/viewport/Viewport'
import './i18n'

const DataManager = import.meta.env.DEV
  ? lazy(() => import('./dev/DataManager'))
  : null;


function App() {

  const [currentObjects, setCurrentObjects] = useState<ModelData[]>([])

  const [selectedMetadata, setSelectedMetadata] = useState<ModelData | null>(null)

  function handleObjectSelect(data: ModelData | null) {
    setSelectedMetadata(data);
  }

  function cleanMetadata() {
    handleObjectSelect(null)
  }

  return (
    <div className='hero flex'>
      <ObjectsContext.Provider value={{currentObjects, setCurrentObjects}}>
        <Sidebar objectData={selectedMetadata} cleanMetadata={cleanMetadata} />
        <Viewport onObjectSelect={handleObjectSelect}/>
      </ObjectsContext.Provider>
      {DataManager && (
        <Suspense fallback={null}>
          <DataManager />
        </Suspense>
      )}
    </div>
  )
}

export default App
