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
export { default as Skeleton, skeletonVariants } from './components/elements/Skeleton.svelte';
export type { SkeletonProps } from './components/elements/Skeleton.svelte';
export { default as Link } from './components/elements/Link.svelte';
export { default as Logo } from './components/elements/Logo.svelte';
export { default as DataTable } from './components/elements/DataTable.svelte';
export type { Column, DataTablePaginateEvent } from './components/elements/DataTable.svelte';
export { default as Chip } from './components/elements/Chip.svelte';
export { default as Meter } from './components/elements/Meter.svelte';
export { default as MetricCard } from './components/elements/MetricCard.svelte';
export { default as CodeBlock, tokenizeCode } from './components/elements/CodeBlock.svelte';
export type { CodeBlockProps } from './components/elements/CodeBlock.svelte';
export { default as CodeDiff, computeDiff } from './components/elements/CodeDiff.svelte';
export type {
	CodeDiffProps,
	DiffViewMode,
	DiffLineType,
	UnifiedDiffLine,
	SplitDiffRow,
	SplitDiffSide
} from './components/elements/CodeDiff.svelte';
export { default as SortableList } from './components/elements/SortableList.svelte';
export type { SortableListProps } from './components/elements/SortableList.svelte';
export { default as EmptyState, emptyStateVariants } from './components/elements/EmptyState.svelte';
export type { EmptyStateProps } from './components/elements/EmptyState.svelte';
export { default as Timeline, timelineVariants } from './components/elements/Timeline.svelte';
export type { TimelineProps, TimelineItem } from './components/elements/Timeline.svelte';
export { default as Tree, treeVariants } from './components/elements/Tree.svelte';
export type { TreeProps, TreeNode } from './components/elements/Tree.svelte';
export { default as Terminal, terminalVariants } from './components/elements/Terminal.svelte';
export type { TerminalProps, TerminalLine } from './components/elements/Terminal.svelte';
export {
	default as VirtualList,
	virtualListVariants
} from './components/elements/VirtualList.svelte';
export type { VirtualListProps } from './components/elements/VirtualList.svelte';
export { default as Carousel, carouselVariants } from './components/elements/Carousel.svelte';
export type { CarouselProps } from './components/elements/Carousel.svelte';

// AI-Native Primitives
export { default as AiChat } from './components/ai/AiChat.svelte';
export type {
	AiChatProps,
	AiMessage,
	AiMessageThought,
	AiMessageTool
} from './components/ai/AiChat.svelte';
export { default as PromptBar } from './components/ai/PromptBar.svelte';
export type { PromptBarProps, SlashCommand } from './components/ai/PromptBar.svelte';
export { default as AiThought } from './components/ai/AiThought.svelte';
export type { AiThoughtProps } from './components/ai/AiThought.svelte';
export { default as AiToolCall } from './components/ai/AiToolCall.svelte';
export type { AiToolCallProps, ToolCallStatus } from './components/ai/AiToolCall.svelte';

// Native Theme-Aware SVG Charts
export { default as LineChart } from './components/charts/LineChart.svelte';
export type {
	LineChartProps,
	LineSeries,
	ChartDataPoint
} from './components/charts/LineChart.svelte';
export { default as BarChart } from './components/charts/BarChart.svelte';
export type { BarChartProps, BarSeries } from './components/charts/BarChart.svelte';
export { default as DonutChart } from './components/charts/DonutChart.svelte';
export type { DonutChartProps, DonutDataItem } from './components/charts/DonutChart.svelte';

// Form Controls & Superforms Context
export { default as Form } from './components/forms/Form.svelte';
export type { FormSchema } from './components/forms/Form.svelte';
export { default as FormField } from './components/forms/FormField.svelte';
export {
	setFormContext,
	getFormContext,
	setFormFieldContext,
	getFormFieldContext
} from './components/forms/form-context';
export type {
	SuperFormContract,
	FormContextValue,
	FormFieldContextValue
} from './components/forms/form-context';
export { default as Input } from './components/forms/Input.svelte';
export type { InputProps } from './components/forms/Input.svelte';
export { default as InputOTP } from './components/forms/InputOTP.svelte';
export { default as Textarea } from './components/forms/Textarea.svelte';
export type { TextareaProps } from './components/forms/Textarea.svelte';
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
export { default as Dropzone } from './components/forms/Dropzone.svelte';
export type { DropzoneProps } from './components/forms/Dropzone.svelte';
export { default as Combobox, comboboxVariants } from './components/forms/Combobox.svelte';
export type { ComboboxProps, ComboboxOption } from './components/forms/Combobox.svelte';
export { default as MultiSelect, multiSelectVariants } from './components/forms/MultiSelect.svelte';
export type { MultiSelectProps, MultiSelectOption } from './components/forms/MultiSelect.svelte';
export { default as NumberInput, numberInputVariants } from './components/forms/NumberInput.svelte';
export type { NumberInputProps } from './components/forms/NumberInput.svelte';
export { default as RichTextEditor } from './components/forms/RichTextEditor.svelte';
export type { RichTextEditorProps } from './components/forms/RichTextEditor.svelte';
export { default as PhoneInput, COUNTRIES } from './components/forms/PhoneInput.svelte';
export type { PhoneInputProps, Country } from './components/forms/PhoneInput.svelte';
export {
	default as CreditCardInput,
	detectCardBrand
} from './components/forms/CreditCardInput.svelte';
export type { CreditCardInputProps, CardBrand } from './components/forms/CreditCardInput.svelte';

