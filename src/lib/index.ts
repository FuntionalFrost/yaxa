// Yaxa - Nuxt UI v4 Equivalent for SvelteKit 2.7+ & Svelte 5

// Elements
export { default as Button } from './components/elements/Button.svelte';
export type { ButtonProps } from './components/elements/Button.svelte';
export { default as ButtonGroup } from './components/elements/ButtonGroup.svelte';
export { default as Badge } from './components/elements/Badge.svelte';
export type { BadgeProps } from './components/elements/Badge.svelte';
export { default as Avatar } from './components/elements/Avatar.svelte';
export { default as AvatarGroup } from './components/elements/AvatarGroup.svelte';
export { default as Kbd } from './components/elements/Kbd.svelte';
export { default as Icon } from './components/elements/Icon.svelte';
export type { IconProps, IconSource } from './components/elements/Icon.svelte';
export { default as Spinner } from './components/elements/Spinner.svelte';
export { default as Progress } from './components/elements/Progress.svelte';
export { default as Skeleton } from './components/elements/Skeleton.svelte';
export { default as Link } from './components/elements/Link.svelte';
export { default as Logo } from './components/elements/Logo.svelte';
export { default as DataTable } from './components/elements/DataTable.svelte';
export type { Column } from './components/elements/DataTable.svelte';
export { default as Chip } from './components/elements/Chip.svelte';
export { default as Meter } from './components/elements/Meter.svelte';
export { default as MetricCard } from './components/elements/MetricCard.svelte';

// Form Controls
export { default as Form } from './components/forms/Form.svelte';
export { default as FormField } from './components/forms/FormField.svelte';
export { default as Input } from './components/forms/Input.svelte';
export type { InputProps } from './components/forms/Input.svelte';
export { default as InputOTP } from './components/forms/InputOTP.svelte';
export { default as Textarea } from './components/forms/Textarea.svelte';
export { default as Checkbox } from './components/forms/Checkbox.svelte';
export { default as Switch } from './components/forms/Switch.svelte';
export { default as Select } from './components/forms/Select.svelte';
export type { SelectProps, SelectOption } from './components/forms/Select.svelte';
export { default as RadioGroup } from './components/forms/RadioGroup.svelte';
export { default as Slider } from './components/forms/Slider.svelte';
export { default as ColorPicker } from './components/forms/ColorPicker.svelte';
export { default as ToggleGroup } from './components/forms/ToggleGroup.svelte';
export type { ToggleItem } from './components/forms/ToggleGroup.svelte';
export { default as DatePicker } from './components/forms/DatePicker.svelte';
export type { DatePreset } from './components/forms/DatePicker.svelte';
export { default as DateRangePicker } from './components/forms/DateRangePicker.svelte';
export type { DateRange, DateRangePreset } from './components/forms/DateRangePicker.svelte';

// Layout & Shell
export { default as Container } from './components/layout/Container.svelte';
export { default as Header } from './components/layout/Header.svelte';
export { default as Footer } from './components/layout/Footer.svelte';
export { default as Section } from './components/layout/Section.svelte';
export { default as Card } from './components/layout/Card.svelte';
export { default as Divider } from './components/layout/Divider.svelte';
export type { DividerProps } from './components/layout/Divider.svelte';
export { default as YaxaApp } from './components/layout/YaxaApp.svelte';

// Navigation & Command
export { default as Tabs } from './components/navigation/Tabs.svelte';
export type { TabItem } from './components/navigation/Tabs.svelte';
export { default as Breadcrumb } from './components/navigation/Breadcrumb.svelte';
export type { BreadcrumbItem as NavBreadcrumbItem } from './components/navigation/Breadcrumb.svelte';
export { default as Pagination } from './components/navigation/Pagination.svelte';
export type { PaginationProps } from './components/navigation/Pagination.svelte';
export { default as CommandPalette } from './components/navigation/CommandPalette.svelte';
export type { CommandItem } from './components/navigation/CommandPalette.svelte';
export { default as DropdownMenu } from './components/navigation/DropdownMenu.svelte';
export type { MenuItem } from './components/navigation/DropdownMenu.svelte';

// Overlays & Feedback
export { default as Modal } from './components/overlays/Modal.svelte';
export type { ModalProps } from './components/overlays/Modal.svelte';
export { default as Slideover } from './components/overlays/Slideover.svelte';
export { default as Popover } from './components/overlays/Popover.svelte';
export { default as Tooltip } from './components/overlays/Tooltip.svelte';
export { default as Alert } from './components/overlays/Alert.svelte';
export type { AlertProps } from './components/overlays/Alert.svelte';
export { default as Accordion } from './components/overlays/Accordion.svelte';
export type { AccordionProps, AccordionItem } from './components/overlays/Accordion.svelte';
export { default as ContextMenu } from './components/overlays/ContextMenu.svelte';
export type { ContextMenuItem } from './components/overlays/ContextMenu.svelte';

