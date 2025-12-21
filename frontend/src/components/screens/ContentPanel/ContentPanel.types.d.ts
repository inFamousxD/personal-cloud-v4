export interface ExplorerDirectoriesPaneInterface {
    metadata: {
        disableSelection: boolean;
        selected: string;
        isLoading: boolean;
        xyz: string;
    };
    data: ExplorerDirectoriesDataType;
}

export type ExplorerDirectoriesDataType = {
    name: string;
    children?: ExplorerDirectoriesListItemType[];
    type?: string;
    createdOn?: Date;
}

export type ExplorerDirectoriesListItemType = {
    id: string;
    name: string;
    children?: ExplorerDirectoriesListItemType[];
}