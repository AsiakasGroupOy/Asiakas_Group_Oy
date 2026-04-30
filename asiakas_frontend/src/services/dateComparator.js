export const dateOnlyComparator = (filterDate, cellValue) => {
  if (!cellValue) return -1;

  const cellDate = new Date(cellValue);
  cellDate.setHours(0, 0, 0, 0);

  if (cellDate < filterDate) return -1;
  if (cellDate > filterDate) return 1;
  return 0;
};
