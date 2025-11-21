/* eslint-disable react/jsx-indent, @typescript-eslint/indent */

'use client';

import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { Container, Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { BoxArrowRight, Lock, PersonFill, PersonPlusFill, PencilSquare } from 'react-bootstrap-icons';
import Image from 'next/image';

const NavBar: React.FC = () => {
  const { data: session } = useSession();
  const currentUser = session?.user?.email;
  const userWithRole = session?.user as { email: string; randomKey: string };
  const role = userWithRole?.randomKey;
  const pathName = usePathname();
  return (
    <Navbar bg="light" expand="lg">
      <Container>
        <Navbar.Brand href="/" className="d-flex align-items-center">
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
          <Nav className="me-auto justify-content-start">
            {currentUser
              ? [
                  <Nav.Link id="home-nav" href="/home" key="home" active={pathName === '/home'}>
                    Home
                  </Nav.Link>,
                  <Nav.Link id="browse-matches-nav" href="/matches" key="matches" active={pathName === '/matches'}>
                    Browse Matches
                  </Nav.Link>,
                  <Nav.Link
                    id="lifestyle-survey-nav"
                    href="/lifestyle-survey"
                    key="lifestyle-survey"
                    active={pathName === '/lifestyle-survey'}
                  >
                    Lifestyle Survey
                  </Nav.Link>,
                  <Nav.Link id="profile-nav" href="/profile" key="profile" active={pathName === '/profile'}>
                  My Profile
                  </Nav.Link>,
                  <Nav.Link
                    id="edit-profile-nav"
                    href="/edit-profile"
                    key="edit-profile"
                    active={pathName === '/edit-profile'}
                  >
                  Edit Profile
                  </Nav.Link>,
                ]
              : ''}
            {currentUser && role === 'ADMIN' ? (
              [
                <Nav.Link id="add-stuff-nav" href="/add" key="add" active={pathName === '/add'}>
                  Add Stuff
                </Nav.Link>,
                <Nav.Link id="list-stuff-nav" href="/list" key="list" active={pathName === '/list'}>
                  List Stuff
                </Nav.Link>,
                <Nav.Link id="admin-stuff-nav" href="/admin" key="admin" active={pathName === '/admin'}>
                  Admin
                </Nav.Link>,
              ]
            ) : (
              ''
            )}
          </Nav>
          <Nav>
            {session ? (
              <NavDropdown id="login-dropdown" title={currentUser} className="nav-login-dropdown">
                <NavDropdown.Item id="login-dropdown-edit-profile" as={Link} href="/edit-profile">
                  <PencilSquare />
                  {' '}
                  Edit Profile
                </NavDropdown.Item>
                <NavDropdown.Item
                  id="login-dropdown-sign-out"
                  onClick={() => signOut({ callbackUrl: '/' })}
                  role="button"
                >
                  <BoxArrowRight />
                  {' '}
                  Sign Out
                </NavDropdown.Item>
                <NavDropdown.Item id="login-dropdown-change-password" as={Link} href="/auth/change-password">
                  <Lock />
                  {' '}
                  Change Password
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <NavDropdown id="login-dropdown" title="Login" className="nav-login-dropdown">
                <NavDropdown.Item id="login-dropdown-sign-in" as={Link} href="/auth/signin">
                  <PersonFill />
                  {' '}
                  Sign in
                </NavDropdown.Item>
                <NavDropdown.Item id="login-dropdown-sign-up" as={Link} href="/auth/signup">
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
