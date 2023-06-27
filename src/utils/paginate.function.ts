export function paginate<T>(
  array: T[],
  pageNumber: number,
  pageSize: number,
): T[] {
  const startIndex = (pageNumber - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  return array.slice(startIndex, endIndex);
}
