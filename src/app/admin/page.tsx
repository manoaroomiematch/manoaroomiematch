/**
 * The Admin Home page.
 * Contains sections for User Management, Content Moderation, and Lifestyle Categories with tables.
 * This page provides a simple overview of the admin interface.
 */
import { getServerSession } from 'next-auth';
import { Col, Container, Row, Table } from 'react-bootstrap';
import StuffItemAdmin from '@/components/StuffItemAdmin';
import { prisma } from '@/lib/prisma';
import { adminProtectedPage } from '@/lib/page-protection';
import authOptions from '@/lib/authOptions';

const AdminPage = async () => {
  const session = await getServerSession(authOptions);
  adminProtectedPage(
    session as {
      user: { email: string; id: string; randomKey: string };
    } | null,
  );
  const stuff = await prisma.stuff.findMany({});
  const users = await prisma.user.findMany({});

  return (
    <main>
      <Container id="list" className="py-3">
        {/* Page Header */}
        <h1>Admin Home</h1>
        <br />
        {/* User Management Section */}
        <Row>
          <Col>
            <h2>User Management</h2>
            <Table hover>
              <thead>
                {/* User Management Table Headers */}
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Activity</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {stuff.map((item) => (
                  <StuffItemAdmin key={item.id} {...item} />
                ))}
              </tbody>
            </Table>
          </Col>
        </Row>
        <br />
        {/* Content Moderation Section */}
        <Row>
          <Col>
            <h2>Content Moderation</h2>
            <Table hover>
              <thead>
                {/* Content Moderation Table Headers */}
                <tr>
                  <th>User</th>
                  <th>Flag Reason</th>
                  <th>Flagged Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Col>
        </Row>
        <br />
        {/* Lifestyle Categories Section */}
        <Row>
          <Col>
            <h2>Lifestyle Categories</h2>
            <Table hover>
              <thead>
                {/* Lifestyle Categories Table Headers */}
                <tr>
                  <th>Category</th>
                  <th>Items</th>
                  <th>Last Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {stuff.map((item) => (
                  <StuffItemAdmin key={item.id} {...item} />
                ))}
              </tbody>
            </Table>
          </Col>
        </Row>
      </Container>
    </main>
  );
};

export default AdminPage;
