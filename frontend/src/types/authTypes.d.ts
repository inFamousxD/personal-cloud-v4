export type LocalStorageAuthToken = {
    error: undefined;
    browserToken: undefined | string;
    authenticated: boolean;
    postAuthExtractedData: undefined | PostAuthExtractedData
}

export type PostAuthExtractedData = {
    isSuccess: boolean;
    userName: string;
    email: string;
    exp: number;
    iat: number;
}

export interface JWTDecodeAuth {
    email: string;
    userName: string;
    exp: number;
    iat: number;
}

export type LoginPOSTReturnType = {
    "status": number;
    "email": string;
    "userName": string;
    "authToken": string;
}