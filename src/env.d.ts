/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly REACT_APP_API_URL: string;
  readonly REACT_APP_ENV: 'development' | 'production';
  readonly REACT_APP_CSV_MAX_SIZE: string;
  readonly REACT_APP_SUPPORTED_FILE_TYPES: string;
  readonly REACT_APP_DEBUG: string;
  readonly REACT_APP_APP_NAME: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
