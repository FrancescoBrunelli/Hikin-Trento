import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home.tsx'
import SignIn from './pages/SignIn.tsx'
import UserSignUp from './pages/UserSignUp.tsx'
import './styles/App.css'
import ThemeProvider from "./components/ThemeProvider.tsx";
import StructureUserSignUp from './pages/StructureSignUp.tsx'
import StructureSignIn from './pages/StructureSignIn.tsx'
import ChooseLogin from './pages/ChooseLogin.tsx'
import StructureDashboard from './pages/StructureDashboard.tsx'
import UserSettings from './pages/UserSettings.tsx'
import StructureSettings from './pages/StructureSettings.tsx'
import TripPlanning from './pages/TripPlanning.tsx'
function App() {
  return (
      <ThemeProvider>
          <BrowserRouter>
              <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/signup" element={<UserSignUp />} />
                  <Route path="/structuresignup" element={<StructureUserSignUp />} />
                  <Route path="/signin" element={<SignIn />} />
                  <Route path="/structuresignin" element={<StructureSignIn />} />
                  <Route path="/chooselogin" element={<ChooseLogin />} />
                  <Route path="/structure/dashboard" element={<StructureDashboard />} />
                  <Route path="/user/settings" element={<UserSettings />} />
                  <Route path="/structure/settings" element={<StructureSettings />} />
                  <Route path="/tripplanning" element={<TripPlanning />} />
              </Routes>
          </BrowserRouter>
      </ThemeProvider>
  )
}


export default App
