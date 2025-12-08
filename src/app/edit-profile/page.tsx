'use client';

import { useState, useRef, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Modal } from 'react-bootstrap';
import { PersonCircle, Upload, Trash, Eye, EyeSlash } from 'react-bootstrap-icons';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { updateUserProfile, getProfileByEmail } from '@/lib/dbActions';

/**
 * Edit Profile Page
 *
 * Allows users to edit their profile information including:
 * - Profile photo (upload/change/remove)
 * - Basic information (name, email, pronouns, bio)
 * - Academic information (major, class standing, graduation year)
 * - Link to Lifestyle Survey for preferences
 *
 */

const EditProfilePage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock initial data - TODO: Replace with actual data from database
  const currentUserEmail = session?.user?.email || '';
  const isJohnDoe = currentUserEmail === 'john@foo.com';

  // State for form fields
  const [formData, setFormData] = useState({
    firstName: isJohnDoe ? 'John' : '',
    lastName: isJohnDoe ? 'Doe' : '',
    email: currentUserEmail,
    pronouns: '',
    bio: isJohnDoe ? 'I love coding, hiking, and matcha lattes.' : '',
    major: isJohnDoe ? 'Computer Science' : '',
    classStanding: isJohnDoe ? 'Junior' : '',
    graduationYear: '',
    needRoommateBy: '',
    instagram: '',
    snapchat: '',
    hometown: '',
    smoking: false,
    drinking: 'occasionally',
    pets: false,
    petTypes: '',
    dietary: '',
    interests: '',
    workSchedule: 'day',
    housingType: '', // 'on-campus', 'off-campus', 'either', 'undecided'
    preferredDorm: '', // Specific dorm selection
    specificBuilding: '', // For custom building name
    budget: '', // Budget for off-campus
  });

  const [profilePhoto, setProfilePhoto] = useState<string>(
    isJohnDoe ? '/johndoe.jpg' : '',
  );
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  // Modal state for success/failure feedback
  const [modalState, setModalState] = useState<{
    show: boolean;
    title: string;
    message: string;
    success: boolean;
  }>({ show: false, title: '', message: '', success: false });

  // Delete account modal state
  const [deleteModal, setDeleteModal] = useState<{
    show: boolean;
    password: string;
    loading: boolean;
    error: string | null;
    showPassword?: boolean;
  }>({ show: false, password: '', loading: false, error: null, showPassword: false });

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (currentUserEmail) {
        try {
          const profile = await getProfileByEmail(currentUserEmail);
          if (profile) {
            const profileWithNew = profile as any; // Temporary type assertion for new fields
            const needRoommateByDate = profileWithNew.needRoommateBy
              ? new Date(profileWithNew.needRoommateBy).toISOString().split('T')[0]
              : '';
            setFormData({
              firstName: profile.firstName || '',
              lastName: profile.lastName || '',
              email: profile.email,
              pronouns: profile.pronouns || '',
              bio: profile.bio || '',
              major: profile.major || '',
              classStanding: profile.classStanding || '',
              graduationYear: profile.graduationYear?.toString() || '',
              needRoommateBy: needRoommateByDate,
              instagram: profileWithNew.instagram || '',
              snapchat: profileWithNew.snapchat || '',
              hometown: profileWithNew.hometown || '',
              smoking: profile.smoking || false,
              drinking: profile.drinking || 'occasionally',
              pets: profile.pets || false,
              petTypes: profile.petTypes?.join(', ') || '',
              dietary: profile.dietary?.join(', ') || '',
              interests: profile.interests?.join(', ') || '',
              workSchedule: profile.workSchedule || 'day',
              housingType: profileWithNew.housingType || '',
              preferredDorm: profileWithNew.preferredDorm || '',
              specificBuilding: profileWithNew.specificBuilding || '',
              budget: profileWithNew.budget || '',
            });
            // if (profile.photoUrl) setProfilePhoto(profile.photoUrl);
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
        }
      }
    };
    fetchProfile();
  }, [currentUserEmail]);

  // Redirect to sign-in if not authenticated
  if (status === 'unauthenticated') {
    router.push('/auth/signin');
    return null;
  }

  // Handle input changes
  const handleInputChange = (
    field: string,
    value: string | boolean,
  ) => {
    setFormData({ ...formData, [field]: value });
  };

  // Handle photo upload
  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger file input click
  const handleChangePhotoClick = () => {
    fileInputRef.current?.click();
  };

  // Remove photo
  const handleRemovePhoto = () => {
    setProfilePhoto('');
    setPhotoFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    // console.log('Photo file (not implemented):', photoFile);
    try {
      await updateUserProfile(currentUserEmail, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        major: formData.major,
        classStanding: formData.classStanding,
        graduationYear: formData.graduationYear ? parseInt(formData.graduationYear, 10) : undefined,
        needRoommateBy: formData.needRoommateBy ? new Date(formData.needRoommateBy) : undefined,
        instagram: formData.instagram,
        snapchat: formData.snapchat,
        hometown: formData.hometown,
        housingType: formData.housingType,
        preferredDorm: formData.preferredDorm,
        specificBuilding: formData.specificBuilding,
        budget: formData.budget,
        smoking: formData.smoking,
        drinking: formData.drinking,
        pets: formData.pets,
        petTypes: formData.petTypes.split(',').map((s) => s.trim()).filter((s) => s),
        dietary: formData.dietary.split(',').map((s) => s.trim()).filter((s) => s),
        interests: formData.interests.split(',').map((s) => s.trim()).filter((s) => s),
        workSchedule: formData.workSchedule,
        pronouns: formData.pronouns,
        bio: formData.bio,
      });
      setModalState({
        show: true,
        title: 'Profile Updated',
        message: 'Your changes have been saved successfully.',
        success: true,
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      setModalState({
        show: true,
        title: 'Update Failed',
        message: 'We could not save your changes. Please try again.',
        success: false,
      });
    }
  };

  // Handle Delete Account
  const handleConfirmDelete = async () => {
    if (!currentUserEmail) return;
    setDeleteModal((s) => ({ ...s, loading: true, error: null }));
    try {
      const res = await fetch('/api/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: deleteModal.password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setDeleteModal((s) => ({ ...s, loading: false, error: data.error || 'Invalid password or request.' }));
        return;
      }
      setDeleteModal({ show: false, password: '', loading: false, error: null });
      // Ensure session cookie and client state are cleared before redirect
      await signOut({ redirect: true, callbackUrl: '/auth/signin' });
    } catch (err) {
      setDeleteModal((s) => ({ ...s, loading: false, error: 'An error occurred. Please try again.' }));
    }
  };

  // Loading state
  if (status === 'loading') {
    return (
      <main className="bg-light min-vh-100">
        <Container className="py-5">
          <div className="text-center">
            <p>Loading...</p>
          </div>
        </Container>
      </main>
    );
  }

  return (
    <main className="bg-light py-4">
      <Container className="py-4 pb-5 mb-5">
        <Row className="justify-content-center">
          <Col lg={8} md={10}>
            <h1 className="mb-4 fw-bold">Edit Profile</h1>

            <Form onSubmit={handleSubmit}>
              {/* Profile Photo Section */}
              <Card className="shadow-sm mb-4" style={{ border: 'none', borderRadius: '12px' }}>
                <Card.Body className="p-4">
                  <h4 className="fw-bold mb-3">Profile Photo</h4>

                  <div className="text-center mb-3">
                    {profilePhoto ? (
                      <Image
                        src={profilePhoto}
                        alt="Profile photo"
                        width={150}
                        height={150}
                        className="rounded-circle"
                        style={{ objectFit: 'cover' }}
                      />
                    ) : (
                      <PersonCircle size={150} className="text-secondary" />
                    )}
                  </div>

                  <div className="d-flex justify-content-center gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handlePhotoChange}
                      accept="image/*"
                      style={{ display: 'none' }}
                    />
                    <Button
                      variant="success"
                      onClick={handleChangePhotoClick}
                    >
                      <Upload className="me-2" />
                      {profilePhoto ? 'Change Photo' : 'Upload Photo'}
                    </Button>
                    {profilePhoto && (
                      <Button
                        variant="outline-danger"
                        onClick={handleRemovePhoto}
                      >
                        <Trash className="me-2" />
                        Remove Photo
                      </Button>
                    )}
                  </div>
                </Card.Body>
              </Card>

              {/* Basic Information Section */}
              <Card className="shadow-sm mb-4" style={{ border: 'none', borderRadius: '12px' }}>
                <Card.Body className="p-4">
                  <h4 className="fw-bold mb-3">Basic Information</h4>

                  <Row className="g-3">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>First Name *</Form.Label>
                        <Form.Control
                          type="text"
                          value={formData.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          required
                          placeholder="Enter first name"
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Last Name *</Form.Label>
                        <Form.Control
                          type="text"
                          value={formData.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          required
                          placeholder="Enter last name"
                        />
                      </Form.Group>
                    </Col>

                    <Col xs={12}>
                      <Form.Group>
                        <Form.Label>UH Email</Form.Label>
                        <Form.Control
                          type="email"
                          value={formData.email}
                          readOnly
                          disabled
                          className="bg-light"
                        />
                        <Form.Text className="text-muted">
                          Email cannot be changed
                        </Form.Text>
                      </Form.Group>
                    </Col>

                    <Col xs={12}>
                      <Form.Group>
                        <Form.Label>Pronouns (optional)</Form.Label>
                        <Form.Control
                          type="text"
                          value={formData.pronouns}
                          onChange={(e) => handleInputChange('pronouns', e.target.value)}
                          placeholder="e.g., she/her, he/him, they/them"
                        />
                      </Form.Group>
                    </Col>

                    <Col xs={12}>
                      <Form.Group>
                        <Form.Label>Need Roommate By (optional)</Form.Label>
                        <Form.Control
                          type="date"
                          value={formData.needRoommateBy}
                          onChange={(e) => handleInputChange('needRoommateBy', e.target.value)}
                        />
                        <Form.Text className="text-muted">
                          When do you need to find a roommate?
                        </Form.Text>
                      </Form.Group>
                    </Col>

                    <Col xs={12}>
                      <Form.Group>
                        <Form.Label>Preferred Housing Type (optional)</Form.Label>
                        <Form.Select
                          value={formData.housingType}
                          onChange={(e) => handleInputChange('housingType', e.target.value)}
                        >
                          <option value="">Select housing type...</option>
                          <option value="on-campus">On-Campus Dorm</option>
                          <option value="off-campus">Off-Campus Apartment</option>
                          <option value="either">Either (Open to both)</option>
                          <option value="undecided">Undecided</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>

                    {/* Show dorm options if on-campus or either */}
                    {(formData.housingType === 'on-campus' || formData.housingType === 'either') && (
                      <Col xs={12}>
                        <Form.Group>
                          <Form.Label>Preferred Dorm (optional)</Form.Label>
                          <Form.Select
                            value={formData.preferredDorm}
                            onChange={(e) => handleInputChange('preferredDorm', e.target.value)}
                          >
                            <option value="">Any dorm / No preference</option>
                            <option value="Hale Aloha - Lehua">Hale Aloha - Lehua</option>
                            <option value="Hale Aloha - Ilima">Hale Aloha - ʻIlima</option>
                            <option value="Hale Aloha - Mokihana">Hale Aloha - Mokihana</option>
                            <option value="Hale Aloha - Lokelani">Hale Aloha - Lokelani</option>
                            <option value="Johnson Hall">Johnson Hall</option>
                            <option value="Frear Hall">Frear Hall</option>
                            <option value="Gateway House">Gateway House</option>
                            <option value="Hale Kahawai">Hale Kahawai</option>
                            <option value="Hale Laulima">Hale Laulima</option>
                            <option value="Hale Anuenue">Hale Ānuenue</option>
                            <option value="Hale Wainani">Hale Wainani</option>
                            <option value="Walter Dods Jr RISE Center">Walter Dods, Jr. RISE Center</option>
                            <option value="Hale Haukani">Hale Haukani</option>
                            <option value="Hale Kawili">Hale Kawili</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    )}

                    {/* Show budget and building if off-campus or either */}
                    {(formData.housingType === 'off-campus' || formData.housingType === 'either') && (
                      <>
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label>Monthly Budget (optional)</Form.Label>
                            <Form.Control
                              type="text"
                              value={formData.budget}
                              onChange={(e) => handleInputChange('budget', e.target.value)}
                              placeholder="e.g., $800-1200"
                            />
                            <Form.Text className="text-muted">
                              Your preferred monthly rent range
                            </Form.Text>
                          </Form.Group>
                        </Col>

                        <Col md={6}>
                          <Form.Group>
                            <Form.Label>Specific Building (optional)</Form.Label>
                            <Form.Control
                              type="text"
                              value={formData.specificBuilding}
                              onChange={(e) => handleInputChange('specificBuilding', e.target.value)}
                              placeholder="e.g., Campus Heights, University Tower"
                            />
                            <Form.Text className="text-muted">
                              If you have a specific building in mind
                            </Form.Text>
                          </Form.Group>
                        </Col>
                      </>
                    )}
                  </Row>
                </Card.Body>
              </Card>

              {/* Academic Information Section */}
              <Card className="shadow-sm mb-4" style={{ border: 'none', borderRadius: '12px' }}>
                <Card.Body className="p-4">
                  <h4 className="fw-bold mb-3">Academic Information</h4>

                  <Row className="g-3">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Major *</Form.Label>
                        <Form.Select
                          value={formData.major}
                          onChange={(e) => handleInputChange('major', e.target.value)}
                          required
                        >
                          <option value="">Select major...</option>
                          <option value="Computer Science">Computer Science</option>
                          <option value="Biology">Biology</option>
                          <option value="Business">Business</option>
                          <option value="Engineering">Engineering</option>
                          <option value="Psychology">Psychology</option>
                          <option value="Marine Biology">Marine Biology</option>
                          <option value="Nursing">Nursing</option>
                          <option value="Education">Education</option>
                          <option value="Political Science">Political Science</option>
                          <option value="Communications">Communications</option>
                          <option value="Other">Other</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Class Standing *</Form.Label>
                        <Form.Select
                          value={formData.classStanding}
                          onChange={(e) => handleInputChange('classStanding', e.target.value)}
                          required
                        >
                          <option value="">Select class standing...</option>
                          <option value="Freshman">Freshman</option>
                          <option value="Sophomore">Sophomore</option>
                          <option value="Junior">Junior</option>
                          <option value="Senior">Senior</option>
                          <option value="Graduate">Graduate Student</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Expected Graduation Year</Form.Label>
                        <Form.Control
                          type="number"
                          value={formData.graduationYear}
                          onChange={(e) => handleInputChange('graduationYear', e.target.value)}
                          placeholder="e.g., 2025"
                          min="2024"
                          max="2030"
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* About Me Section */}
              <Card className="shadow-sm mb-4" style={{ border: 'none', borderRadius: '12px' }}>
                <Card.Body className="p-4">
                  <h4 className="fw-bold mb-3">About Me</h4>
                  <p className="text-muted small mb-3">
                    All fields in this section are optional.
                  </p>

                  <Row className="g-3">
                    <Col xs={12}>
                      <Form.Group>
                        <Form.Label>Bio</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={4}
                          value={formData.bio}
                          onChange={(e) => handleInputChange('bio', e.target.value)}
                          placeholder="Tell others about yourself..."
                          maxLength={500}
                        />
                        <Form.Text className="text-muted">
                          {formData.bio.length}
                          /500 characters
                        </Form.Text>
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Instagram Handle</Form.Label>
                        <Form.Control
                          type="text"
                          value={formData.instagram}
                          onChange={(e) => handleInputChange('instagram', e.target.value)}
                          placeholder="@username"
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Snapchat Username</Form.Label>
                        <Form.Control
                          type="text"
                          value={formData.snapchat}
                          onChange={(e) => handleInputChange('snapchat', e.target.value)}
                          placeholder="username"
                        />
                      </Form.Group>
                    </Col>

                    <Col xs={12}>
                      <Form.Group>
                        <Form.Label>Hometown / Where are you from?</Form.Label>
                        <Form.Control
                          type="text"
                          value={formData.hometown}
                          onChange={(e) => handleInputChange('hometown', e.target.value)}
                          placeholder="e.g., Honolulu, HI"
                        />
                      </Form.Group>
                    </Col>

                    <Col xs={12}>
                      <Form.Group>
                        <Form.Label>Interests & Hobbies</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          value={formData.interests}
                          onChange={(e) => handleInputChange('interests', e.target.value)}
                          placeholder="e.g., Hiking, Gaming, Cooking, Reading (comma separated)"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Lifestyle Survey Link */}
                  <div className="mt-4 p-3 bg-light rounded">
                    <h6 className="fw-semibold mb-2">Lifestyle Preferences</h6>
                    <p className="text-muted small mb-3">
                      Complete the lifestyle survey to help us find the best roommate matches for you.
                    </p>
                    <Link href="/lifestyle-survey" passHref legacyBehavior>
                      <Button variant="outline-success">
                        Update Lifestyle Survey
                      </Button>
                    </Link>
                  </div>
                </Card.Body>
              </Card>

              {/* Profile Management Section */}
              <Card className="shadow-sm mb-4" style={{ border: 'none', borderRadius: '12px' }}>
                <Card.Body className="p-4">
                  <h4 className="fw-bold mb-3">Profile Management</h4>
                  <p className="text-muted mb-3">Delete your account and all associated data.</p>
                  <Button
                    variant="danger"
                    className="rounded-pill"
                    onClick={() => setDeleteModal({ show: true, password: '', loading: false, error: null })}
                  >
                    Delete Account
                  </Button>
                </Card.Body>
              </Card>
              {/* Action Buttons */}
              <div className="d-flex justify-content-end gap-2">
                <Button
                  variant="outline-secondary"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button
                  variant="success"
                  type="submit"
                >
                  Save Changes
                </Button>
              </div>
            </Form>
          </Col>
        </Row>
      </Container>
      {/* Feedback Modal */}
      <Modal show={modalState.show} onHide={() => setModalState({ ...modalState, show: false })} centered>
        <Modal.Header closeButton>
          <Modal.Title>{modalState.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className={modalState.success ? 'text-success' : 'text-danger'}>{modalState.message}</p>
        </Modal.Body>
        <Modal.Footer>
          <div className="w-100 d-flex justify-content-between align-items-center">
            <Button variant="secondary" onClick={() => setModalState({ ...modalState, show: false })}>
              Close
            </Button>
            <Button variant="success" onClick={() => router.push('/profile')}>
              See My Profile
            </Button>
          </div>
        </Modal.Footer>
      </Modal>

      {/* Delete Account Confirmation Modal */}
      <Modal
        show={deleteModal.show}
        onHide={() => setDeleteModal({ show: false, password: '', loading: false, error: null })}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Account Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <p className="text-danger fw-semibold">This action is irreversible.</p>
            <p className="text-muted mb-2">All your profile data, matches, and messages will be permanently deleted.</p>
          </div>
          <Form.Group>
            <Form.Label>Enter your password to confirm</Form.Label>
            <div className="d-flex align-items-center gap-2">
              <Form.Control
                type={deleteModal.showPassword ? 'text' : 'password'}
                value={deleteModal.password}
                onChange={(e) => setDeleteModal((s) => ({ ...s, password: e.target.value }))}
                placeholder="Password"
              />
              <Button
                variant="outline-secondary"
                onClick={() => setDeleteModal((s) => ({ ...s, showPassword: !s.showPassword }))}
                aria-label={deleteModal.showPassword ? 'Hide password' : 'Show password'}
              >
                {deleteModal.showPassword ? <EyeSlash /> : <Eye />}
              </Button>
            </div>
          </Form.Group>
          {deleteModal.error && <p className="text-danger mt-2">{deleteModal.error}</p>}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setDeleteModal({ show: false, password: '', loading: false, error: null })}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirmDelete}
            disabled={deleteModal.loading || !deleteModal.password}
          >
            {deleteModal.loading ? 'Deleting…' : 'Delete My Account'}
          </Button>
        </Modal.Footer>
      </Modal>
    </main>
  );
};

export default EditProfilePage;
