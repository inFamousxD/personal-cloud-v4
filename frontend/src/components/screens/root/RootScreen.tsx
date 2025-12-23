import React from "react";
// import PanelControl from "../panelControl/PanelControl";
import NavigationContainer from "../../common/navigation/NavigationContainer";
import BottomRibbonContainer from "../../common/ribbon/BottomRibbonContainer";
import {Outlet, Route, Routes} from "react-router-dom";
import Notes from "../notes/Notes";
import ProtectedRoute from "../../ProtectedRoute";
import styled from "styled-components";

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
                        {/* <PanelControl /> */}
                        <Routes>
                            {/* <Route index element={<PanelControlEmpty />} /> */}
                            <Route path="/notes" element={<Notes />} />
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