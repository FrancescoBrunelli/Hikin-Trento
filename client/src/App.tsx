import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home.tsx'
import SignIn from './pages/SignIn.tsx'
import UserSignUp from './pages/UserSignUp.tsx'
import StructureSignUp from './pages/StructureSignUp.tsx'
import './styles/App.css'

function App() {
  return (
      <BrowserRouter>
          <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/signup" element={<UserSignUp />} />
              <Route path="/structuresignup" element={<StructureSignUp />} />
              <Route path="/signin" element={<SignIn />} />
          </Routes>
      </BrowserRouter>
  )
}

export default App
