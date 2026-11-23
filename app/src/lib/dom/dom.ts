// Index of the [data-index] element an event happened in, for delegated pointer handlers.
export function indexFromEvent(e: Event): number | null {
  const el = (e.target as Element).closest?.('[data-index]') as HTMLElement | null;
  return el ? Number(el.dataset.index) : null;
}
