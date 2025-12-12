/* eslint-disable react/require-default-props */
/* eslint-disable react/button-has-type */
/**
 * A user management component to display lifestyle categories in a table.
 */
import React from 'react';
import { Button } from 'react-bootstrap';
import { Trash, Pencil } from 'react-bootstrap-icons';

export interface Category {
  // eslint-disable-next-line react/no-unused-prop-types
  id: number; // Used as key in parent component
  name: string;
}

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

/* Renders a single row for the lifestyle categories table. */

interface CategoryRowProps extends Category {
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

// eslint-disable-next-line max-len
const LifestyleCategoriesTable: React.FC<CategoryRowProps> = ({
  id,
  name,
  onEdit,
  onDelete = undefined,
}) => (
  <tr>
    <td>{capitalize(name)}</td>
    <td>
      <div className="d-flex flex-column gap-2">
        <div className="d-flex gap-2 flex-wrap align-items-center">
          <Button
            variant="primary"
            size="sm"
            className="rounded-pill d-flex align-items-center"
            onClick={() => onEdit && onEdit(id)}
          >
            <Pencil className="me-1" />
            Edit
          </Button>
          <Button
            variant="danger"
            size="sm"
            className="rounded-pill d-flex align-items-center"
            onClick={() => onDelete && onDelete(id)}
          >
            <Trash className="me-1" />
            Delete
          </Button>
        </div>
      </div>
    </td>
  </tr>
);

export default LifestyleCategoriesTable;
