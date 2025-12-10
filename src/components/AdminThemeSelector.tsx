import React, { useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import AdminSettings from './AdminSettings';

interface AdminThemeSelectorProps {
  adminBgColor: string;
  setAdminBgColor: (color: string) => void;
}

const AdminThemeSelector: React.FC<AdminThemeSelectorProps> = ({ adminBgColor, setAdminBgColor }) => {
  const [show, setShow] = useState(false);

  return (
    <>
      <Button
        variant="outline-secondary"
        className="w-100 my-3"
        style={{ fontWeight: 600, borderRadius: 12 }}
        onClick={() => setShow(true)}
      >
        Change Theme
      </Button>
      <Modal show={show} onHide={() => setShow(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Choose Background Color</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <AdminSettings selected={adminBgColor} onChange={setAdminBgColor} />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShow(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default AdminThemeSelector;