// Layout & Shell
export { default as Container } from './components/layout/Container.svelte';
export { default as Header } from './components/layout/Header.svelte';
export { default as Footer } from './components/layout/Footer.svelte';
export { default as Section } from './components/layout/Section.svelte';
export { default as Card } from './components/layout/Card.svelte';
export { default as Divider } from './components/layout/Divider.svelte';
export type { DividerProps } from './components/layout/Divider.svelte';
export { default as YaxaApp } from './components/layout/YaxaApp.svelte';
export {
	default as DashboardShell,
	dashboardShellVariants
} from './components/layout/DashboardShell.svelte';
export type { DashboardShellProps } from './components/layout/DashboardShell.svelte';
export {
	default as ResizablePanels,
	resizablePanelsVariants
} from './components/layout/ResizablePanels.svelte';
export type { ResizablePanelsProps } from './components/layout/ResizablePanels.svelte';

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
export { default as Stepper, stepperVariants } from './components/navigation/Stepper.svelte';
export type { StepperProps, StepItem, StepStatus } from './components/navigation/Stepper.svelte';

// Overlays & Feedback
export { default as Modal } from './components/overlays/Modal.svelte';
export type { ModalProps } from './components/overlays/Modal.svelte';
export { default as Drawer, drawerVariants } from './components/overlays/Drawer.svelte';
export type { DrawerProps } from './components/overlays/Drawer.svelte';
export { default as Slideover } from './components/overlays/Slideover.svelte';
export { default as Popover } from './components/overlays/Popover.svelte';
export { default as Tooltip } from './components/overlays/Tooltip.svelte';
export { default as Alert } from './components/overlays/Alert.svelte';
export type { AlertProps } from './components/overlays/Alert.svelte';
export { default as Accordion } from './components/overlays/Accordion.svelte';
export type { AccordionProps, AccordionItem } from './components/overlays/Accordion.svelte';
export { default as ContextMenu } from './components/overlays/ContextMenu.svelte';
export type { ContextMenuItem } from './components/overlays/ContextMenu.svelte';
export {
	default as NotificationCenter,
	notificationCenterVariants
} from './components/overlays/NotificationCenter.svelte';
export type {
	NotificationCenterProps,
	NotificationItem
} from './components/overlays/NotificationCenter.svelte';

// Headless Actions Suite
export {
	autosize,
	clickOutside,
	portal,
	infiniteScroll as infiniteScrollAction,
	sortableItem,
	springTilt
} from './actions';
export type {
	AutosizeOptions,
	ClickOutsideOptions,
	PortalOptions,
	InfiniteScrollActionOptions,
	SortableItemOptions,
	SpringTiltOptions
} from './actions';

// Motion & Physics Transitions
export { staggerFly, smoothSlide } from './motion/transitions';
export type { StaggerFlyOptions, SmoothSlideOptions } from './motion/transitions';

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
export { InfiniteScroll, useInfiniteScroll } from './composables/useInfiniteScroll.svelte';
export type { UseInfiniteScrollOptions } from './composables/useInfiniteScroll.svelte';
export {
	LocaleStore,
	setLocaleContext,
	getLocaleContext,
	useLocale,
	useRtl,
	localeStore
} from './composables/useLocale.svelte';
export type { UseLocaleOptions, TextDirection } from './composables/useLocale.svelte';
export { Sortable, useSortable } from './composables/useSortable.svelte';
export type { UseSortableOptions } from './composables/useSortable.svelte';
export { useDataTable } from './composables/useDataTable.svelte';
export type { UseDataTableOptions, DataTableStore } from './composables/useDataTable.svelte';
export { useFormAction } from './composables/useFormAction.svelte';
export type { UseFormActionOptions } from './composables/useFormAction.svelte';
export { useIdle } from './composables/useIdle.svelte';
export type { UseIdleOptions } from './composables/useIdle.svelte';

