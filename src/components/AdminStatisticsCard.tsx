import React from 'react';
import { Badge } from 'react-bootstrap';

interface AdminStatisticsCardProps {
  totalUsers: number;
  totalFlags: number;
  totalCategories: number;
  barColor?: string;
  barText?: string;
}

const AdminStatisticsCard: React.FC<AdminStatisticsCardProps> = ({
  totalUsers,
  totalFlags,
  totalCategories,
  barColor = 'linear-gradient(90deg, #e0ffe7 0%, #f8f9fa 100%)',
  barText = '#388e3c',
}) => (
  <div
    className="d-flex flex-wrap align-items-center gap-3 px-3 py-2"
    style={{
      background: barColor,
      borderRadius: 12,
      boxShadow: '0 1px 6px #0001',
      fontSize: '1.05rem',
      border: '1px solid #e3e3e3',
      minHeight: 48,
      color: barText,
    }}
  >
    <span style={{ fontWeight: 600, letterSpacing: 0.5 }}>
      <Badge bg="primary" className="me-1">
        {totalUsers}
      </Badge>
      {' '}
      Users
    </span>
    <span style={{ fontWeight: 600, letterSpacing: 0.5 }}>
      <Badge bg="warning" className="me-1">
        {totalFlags}
      </Badge>
      {' '}
      Flags
    </span>
    <span style={{ fontWeight: 600, letterSpacing: 0.5 }}>
      <Badge bg="success" className="me-1">
        {totalCategories}
      </Badge>
      {' '}
      Categories
    </span>
  </div>
);

AdminStatisticsCard.defaultProps = {
  barColor: 'linear-gradient(90deg, #e0ffe7 0%, #f8f9fa 100%)',
  barText: '#388e3c',
};

export default AdminStatisticsCard;
