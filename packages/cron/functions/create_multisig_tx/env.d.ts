declare global {
    namespace NodeJS {
        interface ProcessEnv {
        APPWRITE_FUNCTION_PROJECT_ID: string;
        APPWRITE_API_KEY: string;
        }
    }
}

export {};