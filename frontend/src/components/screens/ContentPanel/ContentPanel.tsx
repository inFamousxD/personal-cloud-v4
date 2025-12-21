import React from "react";
import {ContentPanelStyled, ContentPanelHeaderStyled} from "./ContentPanel.styles";
import {Editor} from "@monaco-editor/react";
import {darkTheme} from "../../../theme/dark.colors";

const ContentPanel: React.FC = () => {
    return (
        <ContentPanelStyled>
            <ContentPanelHeaderStyled>
                {
                    [1, 2, 3, 4, 5, 6, 7, 8].map(item => {
                        return  <div key={item} className={"tab"}>
                            <span className="material-symbols-outlined type">article</span>
                            <div className={"title"}>Window {item}</div>
                            <span className="material-symbols-outlined close">close</span>
                        </div>
                    })
                }
            </ContentPanelHeaderStyled>
            <Editor defaultLanguage="javascript" defaultValue="" theme={"vs-dark"} options={{
                fontSize: 13,
                codeLens: true
            }}
                onMount={(editor, monaco) => {
                    monaco.editor.defineTheme('my-theme', {
                        base: 'vs-dark',
                        inherit: true,
                        rules: [],
                        colors: {
                            'editor.background': darkTheme.backgroundDarker,
                        },
                    });

                    monaco.editor.setTheme("my-theme");
                }}
            />
        </ContentPanelStyled>
    )
}

export default ContentPanel;