import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [minSize, setMinSize] = useState('16')
  const [maxSize, setMaxSize] = useState('48')
  const [minViewport, setMinViewport] = useState('320')
  const [maxViewport, setMaxViewport] = useState('1280')
  const [unit, setUnit] = useState('px')
  const [clampOutput, setClampOutput] = useState('')
  const [tailwindOutput, setTailwindOutput] = useState('')
  const [copySuccess, setCopySuccess] = useState('')
  const [validationError, setValidationError] = useState('')

  const calculateClamp = () => {
    const sMin = parseFloat(minSize)
    const sMax = parseFloat(maxSize)
    const vMin = parseFloat(minViewport)
    const vMax = parseFloat(maxViewport)

    if (isNaN(sMin) || isNaN(sMax) || isNaN(vMin) || isNaN(vMax)) {
      return
    }

    // Validation: ensure values are positive
    if (sMin <= 0 || sMax <= 0 || vMin <= 0 || vMax <= 0) {
      setValidationError('All values must be positive')
      return
    }

    // Validation: ensure min < max for both size and viewport
    if (sMin >= sMax) {
      setValidationError('Min size must be less than max size')
      return
    }

    if (vMin >= vMax) {
      setValidationError('Min viewport must be less than max viewport')
      return
    }

    setValidationError('')

    // Convert to px for calculation if unit is rem
    const sMinPx = unit === 'rem' ? sMin * 16 : sMin
    const sMaxPx = unit === 'rem' ? sMax * 16 : sMax

    const slope = (sMaxPx - sMinPx) / (vMax - vMin)
    const intersection = (-vMin * slope) + sMinPx

    const minRem = (sMinPx / 16).toFixed(3) + 'rem'
    const maxRem = (sMaxPx / 16).toFixed(3) + 'rem'
    const intersectionRem = (intersection / 16).toFixed(3) + 'rem'
    const slopeVw = (slope * 100).toFixed(3) + 'vw'

    const clampString = `clamp(${minRem}, calc(${intersectionRem} + ${slopeVw}), ${maxRem})`
    setClampOutput(clampString)
    setTailwindOutput(`text-[${clampString}]`)
  }

  useEffect(() => {
    calculateClamp()
  }, [minSize, maxSize, minViewport, maxViewport, unit])

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopySuccess('Copied!')
      setTimeout(() => setCopySuccess(''), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
      setCopySuccess('Failed to copy')
      setTimeout(() => setCopySuccess(''), 2000)
    }
  }

  const toggleUnit = () => {
    const newUnit = unit === 'px' ? 'rem' : 'px'
    
    if (newUnit === 'rem') {
      // Convert px to rem
      setMinSize((parseFloat(minSize) / 16).toFixed(3))
      setMaxSize((parseFloat(maxSize) / 16).toFixed(3))
    } else {
      // Convert rem to px
      setMinSize((parseFloat(minSize) * 16).toFixed(0))
      setMaxSize((parseFloat(maxSize) * 16).toFixed(0))
    }
    
    setUnit(newUnit)
  }

  const presets = [
    { name: 'Desktop to Mobile', minSize: '16', maxSize: '48', minViewport: '320', maxViewport: '1280' },
    { name: 'H1 Scale', minSize: '32', maxSize: '80', minViewport: '320', maxViewport: '1280' },
    { name: 'Body Scale', minSize: '14', maxSize: '20', minViewport: '320', maxViewport: '1280' },
  ]

  const applyPreset = (preset) => {
    setMinSize(preset.minSize)
    setMaxSize(preset.maxSize)
    setMinViewport(preset.minViewport)
    setMaxViewport(preset.maxViewport)
    setUnit('px') // Reset to px when applying preset
  }

  return (
    <div className="clamp-app">
      <header className="top-bar">
        <h1 className="logo">Clamp</h1>
        <div className="meta">Fluid Typography Calculator</div>
      </header>

      <main className="workspace">
        <div className="control-column">
          <div className="unit-toggle">
            <button 
              className={`toggle-btn ${unit === 'px' ? 'active' : ''}`}
              onClick={toggleUnit}
            >
              PX
            </button>
            <button 
              className={`toggle-btn ${unit === 'rem' ? 'active' : ''}`}
              onClick={toggleUnit}
            >
              REM
            </button>
          </div>

          <div className="input-group">
            <label>Min Size ({unit.toUpperCase()})</label>
            <input
              type="number"
              value={minSize}
              onChange={(e) => setMinSize(e.target.value)}
              className="input-field"
            />
          </div>

          <div className="input-group">
            <label>Max Size ({unit.toUpperCase()})</label>
            <input
              type="number"
              value={maxSize}
              onChange={(e) => setMaxSize(e.target.value)}
              className="input-field"
            />
          </div>

          <div className="input-group">
            <label>Min Viewport</label>
            <input
              type="number"
              value={minViewport}
              onChange={(e) => setMinViewport(e.target.value)}
              className="input-field"
            />
          </div>

          <div className="input-group">
            <label>Max Viewport</label>
            <input
              type="number"
              value={maxViewport}
              onChange={(e) => setMaxViewport(e.target.value)}
              className="input-field"
            />
          </div>

          <div className="presets">
            <div className="presets-label">Presets</div>
            {presets.map((preset, idx) => (
              <button
                key={idx}
                className="preset-btn"
                onClick={() => applyPreset(preset)}
              >
                {preset.name}
              </button>
            ))}
          </div>

          {validationError && (
            <div className="validation-error">
              {validationError}
            </div>
          )}
        </div>

        <div className="output-panel">
          <div className="sandbox-canvas">
            <div 
              className="sandbox-text"
              style={{ fontSize: clampOutput }}
            >
              Resize your browser to see this text scale fluidly
            </div>
          </div>

          <div className="code-blocks">
            <div className="code-block">
              <div className="code-header">
                <span>CSS</span>
                <button 
                  className="copy-btn"
                  onClick={() => handleCopy(`font-size: ${clampOutput};`)}
                >
                  {copySuccess || 'Copy'}
                </button>
              </div>
              <code className="code-content">
                font-size: {clampOutput};
              </code>
            </div>

            <div className="code-block">
              <div className="code-header">
                <span>Tailwind</span>
                <button 
                  className="copy-btn"
                  onClick={() => handleCopy(tailwindOutput)}
                >
                  {copySuccess || 'Copy'}
                </button>
              </div>
              <code className="code-content">
                {tailwindOutput}
              </code>
            </div>
          </div>
        </div>
      </main>

      <footer className="attribution">
        <div className="attribution__velocity">
          Forged by <a href="https://velocity.calyvent.com" target="_blank" rel="noopener">Velocity</a> — Digital Architecture House
        </div>
        <div className="attribution__calyvent">
          <a href="https://calyvent.com" target="_blank" rel="noopener">Calyvent</a>
          <a href="/privacy.html">Privacy</a>
          <a href="/terms.html">Terms</a>
        </div>
      </footer>

      <section className="seo-content">
        <h2>How to Use the Clamp Calculator</h2>
        <ol>
          <li>Enter your minimum and maximum font sizes in pixels or rems</li>
          <li>Set your minimum and maximum viewport widths (typically 320px for mobile and 1280px+ for desktop)</li>
          <li>The calculator instantly generates the CSS clamp() function</li>
          <li>Copy the CSS or Tailwind class and paste into your stylesheet</li>
        </ol>

        <h2>Code Example</h2>
        <div className="code-example">
          <div className="code-example__label">Before (Fixed Font Size)</div>
          <pre><code>font-size: 16px;</code></pre>
          <div className="code-example__label">After (Fluid Typography)</div>
          <pre><code>font-size: clamp(1rem, calc(0.875rem + 0.5vw), 1.5rem);</code></pre>
        </div>

        <h2>Why Use CSS Clamp()?</h2>
        <p>CSS clamp() enables fluid typography that scales smoothly between viewport sizes without media queries. This creates a more natural reading experience across devices and reduces the need for multiple breakpoints. Modern browsers support clamp() natively, making it the preferred method for responsive typography in 2024 and beyond.</p>

        <h2>Key Features</h2>
        <ul>
          <li>Instant calculation with no page reloads</li>
          <li>Support for both PX and REM input units</li>
          <li>Live preview to see typography scaling in real-time</li>
          <li>Ready-to-use CSS and Tailwind CSS output</li>
          <li>100% client-side — your data never leaves your browser</li>
          <li>No installation or account required</li>
        </ul>

        <h2>Frequently Asked Questions</h2>
        <div className="faq">
          <div className="faq-item">
            <h3>Is this clamp() calculator free?</h3>
            <p>Yes, Clamp is 100% free to use online. No account or installation required.</p>
          </div>
          <div className="faq-item">
            <h3>Is my data private?</h3>
            <p>Absolutely. All calculations happen in your browser. Your typography values are never uploaded or stored on any server.</p>
          </div>
          <div className="faq-item">
            <h3>What is CSS clamp()?</h3>
            <p>CSS clamp() is a function that sets a minimum, preferred, and maximum size for a property, enabling fluid typography that scales smoothly between viewport sizes.</p>
          </div>
          <div className="faq-item">
            <h3>Can I use this for Tailwind CSS?</h3>
            <p>Yes! The calculator generates Tailwind CSS classes using the arbitrary value syntax (e.g., text-[clamp(...)]), which works in Tailwind v3 and later.</p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default App
