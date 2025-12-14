'use client';

/* eslint-disable react/require-default-props */
import React, { useState, useEffect } from 'react';
import { Dropdown } from 'react-bootstrap';
import {
  PersonFill,
  ShieldX,
  ExclamationTriangle,
} from 'react-bootstrap-icons';
import UserProfileModal from './UserProfileModal';
import ReportModal from './ReportModal';

interface UserProfile {
  id: number;
  name: string;
  photo: string | null;
}

interface MessageActionsDropdownProps {
  otherUser: UserProfile;
  isAdmin?: boolean;
}

const MessageActionsDropdown: React.FC<MessageActionsDropdownProps> = ({
  otherUser,
  isAdmin = false,
}) => {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [checkingBlockStatus, setCheckingBlockStatus] = useState(true);

  // Check if user is blocked on component mount
  useEffect(() => {
    const checkBlockStatus = async () => {
      try {
        const response = await fetch(`/api/messages/check-blocked/${otherUser.id}`);
        if (response.ok) {
          const data = await response.json();
          setIsBlocked(data.isBlocked);
        }
      } catch (error) {
        console.error('Error checking block status:', error);
      } finally {
        setCheckingBlockStatus(false);
      }
    };

    checkBlockStatus();
  }, [otherUser.id]);

  const handleViewProfile = async () => {
    try {
      setLoadingProfile(true);
      const response = await fetch(`/api/profile/${otherUser.id}`);
      if (response.ok) {
        const data = await response.json();
        setProfileData(data.profile);
        setShowProfileModal(true);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleBlockUser = async () => {
    try {
      const endpoint = isBlocked ? 'unblock-user' : 'block-user';
      const response = await fetch(`/api/messages/${endpoint}/${otherUser.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setIsBlocked(!isBlocked);
        // Show success message to user (you could add a toast notification here)
        console.log(`User ${isBlocked ? 'unblocked' : 'blocked'} successfully`);
      }
    } catch (error) {
      console.error('Error blocking/unblocking user:', error);
    }
  };

  return (
    <>
      <Dropdown align="end">
        <Dropdown.Toggle
          variant="link"
          className="text-dark p-0"
          id="user-actions-dropdown"
        >
          <span className="visually-hidden">User actions</span>
        </Dropdown.Toggle>

        <Dropdown.Menu>
          {!isAdmin && (
            <>
              <Dropdown.Item onClick={handleViewProfile} disabled={loadingProfile}>
                <PersonFill className="me-2" />
                View Profile
              </Dropdown.Item>
              <Dropdown.Divider />
            </>
          )}
          <Dropdown.Item
            className={isBlocked ? 'text-success' : 'text-warning'}
            onClick={handleBlockUser}
            disabled={checkingBlockStatus}
          >
            <ShieldX className="me-2" />
            {isBlocked ? 'Unblock User' : 'Block User'}
          </Dropdown.Item>
          <Dropdown.Item
            className="text-danger"
            onClick={() => setShowReportModal(true)}
          >
            <ExclamationTriangle className="me-2" />
            Report User
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>

      {/* Modals */}
      <UserProfileModal
        profile={profileData}
        show={showProfileModal}
        onHide={() => setShowProfileModal(false)}
        userId={otherUser.id}
        isAdmin={isAdmin}
        hideReportButton
      />

      <ReportModal
        show={showReportModal}
        onHide={() => setShowReportModal(false)}
        userId={otherUser.id}
        userName={otherUser.name}
      />
    </>
  );
};

export default MessageActionsDropdown;
