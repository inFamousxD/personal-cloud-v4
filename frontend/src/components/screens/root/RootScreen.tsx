import { Route, Routes } from 'react-router-dom'
import DashboardLayout from './layouts/DashboardLayout'

const RootScreen = () => {
  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />} />
    </Routes>
  )
}

export default RootScreen