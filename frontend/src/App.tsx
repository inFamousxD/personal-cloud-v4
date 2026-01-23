import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GoogleAuthWrapper } from "./contexts/AuthContext";
import { PermissionsProvider } from "./contexts/PermissionsContext";
import RootScreen from "./components/screens/root/RootScreen";
import Login from "./components/screens/login/Login";
import SharedList from "./components/screens/lists/SharedList";
import { ThemeProvider } from "./contexts/ThemeContext";

export const registerServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js', {
                scope: '/'
            });
            
            console.log('[SW] Service Worker registered:', registration);
            
            // Wait for service worker to be ready
            await navigator.serviceWorker.ready;
            console.log('[SW] Service Worker ready');
            
            return registration;
        } catch (error) {
            console.error('[SW] Service Worker registration failed:', error);
            throw error;
        }
    } else {
        console.warn('[SW] Service Workers not supported');
        throw new Error('Service Workers not supported');
    }
};

// Check service worker status
export const checkServiceWorkerStatus = async () => {
    if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        const controller = navigator.serviceWorker.controller;
        
        console.log('[SW] Status Check:');
        console.log('  Registration:', registration ? 'Found' : 'Not found');
        console.log('  Controller:', controller ? 'Active' : 'Not active');
        console.log('  State:', registration?.active?.state);
        
        return {
            registered: !!registration,
            active: !!controller,
            state: registration?.active?.state
        };
    }
    
    return { registered: false, active: false, state: null };
};

function App() {
    return (
        <ThemeProvider>
            <GoogleAuthWrapper>
                <PermissionsProvider>
                    <BrowserRouter>
                        <Routes>
                            <Route path="/login" element={<Login />} />
                            <Route path="/lists/shared/:shareId" element={<SharedList />} />
                            <Route path="*" element={<RootScreen />} />
                        </Routes>
                    </BrowserRouter>
                </PermissionsProvider>
            </GoogleAuthWrapper>
        </ThemeProvider>
    );
}

export default App;