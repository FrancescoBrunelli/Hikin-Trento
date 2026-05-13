import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home.tsx'
import SignIn from './pages/SignIn.tsx'
import UserSignUp from './pages/UserSignUp.tsx'
import './styles/App.css'
import ThemeProvider from "./components/ThemeProvider.tsx";
import StructureUserSignUp from './pages/StructureSignUp.tsx'

function App() {
  return (
      <ThemeProvider>
          <BrowserRouter>
              <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/signup" element={<UserSignUp />} />
                  <Route path="/structuresignup" element={<StructureUserSignUp />} />
                  <Route path="/signin" element={<SignIn />} />
              </Routes>
          </BrowserRouter>
      </ThemeProvider>
  )
}

export default App
