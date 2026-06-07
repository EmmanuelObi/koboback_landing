/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_AIRTABLE_BASE?: string;
  readonly VITE_AIRTABLE_TABLE?: string;
  readonly VITE_AIRTABLE_TOKEN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
