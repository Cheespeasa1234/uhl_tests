export type API_Response = {
    success: boolean,
    message: string,
    data?: any,
    [key: string]: any,
}