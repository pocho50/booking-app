export function useTableSearchPagination<T>(options: {
  items: { value: T[] };
  searchFields: (item: T) => Array<string | number | null | undefined>;
  initialPageSize?: number;
  pageSizeOptions?: number[];
}) {
  const search = ref("");
  const pageSize = ref(options.initialPageSize ?? 10);
  const page = ref(1);

  watch(search, () => {
    page.value = 1;
  });

  watch(pageSize, () => {
    page.value = 1;
  });

  const filteredItems = computed(() => {
    const q = search.value.trim().toLowerCase();
    if (!q) {
      return options.items.value;
    }

    return options.items.value.filter((item) => {
      const haystack = options
        .searchFields(item)
        .filter((v) => v !== null && v !== undefined)
        .map((v) => String(v))
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });
  });

  const totalPages = computed(() =>
    Math.max(1, Math.ceil(filteredItems.value.length / pageSize.value)),
  );

  const paginatedItems = computed(() => {
    const safePage = Math.min(Math.max(1, page.value), totalPages.value);
    const start = (safePage - 1) * pageSize.value;
    return filteredItems.value.slice(start, start + pageSize.value);
  });

  const pageSizeOptions = (options.pageSizeOptions ?? [10, 25, 50, 100]).map(
    (n) => ({
      label: String(n),
      value: n,
    }),
  );

  return {
    search,
    pageSize,
    page,
    filteredItems,
    paginatedItems,
    totalPages,
    pageSizeOptions,
  };
}
