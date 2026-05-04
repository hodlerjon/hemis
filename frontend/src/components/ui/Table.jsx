import Spinner from './Spinner';
import Button from './Button';

const Table = ({ columns, data, loading, onEdit, onDelete, canEdit = true, canDelete = true }) => {
  if (loading) return <Spinner />;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide"
              >
                {col.label}
              </th>
            ))}
            {(canEdit || canDelete) && (onEdit || onDelete) && (
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + 1}
                className="px-4 py-12 text-center text-sm text-gray-400"
              >
                No records found
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr key={row._id || i} className="hover:bg-gray-50 transition-colors">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-gray-700">
                    {col.render ? col.render(row) : row[col.key] ?? '—'}
                  </td>
                ))}
                {(canEdit || canDelete) && (onEdit || onDelete) && (
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {canEdit && onEdit && (
                        <Button size="sm" variant="outline" onClick={() => onEdit(row)}>
                          Edit
                        </Button>
                      )}
                      {canDelete && onDelete && (
                        <Button size="sm" variant="danger" onClick={() => onDelete(row._id)}>
                          Delete
                        </Button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
