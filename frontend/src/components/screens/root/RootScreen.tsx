import React from "react";
import NavigationContainer from "../../common/navigation/NavigationContainer";
import BottomRibbonContainer from "../../common/ribbon/BottomRibbonContainer";
import {Outlet, Route, Routes} from "react-router-dom";
import Notes from "../notes/Notes";
import Journal from "../journal/Journal";
import Lists from "../lists/Lists";
import Server from "../server/Server";
import Settings from "../settings/Settings";
import ProtectedRoute from "../../ProtectedRoute";
import styled from "styled-components";
import Trackers from "../tracker/Tracker";
import AgentChat from "../agent/AgentChat";

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
                            <Route index element={<Notes />} />
                            <Route path="/notes" element={<Notes />} />
                            <Route path="/journal" element={<Journal />} />
                            <Route path="/journal/:journalId" element={<Journal />} />
                            <Route path="/lists" element={<Lists />} />
                            <Route path="/lists/:listId" element={<Lists />} />
                            <Route path="/server" element={<Server />} />
                            <Route path="/settings" element={<Settings />} />
                            <Route path="/tracker" element={<Trackers />} />
                            <Route path="/agent" element={<AgentChat />} />
                            <Route path="/agent/:chatId" element={<AgentChat />} />
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