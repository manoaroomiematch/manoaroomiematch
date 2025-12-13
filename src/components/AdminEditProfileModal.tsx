'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Modal, Form, Button } from 'react-bootstrap';
import { PersonCircle, Upload, Trash, Eye, EyeSlash } from 'react-bootstrap-icons';

interface AdminEditProfileModalProps {
  show: boolean;
  onHide: () => void;
  onSave?: () => void;
  adminName: string;
  adminEmail: string;
  adminPhotoUrl?: string;
  adminFirstName?: string;
  adminLastName?: string;
}

const AdminEditProfileModal: React.FC<AdminEditProfileModalProps> = ({
  show,
  onHide,
  onSave,
  adminName,
  adminEmail,
  adminPhotoUrl,
  adminFirstName = '',
  adminLastName = '',
}) => {
  // Profile edit form state
  const [editFormData, setEditFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Profile picture upload state
  const [profilePhoto, setProfilePhoto] = useState<string>(adminPhotoUrl || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Theme preference state
  const [themePreference, setThemePreference] = useState<'light' | 'dark' | 'auto'>('auto');

  // Modal drag state
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Initialize form and load preferences on mount
  useEffect(() => {
    if (show) {
      // Initialize form with props data
      setEditFormData({
        firstName: adminFirstName || '',
        lastName: adminLastName || '',
        email: adminEmail || '',
      });

      // Update profile photo if available
      if (adminPhotoUrl) {
        setProfilePhoto(adminPhotoUrl);
      }

      // Reset modal position
      setModalPosition({ x: 0, y: 0 });
      setProfileError(null);
    }

    // Load theme preference
    const storedTheme = localStorage.getItem('adminTheme') as 'light' | 'dark' | 'auto' | null;
    if (storedTheme) {
      setThemePreference(storedTheme);
    }
  }, [show, adminFirstName, adminLastName, adminEmail, adminPhotoUrl]);

  // Save theme preference to localStorage
  useEffect(() => {
    localStorage.setItem('adminTheme', themePreference);
  }, [themePreference]);

  const handleCloseModal = () => {
    setProfileError(null);
    setPasswordError(null);
    setPasswordSuccess(null);
    setShowPasswordFields(false);
    // Reset form to current values
    const [firstName, ...lastNameParts] = adminName.split(' ');
    const lastName = lastNameParts.join(' ');
    setEditFormData((prev) => ({
      ...prev,
      firstName: firstName || '',
      lastName: lastName || '',
    }));
    onHide();
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileError(null);

    try {
      const response = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: adminEmail,
          firstName: editFormData.firstName.trim(),
          lastName: editFormData.lastName.trim(),
          profilePhoto: profilePhoto || null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      handleCloseModal();
      // Trigger parent to refetch data
      if (onSave) {
        onSave();
      }
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Error updating profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setProfilePhoto(event.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setProfileError('Please select a valid image file');
      }
    }
  };

  const handleRemovePhoto = () => {
    setProfilePhoto('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: adminEmail,
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to change password');
      }

      setPasswordSuccess('Password changed successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setShowPasswordFields(false);
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Error changing password');
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - modalPosition.x, y: e.clientY - modalPosition.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setModalPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <Modal
      show={show}
      onHide={handleCloseModal}
      size="lg"
      scrollable
      backdrop
      dialogClassName="draggable-modal"
      style={{
        position: 'fixed',
        top: `${Math.max(modalPosition.y, 100)}px`,
        left: `${modalPosition.x}px`,
        transform: 'none',
        zIndex: 1050,
        maxHeight: 'calc(100vh - 200px)',
      }}
    >
      <Modal.Header
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          cursor: isDragging ? 'grabbing' : 'grab',
          userSelect: 'none',
        }}
        closeButton
      >
        <Modal.Title>Edit Profile</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {profileError && (
          <div className="alert alert-danger" role="alert">
            {profileError}
          </div>
        )}

        {/* Profile Picture Section */}
        <div className="mb-4 pb-4 border-bottom">
          <h6 className="fw-bold mb-3">Profile Picture</h6>
          <div className="text-center mb-3">
            {profilePhoto ? (
              <Image
                src={profilePhoto}
                alt="Profile preview"
                width={120}
                height={120}
                className="rounded-circle"
                style={{ objectFit: 'cover' }}
              />
            ) : (
              <PersonCircle size={120} className="text-secondary" />
            )}
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handlePhotoUpload}
            accept="image/*"
            style={{ display: 'none' }}
          />
          <div className="d-flex gap-2 justify-content-center">
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={16} className="me-2" />
              Upload Photo
            </Button>
            {profilePhoto && (
              <Button variant="outline-danger" size="sm" onClick={handleRemovePhoto}>
                <Trash size={16} className="me-2" />
                Remove
              </Button>
            )}
          </div>
          {/* Helper Text */}
          <div className="text-center">
            <small className="text-muted d-block mt-2">
              Drag & drop or click to upload
              <br />
              JPG, PNG, WebP, or GIF (max 5MB)
            </small>
          </div>
        </div>

        {/* Basic Information Section */}
        <div className="mb-4 pb-4 border-bottom">
          <h6 className="fw-bold mb-3">Basic Information</h6>
          <Form onSubmit={handleSaveProfile}>
            <Form.Group className="mb-3">
              <Form.Label>First Name</Form.Label>
              <Form.Control
                type="text"
                value={editFormData.firstName}
                onChange={(e) => setEditFormData((prev) => ({ ...prev, firstName: e.target.value }))}
                placeholder="First name"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                type="text"
                value={editFormData.lastName}
                onChange={(e) => setEditFormData((prev) => ({ ...prev, lastName: e.target.value }))}
                placeholder="Last name"
              />
            </Form.Group>

            <Form.Group className="mb-0">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={editFormData.email}
                onChange={(e) => setEditFormData((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="Email address"
              />
            </Form.Group>
          </Form>
        </div>

        {/* Change Password Section */}
        <div className="mb-4 pb-4 border-bottom">
          <h6 className="fw-bold mb-3">Security</h6>
          {passwordSuccess && (
            <div className="alert alert-success" role="alert">
              {passwordSuccess}
            </div>
          )}
          {passwordError && (
            <div className="alert alert-danger" role="alert">
              {passwordError}
            </div>
          )}
          {!showPasswordFields ? (
            <Button variant="outline-secondary" size="sm" onClick={() => setShowPasswordFields(true)}>
              Change Password
            </Button>
          ) : (
            <Form onSubmit={handleChangePassword}>
              <Form.Group className="mb-3">
                <Form.Label>Current Password</Form.Label>
                <div className="input-group">
                  <Form.Control
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData((prev) => ({ ...prev, currentPassword: e.target.value }))}
                    placeholder="Enter current password"
                  />
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                  </Button>
                </div>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>New Password</Form.Label>
                <div className="input-group">
                  <Form.Control
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))}
                    placeholder="Enter new password"
                  />
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                  </Button>
                </div>
                <small className="text-muted d-block mt-1">Minimum 8 characters</small>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Confirm New Password</Form.Label>
                <div className="input-group">
                  <Form.Control
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Confirm new password"
                  />
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                  </Button>
                </div>
              </Form.Group>

              <div className="d-flex gap-2">
                <Button variant="primary" size="sm" onClick={handleChangePassword}>
                  Update Password
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setShowPasswordFields(false);
                    setPasswordData({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: '',
                    });
                    setPasswordError(null);
                    setPasswordSuccess(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </Form>
          )}
        </div>

      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleCloseModal}>
          Close
        </Button>
        <Button variant="primary" onClick={handleSaveProfile} disabled={isSavingProfile}>
          {isSavingProfile ? 'Saving...' : 'Save Changes'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

AdminEditProfileModal.defaultProps = {
  adminPhotoUrl: undefined,
  adminFirstName: undefined,
  adminLastName: undefined,
  onSave: undefined,
};

export default AdminEditProfileModal;
