import React from 'react';
import { Card, Form } from 'react-bootstrap';

const COLORS = [
  { name: 'Blue', value: 'blue', bg: '#e3f2fd' },
  { name: 'Red', value: 'red', bg: '#ffebee' },
  { name: 'Green', value: 'green', bg: '#e8f5e9' },
  { name: 'Yellow', value: 'yellow', bg: '#fffde7' },
  { name: 'White', value: 'white', bg: '#ffffff' },
];

const AdminSettings: React.FC<{ onChange: (color: string) => void; selected: string }> = ({ onChange, selected }) => (
  <Card className="shadow-sm mb-3" style={{ border: 'none', borderRadius: '12px' }}>
    <Card.Header className="bg-light p-3 border-0 rounded-top" style={{ borderRadius: '12px 12px 0 0' }}>
      <h6 className="mb-0 fw-bold">Admin Settings</h6>
    </Card.Header>
    <Card.Body className="p-3">
      <Form.Group>
        <Form.Label>Background Color</Form.Label>
        <div className="d-flex gap-3 flex-wrap">
          {COLORS.map((c) => (
            <Form.Check
              key={c.value}
              type="radio"
              id={`bg-${c.value}`}
              name="admin-bg-color"
              label={c.name}
              value={c.value}
              checked={selected === c.value}
              onChange={() => onChange(c.value)}
              style={{ background: c.bg, borderRadius: 8, padding: '0.5rem 1rem', minWidth: 80, fontWeight: 500 }}
            />
          ))}
        </div>
      </Form.Group>
    </Card.Body>
  </Card>
);

export default AdminSettings;
