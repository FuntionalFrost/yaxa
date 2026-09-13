// Yaxa Admin & Database Introspection Suite

// UI Components
export { default as AdminDashboard } from './components/AdminDashboard.svelte';
export { default as RecordDrawer } from './components/RecordDrawer.svelte';
export { default as DevSandbox } from './components/DevSandbox.svelte';
export { default as ImpersonationBanner } from './components/ImpersonationBanner.svelte';

// Server Handlers & Hooks
export { createYaxaAdminHook } from './hook';
export { createDrizzleAdmin, DrizzleAdminService, introspectTables } from './handler';

// Types
export type {
	AdminColumnInfo,
	AdminTableInfo,
	AdminTableData,
	DrizzleAdminConfig,
	YaxaAdminHookOptions
} from './types';
