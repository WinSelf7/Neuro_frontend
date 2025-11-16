import { WelcomingPage } from '@/app/components/welcome/WelcomeKit'
import { Neurobase } from '@/app/components/welcome/Neurobase'
import { NeuropacksLight } from './components/welcome/Neuropacks'
import { SignInLightMode } from './components/welcome/signin'
import { PhraseLightMode } from './components/welcome/Phrase'
import { SignUpLightMode } from './components/welcome/signup'
import { NeuropackSante } from './components/welcome/NEUROPACK_SANTÉ'
import {GnrateurOrdonnances} from "./components/welcome/OCR"
import { FacturesSuppr } from './components/welcome/prosthesis'
import './styles/app.css'
import { Routes, Route } from 'react-router-dom'
import { MenuPage } from '@/app/components/welcome/Menu'
import { ThemeProvider } from '@/lib/theme-context'

export default function App() {
  return (
    <ThemeProvider>
      <Routes>
        <Route path="/" element={<WelcomingPage />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/neurobase" element={<Neurobase />} />
        <Route path="/neuropacks" element={<NeuropacksLight />} />
        <Route path='/login' element={<SignInLightMode />} />
        <Route path='/register' element={<SignUpLightMode />} />
        <Route path='/phrase' element={<PhraseLightMode />} /> 
        <Route path='/neuropack-sante' element={<NeuropackSante />} />
        <Route path='/prosthesis' element={<FacturesSuppr />} />
        <Route path='/ocr' element={<GnrateurOrdonnances />} />
      </Routes>
    </ThemeProvider>
  )
}