// Feedback & Toast notification helper
export { toast } from 'svelte-sonner';

// Theming & Theme Studio
export { default as ThemeStudio } from './components/theme/ThemeStudio.svelte';
export type { ThemeStudioProps } from './components/theme/ThemeStudio.svelte';
export {
	theme,
	themeInitScript,
	ACCENT_PALETTES,
	NEUTRAL_PALETTES,
	FONT_PRESETS,
	RADIUS_PRESETS,
	FONT_SIZE_PRESETS,
	DEFAULT_CHART_COLORS
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
export { YaxaState, initYaxaState, useYaxa, useSiteConfig, useAuthUser } from './site/context';
export type { AuthUserContext } from './site/context';
export { createYaxaHook } from './site/hook';
export type { YaxaHookOptions } from './site/hook';
export { createRobotsHandler } from './site/robots';
export type { RobotsOptions } from './site/robots';
export { createSitemapHandler } from './site/sitemap';
export type { SitemapRoute, SitemapImage, SitemapOptions } from './site/sitemap';
export { createSitemapXslHandler, generateSitemapXsl } from './site/sitemap-xsl';
export { createOgImageHandler, generateOgSvg } from './site/og';
export type { OgImageOptions } from './site/og';
export { createManifestHandler } from './site/manifest';
export {
	generateWebSiteSchema,
	generateOrganizationSchema,
	generateSoftwareApplicationSchema,
	generateSoftwareSourceCodeSchema,
	generatePersonSchema,
	generateArticleSchema,
	generateBreadcrumbSchema
} from './site/schema';
export type { SchemaType, BreadcrumbItem, ArticleSchemaData } from './site/schema';
export { definePageSeo } from './site/seo-helpers';
export type { PageSeoConfig } from './site/seo-helpers';
export { yaxa } from './vite/index';
export type { YaxaPluginOptions } from './vite/index';

// SaaS Suite: UI Components & Composables (Pure UI & Context Runes)
export { default as Gate } from './components/saas/Gate.svelte';
export type { GateProps } from './components/saas/Gate.svelte';
export { default as UserMenu } from './components/saas/UserMenu.svelte';
export { default as OrgSwitcher, orgSwitcherVariants } from './components/saas/OrgSwitcher.svelte';
export type { OrgSwitcherProps, OrgItem } from './components/saas/OrgSwitcher.svelte';
export { default as PricingCard } from './components/saas/PricingCard.svelte';
export { default as PricingTable } from './components/saas/PricingTable.svelte';
export { default as SubscriptionCard } from './components/saas/SubscriptionCard.svelte';
export { default as AuthCard } from './components/saas/AuthCard.svelte';
export type { AuthCardMode } from './components/saas/AuthCard.svelte';
export { default as PasskeyUI, passkeyUiVariants } from './components/saas/PasskeyUI.svelte';
export type { PasskeyUiProps } from './components/saas/PasskeyUI.svelte';
export { default as TwoFactorModal } from './components/saas/TwoFactorModal.svelte';
export { useGate } from './composables/useGate.svelte';
export type { UseGateOptions } from './composables/useGate.svelte';
export { useUpload } from './composables/useUpload.svelte';
export type { UseUploadOptions, UploadResult } from './composables/useUpload.svelte';
export { useAuth } from './composables/useAuth.svelte';
export type { UseAuthOptions, SocialProvider, PasskeyInfo } from './composables/useAuth.svelte';

// Pre-Built SaaS Blocks
export {
	default as Testimonials,
	testimonialsVariants
} from './components/blocks/Testimonials.svelte';
export type { TestimonialsProps, TestimonialItem } from './components/blocks/Testimonials.svelte';
export { default as FAQ, faqVariants } from './components/blocks/FAQ.svelte';
export type { FAQProps, FAQItem } from './components/blocks/FAQ.svelte';
export {
	default as FeatureGrid,
	featureGridVariants
} from './components/blocks/FeatureGrid.svelte';
export type { FeatureGridProps, FeatureItem } from './components/blocks/FeatureGrid.svelte';

// Testing Utilities
export { createMockSiteConfig, createMockUser, createTestWrapperProps } from './testing';
export type { YaxaTestOptions } from './testing';

// Utilities
export { cn, tv } from './utils/cn';
export type { VariantProps } from './utils/cn';