// Composables & Runes (Nuxt UI v4 Composables Parity)
export { useClipboard } from './composables/useClipboard.svelte';
export type { UseClipboardOptions } from './composables/useClipboard.svelte';
export { useShortcuts } from './composables/useShortcuts.svelte';
export type { ShortcutItem, ShortcutConfig } from './composables/useShortcuts.svelte';
export { useColorMode } from './composables/useColorMode.svelte';
export { useToast } from './composables/useToast';
export type { ToastOptions, ToastAction } from './composables/useToast';
export { useMediaQuery } from './composables/useMediaQuery.svelte';
export { useDebounce } from './composables/useDebounce.svelte';

// Feedback & Toast notification helper
export { toast } from 'svelte-sonner';

// Theming
export {
	theme,
	themeInitScript,
	ACCENT_PALETTES,
	NEUTRAL_PALETTES,
	FONT_PRESETS,
	RADIUS_PRESETS,
	FONT_SIZE_PRESETS
} from './theme/theme.svelte';
export type {
	ThemeMode,
	AccentName,
	NeutralName,
	FontFamily,
	RadiusPreset,
	BaseFontSize,
	AccentOption
} from './theme/theme.svelte';

// Site Essentials & SEO Suite
export { default as Seo } from './components/seo/Seo.svelte';
export { default as Favicons } from './components/seo/Favicons.svelte';
export { default as OgImage } from './components/seo/OgImage.svelte';
export { default as LegalDocument } from './components/legal/LegalDocument.svelte';
export type {
	LegalDocumentType,
	LegalClause,
	LegalDocumentProps
} from './components/legal/LegalDocument.svelte';
export { defineSiteConfig, computeProjectBadge, DEFAULT_SITE_CONFIG } from './site/config';
export type {
	SiteConfig,
	NavItem,
	AuthorConfig,
	CompanyConfig,
	LegalConfig,
	LegalLinksConfig,
	ProjectLicense,
	ProjectType,
	PricingModel,
	ProjectConfig
} from './site/config';
export {
	setSiteConfig,
	getSiteConfig,
	setAuthUserContext,
	getAuthUserContext
} from './site/context';
export type { AuthUserContext } from './site/context';
export { createYaxaHook } from './site/hook';
export type { YaxaHookOptions } from './site/hook';
export { createRobotsHandler } from './site/robots';
export type { RobotsOptions } from './site/robots';
export { createSitemapHandler } from './site/sitemap';
export type { SitemapRoute, SitemapOptions } from './site/sitemap';
export { createSitemapXslHandler, generateSitemapXsl } from './site/sitemap-xsl';
export { createOgImageHandler, generateOgSvg } from './site/og';
export type { OgImageOptions } from './site/og';
export { createManifestHandler } from './site/manifest';
export {
	generateWebSiteSchema,
	generateOrganizationSchema,
	generateSoftwareApplicationSchema,
	generatePersonSchema,
	generateArticleSchema,
	generateBreadcrumbSchema
} from './site/schema';
export type { SchemaType, BreadcrumbItem, ArticleSchemaData } from './site/schema';
export { definePageSeo } from './site/seo-helpers';
export type { PageSeoConfig } from './site/seo-helpers';
export { yaxa } from './vite/index';
export type { YaxaPluginOptions } from './vite/index';

// SaaS Suite: UI Components & Composables
export { default as Gate } from './components/saas/Gate.svelte';
export type { GateProps } from './components/saas/Gate.svelte';
export { default as AuthCard } from './components/saas/AuthCard.svelte';
export { default as UserMenu } from './components/saas/UserMenu.svelte';
export { default as PricingCard } from './components/saas/PricingCard.svelte';
export { default as PricingTable } from './components/saas/PricingTable.svelte';
export { default as SubscriptionCard } from './components/saas/SubscriptionCard.svelte';
export { useAuth } from './composables/useAuth.svelte';
export type { UseAuthOptions, SocialProvider } from './composables/useAuth.svelte';
export { useGate } from './composables/useGate.svelte';
export type { UseGateOptions } from './composables/useGate.svelte';
export { useUpload } from './composables/useUpload.svelte';
export type { UseUploadOptions, UploadResult } from './composables/useUpload.svelte';

// Utilities
export { cn, tv } from './utils/cn';
export type { VariantProps } from './utils/cn';
