import type { UserData, ColumnDef } from 'src/data/users';

const formatCellValue = (value: unknown): string => {
  if (value instanceof Date) return value.toLocaleDateString('ru-RU');
  if (value === null || value === undefined) return '';
  return String(value);
};

const prepareExportData = (data: UserData[], columns: ColumnDef[]) => {
  const visibleColumns = columns.filter((column) => column.isVisible);
  const cols = visibleColumns.length > 0
    ? visibleColumns.map((column) => column.field)
    : columns.map((column) => column.field);
  const labelByField = new Map(columns.map((col) => [col.field, col.label]));
  const headers = cols.map((c) => labelByField.get(c) || c);
  const rows = data.map((user) => cols.map((c) => formatCellValue(user[c as keyof UserData])));
  return { headers, rows };
};

const downloadFile = (content: string, filename: string, type: string) => {
  const blob = new Blob(['\uFEFF' + content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportToCSV = (data: UserData[], columns: ColumnDef[], filename: string) => {
  const { headers, rows } = prepareExportData(data, columns);
  const escape = (cell: string) =>
    cell.includes(',') || cell.includes('"') || cell.includes('\n')
      ? `"${cell.replace(/"/g, '""')}"`
      : cell;
  const csv = [headers.join(','), ...rows.map((r) => r.map(escape).join(','))].join('\n');
  downloadFile(csv, `${filename}.csv`, 'text/csv;charset=utf-8;');
};

export const exportToExcel = (data: UserData[], columns: ColumnDef[], filename: string) => {
  const { headers, rows } = prepareExportData(data, columns);
  const tsv = [headers.join('\t'), ...rows.map((r) => r.join('\t'))].join('\n');
  downloadFile(tsv, `${filename}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
};

export const getExportFilename = (prefix: string = 'users'): string => {
  const now = new Date();
  return `${prefix}_${now.toISOString().split('T')[0]}`;
};
