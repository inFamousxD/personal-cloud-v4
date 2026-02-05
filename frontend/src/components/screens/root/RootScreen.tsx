import React from "react";
import NavigationContainer from "../../common/navigation/NavigationContainer";
import BottomRibbonContainer from "../../common/ribbon/BottomRibbonContainer";
import { Outlet, Route, Routes } from "react-router-dom";
import Notes from "../notes/Notes";
import Journal from "../journal/Journal";
import Lists from "../lists/Lists";
import Drawings from "../drawings/Drawings";
import Server from "../server/Server";
import Settings from "../settings/Settings";
import ProtectedRoute from "../../ProtectedRoute";
import RestrictedRoute from "../../RestrictedRoute";
import styled from "styled-components";
import Trackers from "../tracker/Tracker";
import AgentChat from "../agent/AgentChat";
import Terminal from "../terminal/Terminal";
import Admin from "../admin/Admin";

const RootContainer = styled.div`
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
`;

const MainContent = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1;
    margin-left: 2.5rem;
    overflow: hidden;
    
    @media (max-width: 768px) {
        margin-left: 0;
        margin-bottom: 3rem;
    }
`;

const ContentArea = styled.div`
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: row;
`;

export const RootScreen: React.FC = () => {
    return (
        <ProtectedRoute>
            <RootContainer>
                <NavigationContainer />
                <MainContent>
                    <ContentArea>
                        <Routes>
                            {/* All features go through RestrictedRoute for admin control */}
                            <Route
                                index
                                element={
                                    <RestrictedRoute feature="notes">
                                        <Notes />
                                    </RestrictedRoute>
                                }
                            />
                            <Route
                                path="/notes"
                                element={
                                    <RestrictedRoute feature="notes">
                                        <Notes />
                                    </RestrictedRoute>
                                }
                            />
                            <Route
                                path="/journal"
                                element={
                                    <RestrictedRoute feature="journal">
                                        <Journal />
                                    </RestrictedRoute>
                                }
                            />
                            <Route
                                path="/journal/:journalId"
                                element={
                                    <RestrictedRoute feature="journal">
                                        <Journal />
                                    </RestrictedRoute>
                                }
                            />
                            <Route
                                path="/lists"
                                element={
                                    <RestrictedRoute feature="lists">
                                        <Lists />
                                    </RestrictedRoute>
                                }
                            />
                            <Route
                                path="/lists/:listId"
                                element={
                                    <RestrictedRoute feature="lists">
                                        <Lists />
                                    </RestrictedRoute>
                                }
                            />
                            <Route
                                path="/drawings"
                                element={
                                    <RestrictedRoute feature="drawings">
                                        <Drawings />
                                    </RestrictedRoute>
                                }
                            />
                            <Route
                                path="/drawings/:drawingId"
                                element={
                                    <RestrictedRoute feature="drawings">
                                        <Drawings />
                                    </RestrictedRoute>
                                }
                            />
                            <Route
                                path="/tracker"
                                element={
                                    <RestrictedRoute feature="tracker">
                                        <Trackers />
                                    </RestrictedRoute>
                                }
                            />
                            <Route
                                path="/server"
                                element={
                                    <RestrictedRoute feature="server">
                                        <Server />
                                    </RestrictedRoute>
                                }
                            />
                            <Route
                                path="/agent"
                                element={
                                    <RestrictedRoute feature="agent">
                                        <AgentChat />
                                    </RestrictedRoute>
                                }
                            />
                            <Route
                                path="/agent/:chatId"
                                element={
                                    <RestrictedRoute feature="agent">
                                        <AgentChat />
                                    </RestrictedRoute>
                                }
                            />
                            <Route
                                path="/terminal"
                                element={
                                    <RestrictedRoute feature="terminal">
                                        <Terminal />
                                    </RestrictedRoute>
                                }
                            />

                            {/* Settings - always accessible (enforced by ALWAYS_ALLOWED_FEATURES in backend) */}
                            <Route
                                path="/settings"
                                element={
                                    <RestrictedRoute feature="settings">
                                        <Settings />
                                    </RestrictedRoute>
                                }
                            />

                            {/* Admin panel - admin check handled inside component */}
                            <Route path="/admin" element={<Admin />} />
                        </Routes>
                    </ContentArea>
                    <BottomRibbonContainer />
                </MainContent>
                <Outlet />
            </RootContainer>
        </ProtectedRoute>
    );
}

export default RootScreen;