<script lang="ts">
	import AdminDashboard from '$lib/admin/components/AdminDashboard.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const defaultData = {
		tables: [],
		currentTable: '',
		records: [],
		columns: [],
		primaryKey: 'id',
		total: 0,
		page: 1,
		pageSize: 10,
		search: ''
	};
</script>

<AdminDashboard data={data.adminData ?? defaultData} />
