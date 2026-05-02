import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import { Footer } from './components/Footer'
import { UploadSection } from './components/UploadSection'
import { Dashboard } from './components/Dashboard'
import { StudyResources } from './pages/StudyResources'
import { CertificationPage } from './pages/CertificationPage'
import { ResumeBuilder } from './pages/ResumeBuilder'

function MainPage() {
  const [analysisResult, setAnalysisResult] = useState(null)
  const [extractedText, setExtractedText] = useState('')

  const handleAnalysisComplete = (data, text) => {
    setAnalysisResult(data)
    setExtractedText(text)
  }

  const handleReset = () => {
    setAnalysisResult(null)
    setExtractedText('')
  }

  return (
    <main style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 16px', flex: 1, width: '100%' }}>
      {!analysisResult ? (
        <div style={{ animation: 'fadeInUp 0.4s ease' }}>
          <UploadSection onAnalysisComplete={handleAnalysisComplete} />
        </div>
      ) : (
        <div style={{ animation: 'fadeInUp 0.3s ease' }}>
          <Dashboard
            data={analysisResult}
            extractedText={extractedText}
            onReset={handleReset}
          />
        </div>
      )}
    </main>
  )
}

function App() {
  return (
    <BrowserRouter>
      <div className="mesh-bg" />
      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/resume-builder" element={
            <main style={{ maxWidth: 1300, margin: '0 auto', padding: '32px 16px', flex: 1, width: '100%' }}>
              <ResumeBuilder />
            </main>
          } />
          <Route path="/test" element={
            <main style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 16px', flex: 1, width: '100%' }}>
              <CertificationPage />
            </main>
          } />
          <Route path="/resources" element={
            <main style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 16px', flex: 1, width: '100%' }}>
              <StudyResources />
            </main>
          } />
        </Routes>
        <Footer />
      </div>
    </BrowserRouter>
  )
}

export default App
