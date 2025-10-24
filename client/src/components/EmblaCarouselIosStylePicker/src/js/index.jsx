import React from 'react'
import ReactDOM from 'react-dom/client'
import EmblaCarousel from './EmblaCarousel'
import Header from './Header'
import Footer from './Footer'
import '../css/base.css'
import '../css/sandbox.css'
import '../css/embla.css'

const LOOP = true

const App = () => (
  <main className="sandbox">
    <Header />
    <section className="sandbox__carousel">
      <EmblaCarousel loop={LOOP} />
    </section>
    <Footer />
  </main>
)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
