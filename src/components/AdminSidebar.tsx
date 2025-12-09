'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, Button, ListGroup, Form, Badge } from 'react-bootstrap';
import { PersonCircle, Plus, PencilSquare, X } from 'react-bootstrap-icons';
import AdminEditProfileModal from './AdminEditProfileModal';

interface Task {
  id: string;
  title: string;
  completed: boolean;
}

interface AdminSidebarProps {
  adminName: string;
  adminEmail: string;
  adminPhotoUrl?: string;
  adminFirstName?: string;
  adminLastName?: string;
  adminBio?: string;
  adminPronouns?: string;
  totalUsers: number;
  adminUserCount: number;
  regularUserCount: number;
  totalFlags: number;
  totalCategories: number;
  onProfileUpdate?: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({
  adminName,
  adminEmail,
  adminPhotoUrl,
  adminFirstName,
  adminLastName,
  adminBio,
  adminPronouns,
  totalUsers,
  adminUserCount,
  regularUserCount,
  totalFlags,
  totalCategories,
  onProfileUpdate,
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showAddTask, setShowAddTask] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Load tasks from localStorage on mount
  useEffect(() => {
    const storedTasks = localStorage.getItem('adminTasks');
    if (storedTasks) {
      try {
        setTasks(JSON.parse(storedTasks));
      } catch (err) {
        console.error('Error loading tasks:', err);
      }
    }
  }, []);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('adminTasks', JSON.stringify(tasks));
  }, [tasks]);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      const newTask: Task = {
        id: Date.now().toString(),
        title: newTaskTitle,
        completed: false,
      };
      setTasks([...tasks, newTask]);
      setNewTaskTitle('');
      setShowAddTask(false);
    }
  };

  const handleToggleTask = (taskId: string) => {
    setTasks(tasks.map((task) => (task.id === taskId ? { ...task, completed: !task.completed } : task)));
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
  };

  const completedTasksCount = tasks.filter((task) => task.completed).length;
  const completionPercentage = tasks.length > 0 ? Math.round((completedTasksCount / tasks.length) * 100) : 0;

  return (
    <div
      style={{
        position: 'sticky',
        top: '20px',
        maxHeight: 'calc(100vh - 40px)',
        overflowY: 'auto',
        paddingRight: '10px',
      }}
    >
      {/* Profile Card */}
      <Card className="shadow-sm mb-3" style={{ border: 'none', borderRadius: '12px' }}>
        <Card.Body className="p-4 text-center">
          {/* Profile Image */}
          <div className="mb-3">
            {adminPhotoUrl ? (
              <Image
                src={adminPhotoUrl}
                alt={`${adminName}'s profile`}
                width={100}
                height={100}
                className="rounded-circle"
                style={{ objectFit: 'cover' }}
              />
            ) : (
              <PersonCircle size={100} className="text-secondary" />
            )}
          </div>

          {/* Admin Name */}
          <h5 className="fw-bold mb-1">{adminName}</h5>
          <p className="text-muted small mb-3" style={{ wordBreak: 'break-word' }}>
            {adminEmail}
          </p>
          <Button
            variant="outline-primary"
            size="sm"
            className="w-100 d-flex align-items-center justify-content-center gap-2"
            onClick={() => setShowEditModal(true)}
          >
            <PencilSquare size={16} />
            Edit Profile
          </Button>
        </Card.Body>
      </Card>

      {/* Statistics Card */}
      <Card className="shadow-sm mb-3" style={{ border: 'none', borderRadius: '12px' }}>
        <Card.Header className="bg-light p-3 border-0 rounded-top" style={{ borderRadius: '12px 12px 0 0' }}>
          <h6 className="mb-0 fw-bold">Statistics</h6>
        </Card.Header>
        <Card.Body className="p-3">
          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <small className="text-muted">Total Users</small>
              <Badge bg="primary">{totalUsers}</Badge>
            </div>
            <div className="ms-3">
              <small className="text-muted d-block" style={{ fontSize: '0.8rem' }}>
                Admins:
                {' '}
                <Badge bg="danger" className="ms-1">{adminUserCount}</Badge>
              </small>
              <small className="text-muted d-block" style={{ fontSize: '0.8rem' }}>
                Users:
                {' '}
                <Badge bg="secondary" className="ms-1">{regularUserCount}</Badge>
              </small>
            </div>
          </div>
          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <small className="text-muted">Flagged Content</small>
              <Badge bg="warning">{totalFlags}</Badge>
            </div>
          </div>
          <div>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <small className="text-muted">Categories</small>
              <Badge bg="success">{totalCategories}</Badge>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Tasks Checklist Card */}
      <Card className="shadow-sm" style={{ border: 'none', borderRadius: '12px' }}>
        <Card.Header className="bg-light p-3 border-0 rounded-top" style={{ borderRadius: '12px 12px 0 0' }}>
          <div className="d-flex justify-content-between align-items-center">
            <h6 className="mb-0 fw-bold">Tasks</h6>
            <Badge bg="info">
              {completedTasksCount}
              /
              {tasks.length}
            </Badge>
          </div>
        </Card.Header>
        <Card.Body className="p-3">
          {/* Completion Progress */}
          {tasks.length > 0 && (
            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <small className="text-muted">Progress</small>
                <small className="text-muted">
                  {completionPercentage}
                  %
                </small>
              </div>
              <div
                className="progress"
                style={{ height: '6px', borderRadius: '3px', overflow: 'hidden' }}
              >
                <div
                  className="progress-bar bg-success"
                  style={{
                    width: `${completionPercentage}%`,
                    borderRadius: '3px',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
            </div>
          )}

          {/* Task List */}
          {tasks.length > 0 ? (
            <ListGroup className="mb-3" style={{ gap: '8px' }}>
              {tasks.map((task) => (
                <ListGroup.Item
                  key={task.id}
                  className="d-flex align-items-center justify-content-between p-2"
                  style={{
                    backgroundColor: 'transparent',
                    border: '1px solid #e9ecef',
                    borderRadius: '6px',
                    textDecoration: task.completed ? 'line-through' : 'none',
                    color: task.completed ? '#999' : 'inherit',
                  }}
                >
                  <div className="d-flex align-items-center flex-grow-1">
                    <Form.Check
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => handleToggleTask(task.id)}
                      className="me-2"
                      style={{ marginBottom: 0 }}
                    />
                    <span style={{ fontSize: '0.9rem' }}>{task.title}</span>
                  </div>
                  <Button
                    variant="link"
                    size="sm"
                    className="text-danger p-0 ms-2"
                    onClick={() => handleDeleteTask(task.id)}
                    title="Delete task"
                  >
                    <X size={16} />
                  </Button>
                </ListGroup.Item>
              ))}
            </ListGroup>
          ) : (
            <p className="text-muted text-center mb-3" style={{ fontSize: '0.9rem' }}>
              No tasks yet
            </p>
          )}

          {/* Add Task Button/Form */}
          {!showAddTask ? (
            <Button
              variant="outline-success"
              size="sm"
              className="w-100 d-flex align-items-center justify-content-center gap-2"
              onClick={() => setShowAddTask(true)}
            >
              <Plus size={16} />
              Add Task
            </Button>
          ) : (
            <Form onSubmit={handleAddTask} className="d-flex gap-2 mb-2">
              <Form.Control
                type="text"
                placeholder="Task title..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                size="sm"
                autoFocus
                style={{ fontSize: '0.9rem' }}
              />
              <Button variant="success" size="sm" type="submit">
                Add
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setShowAddTask(false);
                  setNewTaskTitle('');
                }}
              >
                Cancel
              </Button>
            </Form>
          )}
        </Card.Body>
      </Card>

      {/* Edit Profile Modal */}
      <AdminEditProfileModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        onSave={onProfileUpdate}
        adminName={adminName}
        adminEmail={adminEmail}
        adminPhotoUrl={adminPhotoUrl}
        adminFirstName={adminFirstName}
        adminLastName={adminLastName}
        adminBio={adminBio}
        adminPronouns={adminPronouns}
      />
    </div>
  );
};

AdminSidebar.defaultProps = {
  adminPhotoUrl: undefined,
  adminFirstName: undefined,
  adminLastName: undefined,
  adminBio: undefined,
  adminPronouns: undefined,
  onProfileUpdate: undefined,
};

export default AdminSidebar;
