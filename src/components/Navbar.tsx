/* eslint-disable max-len */
/* eslint-disable react/jsx-indent, @typescript-eslint/indent */

'use client';

import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { Container, Nav, Navbar, NavDropdown, Badge } from 'react-bootstrap';
import { BoxArrowRight, Lock, PersonFill, PersonPlusFill, PencilSquare, ChatDots } from 'react-bootstrap-icons';
import Image from 'next/image';
import ProfileAvatar from '@/components/ProfileAvatar';

const NavBar: React.FC = () => {
  const { data: session } = useSession();
  const currentUser = session?.user?.email;
  const userWithRole = session?.user as { email: string; randomKey: string };
  const role = userWithRole?.randomKey;
  const pathName = usePathname();

  /**
   * Tracks the number of unread messages for the current user.
   * This is currently using mock data for demonstration purposes.
   *
   * When implementing the real messaging system, this should be replaced with
   * an API call to fetch the actual count from your database, something like:
   * const { data: unreadCount } = useSWR('/api/messages/unread');
   *
   * The notification badge will automatically show/hide based on this value.
   */
  const unreadMessageCount = 1; // Mock data - replace with actual API call
  return (
    <Navbar bg="light" expand="lg">
      <Container>
        <Navbar.Brand
          href={role === 'ADMIN' ? '/admin' : '/'}
          className="d-flex align-items-center"
        >
          <Image
            src="/RoomieLogo.png"
            alt="Manoa RoomieMatch"
            width={200}
            height={70}
            className="d-inline-block align-top"
            style={{ objectFit: 'contain', maxHeight: '100%' }}
            priority
          />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto justify-content-start flex-row flex-wrap">
            {currentUser ? (
              // eslint-disable-next-line react/jsx-no-useless-fragment
              <>
                {role === 'ADMIN' ? (
                  <>
                    <Nav.Link id="admin-dashboard-nav" href="/admin" active={pathName === '/admin'}>
                      Admin Dashboard
                    </Nav.Link>
                    <NavDropdown id="resources-dropdown" title="Resources" active={pathName.startsWith('/resources')}>
                      <NavDropdown.Item id="resources-housing" href="/resources" active={pathName === '/resources'}>
                        Housing Resources
                      </NavDropdown.Item>
                      <NavDropdown.Item id="resources-lifestyle-categories" href="/resources/lifestyle-categories" active={pathName === '/resources/lifestyle-categories'}>
                        Lifestyle Resources
                      </NavDropdown.Item>
                    </NavDropdown>
                  </>
                ) : (
                  <>
                    <Nav.Link id="browse-matches-nav" href="/matches" active={pathName === '/matches'}>
                      Browse Matches
                    </Nav.Link>
                    <Nav.Link
                      id="lifestyle-survey-nav"
                      href="/lifestyle-survey"
                      active={pathName === '/lifestyle-survey'}
                    >
                      Lifestyle Survey
                    </Nav.Link>
                    <NavDropdown id="resources-dropdown" title="Resources" active={pathName.startsWith('/resources')}>
                      <NavDropdown.Item id="resources-housing" href="/resources" active={pathName === '/resources'}>
                        Housing Resources
                      </NavDropdown.Item>
                      <NavDropdown.Item id="resources-lifestyle-categories" href="/resources/lifestyle-categories" active={pathName === '/resources/lifestyle-categories'}>
                        Lifestyle Tips
                      </NavDropdown.Item>
                    </NavDropdown>
                    <Nav.Link id="profile-nav" href="/profile" active={pathName === '/profile'}>
                      My Profile
                    </Nav.Link>
                    <Nav.Link
                      id="edit-profile-nav"
                      href="/edit-profile"
                      active={pathName === '/edit-profile'}
                    >
                      Edit Profile
                    </Nav.Link>
                  </>
                )}
              </>
            ) : ''}
          </Nav>
          <Nav className="align-items-center gap-2 ms-auto">
            {session ? (
              <>
                <NavDropdown
                  id="login-dropdown"
                  className="nav-login-dropdown"
                  title={(
                    <span className="d-flex align-items-center gap-2">
                      <ProfileAvatar size={28} useCurrentUser showBorder={false} />
                      <span className="d-none d-md-inline">{currentUser}</span>
                    </span>
                  )}
                >
                  {role !== 'ADMIN' && (
                    <>
                      <NavDropdown.Item id="login-dropdown-edit-profile" href="/edit-profile">
                        <PencilSquare />
                        {' '}
                        Edit Profile
                      </NavDropdown.Item>
                      <NavDropdown.Divider />
                    </>
                  )}
                  <NavDropdown.Item id="login-dropdown-change-password" href="/auth/change-password">
                    <Lock />
                    {' '}
                    Change Password
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item
                    id="login-dropdown-sign-out"
                    onClick={() => signOut({ callbackUrl: '/' })}
                    role="button"
                  >
                    <BoxArrowRight />
                    {' '}
                    Sign Out
                  </NavDropdown.Item>
                </NavDropdown>
                <Nav.Link id="messages-nav" href="/messages" active={pathName === '/messages'}>
                  <span className="position-relative">
                    <ChatDots className="me-1" size={20} />
                    {unreadMessageCount > 0 && (
                      <Badge
                        bg="danger"
                        pill
                        className="position-absolute"
                        style={{
                          top: '-8px',
                          right: '-8px',
                          fontSize: '0.65rem',
                          minWidth: '18px',
                          height: '18px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '0 5px',
                        }}
                      >
                        {unreadMessageCount}
                      </Badge>
                    )}
                  </span>
                </Nav.Link>
              </>
            ) : (
              <NavDropdown id="login-dropdown" title="Login" className="nav-login-dropdown">
                <NavDropdown.Item id="login-dropdown-sign-in" href="/auth/signin">
                  <PersonFill />
                  {' '}
                  Sign in
                </NavDropdown.Item>
                <NavDropdown.Item id="login-dropdown-sign-up" href="/auth/signup">
                  <PersonPlusFill />
                  {' '}
                  Sign up
                </NavDropdown.Item>
              </NavDropdown>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavBar;
