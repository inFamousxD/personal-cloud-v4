import { Route, Routes } from 'react-router-dom'
import DashboardLayout from './layouts/DashboardLayout'
import ProtectedRoute from '../../ProtectedRoute'
import Notes from '../notes/Notes'

const RootScreen = () => {
    return (
        <ProtectedRoute>
            <Routes>
                <Route path="/" element={<DashboardLayout />} />
                <Route path="/notes" element={<Notes />} />
            </Routes>
        </ProtectedRoute>
    )
}

export default RootScreen