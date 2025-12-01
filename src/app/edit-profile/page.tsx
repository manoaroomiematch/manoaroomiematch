'use client';

import { useState, useRef, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { PersonCircle, Upload, Trash } from 'react-bootstrap-icons';
import { useSession } from 'next-auth/react';
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
 * TODO: Connect to backend API to save profile data
 * TODO: Implement actual image upload functionality
 * TODO: Fetch existing user data from database
 * TODO: Add form validation
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
  });

  const [profilePhoto, setProfilePhoto] = useState<string>(
    isJohnDoe ? '/johndoe.jpg' : '',
  );
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (currentUserEmail) {
        try {
          const profile = await getProfileByEmail(currentUserEmail);
          if (profile) {
            setFormData({
              firstName: profile.firstName || '',
              lastName: profile.lastName || '',
              email: profile.email,
              pronouns: '', // Not in DB yet
              bio: '', // Not in DB yet
              major: profile.major || '',
              classStanding: profile.classStanding || '',
              graduationYear: profile.graduationYear?.toString() || '',
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
    value: string,
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
      });
      // eslint-disable-next-line no-alert
      alert('Profile saved successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      // eslint-disable-next-line no-alert
      alert('Failed to save profile.');
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
                        <Form.Label>About Me</Form.Label>
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
    </main>
  );
};

export default EditProfilePage;
