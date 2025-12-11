'use client';

import React, { useState } from 'react';
import {
  Card,
  Form,
  Row,
  Col,
  Button,
  Badge,
  Collapse,
} from 'react-bootstrap';
import {
  FunnelFill,
  XCircleFill,
  BookmarkFill,
  ChevronDown,
  ChevronUp,
} from 'react-bootstrap-icons';

export interface MatchFilters {
  minMatchPercentage: number;
  pronouns: string[];
  housingType: string[];
  preferredDorm: string[];
  classStanding: string[];
  major: string;
  sleepSchedule: string[];
  cleanliness: string[];
  socialLevel: string[];
  smoking: string[];
  pets: string[];
  budget: string[];
  moveInTimeline: string[];
}

export const DEFAULT_FILTERS: MatchFilters = {
  minMatchPercentage: 0,
  pronouns: [],
  housingType: [],
  preferredDorm: [],
  classStanding: [],
  major: '',
  sleepSchedule: [],
  cleanliness: [],
  socialLevel: [],
  smoking: [],
  pets: [],
  budget: [],
  moveInTimeline: [],
};

interface MatchFiltersProps {
  filters: MatchFilters;
  onFiltersChange: (filters: MatchFilters) => void;
  onClearFilters: () => void;
  onSaveFilters: () => void;
  activeFilterCount: number;
  matchCount: number;
  totalMatches: number;
}

// UH Dorms list
const UH_DORMS = [
  'Frear Hall',
  'Gateway House',
  'Hale Aloha Ilima',
  'Hale Aloha Lehua',
  'Hale Aloha Lokelani',
  'Hale Aloha Mokihana',
  'Hale Laulima',
  'Hale Noelani',
  'Hale Wainani',
  'Johnson Hall A',
  'Johnson Hall B',
  'Johnson Hall C',
];

const MatchFilterPanel: React.FC<MatchFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  onSaveFilters,
  activeFilterCount,
  matchCount,
  totalMatches,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [savedNotification, setSavedNotification] = useState(false);

  const handleFilterChange = (key: keyof MatchFilters, value: string | number) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const handleCheckboxChange = (key: keyof MatchFilters, value: string, checked: boolean) => {
    const currentValues = filters[key] as string[];
    const newValues = checked
      ? [...currentValues, value]
      : currentValues.filter((v) => v !== value);
    onFiltersChange({ ...filters, [key]: newValues });
  };

  const handleSave = () => {
    onSaveFilters();
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 2000);
  };

  const showDormFilter = filters.housingType.includes('on-campus');

  return (
    <Card className="shadow-sm mb-4" style={{ border: 'none', borderRadius: '12px' }}>
      <Card.Body className="p-4">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="d-flex align-items-center flex-grow-1">
            <Button
              variant="link"
              onClick={() => setShowFilters(!showFilters)}
              className="p-0 text-decoration-none d-flex align-items-center"
              style={{ color: 'inherit' }}
            >
              {showFilters ? <ChevronUp className="me-2" /> : <ChevronDown className="me-2" />}
              <h5 className="mb-0 d-flex align-items-center">
                <FunnelFill className="me-2 text-success" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge bg="success" className="ms-2">
                    {activeFilterCount}
                  </Badge>
                )}
              </h5>
            </Button>
          </div>
          <div className="d-flex gap-2">
            {savedNotification && (
              <Badge bg="success" className="me-2">
                Saved!
              </Badge>
            )}
            <Button
              variant="outline-success"
              onClick={handleSave}
              title="Save current filters"
            >
              <BookmarkFill className="me-1" />
              Save
            </Button>
            <Button
              variant="outline-danger"
              onClick={onClearFilters}
              disabled={activeFilterCount === 0}
              title="Clear all filters"
            >
              <XCircleFill className="me-1" />
              Clear
            </Button>
          </div>
        </div>

        {/* Match Count */}
        <div className="mb-3 text-muted small">
          Showing
          {' '}
          <strong>{matchCount}</strong>
          {' '}
          of
          {' '}
          <strong>{totalMatches}</strong>
          {' '}
          matches
        </div>

        <Collapse in={showFilters}>
          <div>
            {/* Essential Filters */}
            <Row className="g-3">
              {/* Match Percentage Slider */}
              <Col xs={12}>
                <Form.Group>
                  <Form.Label className="fw-bold small">
                    Minimum Match Percentage:
                    {' '}
                    {filters.minMatchPercentage}
                    %
                  </Form.Label>
                  <Form.Range
                    value={filters.minMatchPercentage}
                    onChange={(e) => handleFilterChange('minMatchPercentage', parseInt(e.target.value, 10))}
                    min={0}
                    max={100}
                    step={5}
                  />
                  <div className="d-flex justify-content-between small text-muted">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </Form.Group>
              </Col>

              {/* Pronouns Filter */}
              <Col xs={12} md={6}>
                <Form.Group>
                  <Form.Label className="fw-bold small">Pronouns</Form.Label>
                  <div className="d-flex flex-column gap-1">
                    {['he/him', 'she/her', 'they/them', 'other'].map((pronoun) => (
                      <Form.Check
                        key={pronoun}
                        type="checkbox"
                        id={`pronoun-${pronoun}`}
                        label={pronoun.split('/').map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join('/')}
                        checked={filters.pronouns.includes(pronoun)}
                        onChange={(e) => handleCheckboxChange('pronouns', pronoun, e.target.checked)}
                      />
                    ))}
                  </div>
                </Form.Group>
              </Col>

              {/* Housing Type Filter */}
              <Col xs={12} md={6}>
                <Form.Group>
                  <Form.Label className="fw-bold small">Housing Preference</Form.Label>
                  <div className="d-flex flex-column gap-1">
                    {[
                      { value: 'on-campus', label: 'On-Campus' },
                      { value: 'off-campus', label: 'Off-Campus' },
                      { value: 'either', label: 'Either' },
                      { value: 'undecided', label: 'Undecided' },
                    ].map((option) => (
                      <Form.Check
                        key={option.value}
                        type="checkbox"
                        id={`housing-${option.value}`}
                        label={option.label}
                        checked={filters.housingType.includes(option.value)}
                        onChange={(e) => handleCheckboxChange('housingType', option.value, e.target.checked)}
                      />
                    ))}
                  </div>
                </Form.Group>
              </Col>

              {/* Preferred Dorm (conditional) */}
              {showDormFilter && (
                <Col xs={12}>
                  <Form.Group>
                    <Form.Label className="fw-bold small">Preferred Dorms</Form.Label>
                    <div
                      className="border rounded p-2"
                      style={{ maxHeight: '150px', overflowY: 'auto' }}
                    >
                      <div className="d-flex flex-column gap-1">
                        {UH_DORMS.map((dorm) => (
                          <Form.Check
                            key={dorm}
                            type="checkbox"
                            id={`dorm-${dorm}`}
                            label={dorm}
                            checked={filters.preferredDorm.includes(dorm)}
                            onChange={(e) => handleCheckboxChange('preferredDorm', dorm, e.target.checked)}
                          />
                        ))}
                      </div>
                    </div>
                  </Form.Group>
                </Col>
              )}

              {/* Class Standing */}
              <Col xs={12} md={6}>
                <Form.Group>
                  <Form.Label className="fw-bold small">Class Standing</Form.Label>
                  <div className="d-flex flex-column gap-1">
                    {['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate'].map((classLevel) => (
                      <Form.Check
                        key={classLevel}
                        type="checkbox"
                        id={`class-${classLevel}`}
                        label={classLevel}
                        checked={filters.classStanding.includes(classLevel)}
                        onChange={(e) => handleCheckboxChange('classStanding', classLevel, e.target.checked)}
                      />
                    ))}
                  </div>
                </Form.Group>
              </Col>

              {/* Major Search */}
              <Col xs={12} md={6}>
                <Form.Group>
                  <Form.Label className="fw-bold small">Major</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Search by major..."
                    value={filters.major}
                    onChange={(e) => handleFilterChange('major', e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Advanced Filters Toggle */}
            <div className="mt-3">
              <Button
                variant="link"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-decoration-none p-0 text-success"
                aria-expanded={showAdvanced}
              >
                {showAdvanced ? <ChevronUp className="me-1" /> : <ChevronDown className="me-1" />}
                {showAdvanced ? 'Hide' : 'Show'}
                {' '}
                Advanced Filters
              </Button>
            </div>

            {/* Advanced Filters */}
            <Collapse in={showAdvanced}>
              <div>
                <hr className="my-3" />
                <Row className="g-3">
                  {/* Lifestyle Filters */}
                  <Col xs={12}>
                    <h6 className="fw-bold mb-3">Lifestyle Preferences</h6>
                  </Col>

                  <Col xs={12} md={4}>
                    <Form.Group>
                      <Form.Label className="small">Sleep Schedule</Form.Label>
                      <div className="d-flex flex-column gap-1">
                        {[
                          { value: 'early-bird', label: 'Early Bird' },
                          { value: 'morning', label: 'Morning Person' },
                          { value: 'flexible', label: 'Flexible' },
                          { value: 'evening', label: 'Evening Person' },
                          { value: 'night-owl', label: 'Night Owl' },
                        ].map((option) => (
                          <Form.Check
                            key={option.value}
                            type="checkbox"
                            id={`sleep-${option.value}`}
                            label={option.label}
                            checked={filters.sleepSchedule.includes(option.value)}
                            onChange={(e) => handleCheckboxChange('sleepSchedule', option.value, e.target.checked)}
                          />
                        ))}
                      </div>
                    </Form.Group>
                  </Col>

                  <Col xs={12} md={4}>
                    <Form.Group>
                      <Form.Label className="small">Cleanliness</Form.Label>
                      <div className="d-flex flex-column gap-1">
                        {[
                          { value: 'relaxed', label: 'Relaxed' },
                          { value: 'casual', label: 'Casual' },
                          { value: 'moderate', label: 'Moderate' },
                          { value: 'tidy', label: 'Tidy' },
                          { value: 'very-clean', label: 'Very Clean' },
                        ].map((option) => (
                          <Form.Check
                            key={option.value}
                            type="checkbox"
                            id={`clean-${option.value}`}
                            label={option.label}
                            checked={filters.cleanliness.includes(option.value)}
                            onChange={(e) => handleCheckboxChange('cleanliness', option.value, e.target.checked)}
                          />
                        ))}
                      </div>
                    </Form.Group>
                  </Col>

                  <Col xs={12} md={4}>
                    <Form.Group>
                      <Form.Label className="small">Social Level</Form.Label>
                      <div className="d-flex flex-column gap-1">
                        {[
                          { value: 'homebody', label: 'Homebody' },
                          { value: 'occasional', label: 'Occasional' },
                          { value: 'balanced', label: 'Balanced' },
                          { value: 'social', label: 'Social' },
                          { value: 'very-social', label: 'Very Social' },
                        ].map((option) => (
                          <Form.Check
                            key={option.value}
                            type="checkbox"
                            id={`social-${option.value}`}
                            label={option.label}
                            checked={filters.socialLevel.includes(option.value)}
                            onChange={(e) => handleCheckboxChange('socialLevel', option.value, e.target.checked)}
                          />
                        ))}
                      </div>
                    </Form.Group>
                  </Col>

                  {/* Habits */}
                  <Col xs={12}>
                    <h6 className="fw-bold mb-3 mt-2">Habits</h6>
                  </Col>

                  <Col xs={12} md={6}>
                    <Form.Group>
                      <Form.Label className="small">Smoking</Form.Label>
                      <div className="d-flex flex-column gap-1">
                        {[
                          { value: 'yes', label: 'Smoker' },
                          { value: 'no', label: 'Non-Smoker' },
                        ].map((option) => (
                          <Form.Check
                            key={option.value}
                            type="checkbox"
                            id={`smoking-${option.value}`}
                            label={option.label}
                            checked={filters.smoking.includes(option.value)}
                            onChange={(e) => handleCheckboxChange('smoking', option.value, e.target.checked)}
                          />
                        ))}
                      </div>
                    </Form.Group>
                  </Col>

                  <Col xs={12} md={6}>
                    <Form.Group>
                      <Form.Label className="small">Pets</Form.Label>
                      <div className="d-flex flex-column gap-1">
                        {[
                          { value: 'yes', label: 'Has Pets' },
                          { value: 'no', label: 'No Pets' },
                        ].map((option) => (
                          <Form.Check
                            key={option.value}
                            type="checkbox"
                            id={`pets-${option.value}`}
                            label={option.label}
                            checked={filters.pets.includes(option.value)}
                            onChange={(e) => handleCheckboxChange('pets', option.value, e.target.checked)}
                          />
                        ))}
                      </div>
                    </Form.Group>
                  </Col>

                  {/* Additional Filters */}
                  <Col xs={12}>
                    <h6 className="fw-bold mb-3 mt-2">Other Preferences</h6>
                  </Col>

                  <Col xs={12} md={6}>
                    <Form.Group>
                      <Form.Label className="small">Budget (Off-Campus)</Form.Label>
                      <div className="d-flex flex-column gap-1">
                        {[
                          { value: 'under-500', label: 'Under $500' },
                          { value: '500-750', label: '$500 - $750' },
                          { value: '750-1000', label: '$750 - $1,000' },
                          { value: '1000-1500', label: '$1,000 - $1,500' },
                          { value: 'over-1500', label: 'Over $1,500' },
                        ].map((option) => (
                          <Form.Check
                            key={option.value}
                            type="checkbox"
                            id={`budget-${option.value}`}
                            label={option.label}
                            checked={filters.budget.includes(option.value)}
                            onChange={(e) => handleCheckboxChange('budget', option.value, e.target.checked)}
                          />
                        ))}
                      </div>
                    </Form.Group>
                  </Col>

                  <Col xs={12} md={6}>
                    <Form.Group>
                      <Form.Label className="small">Move-in Timeline</Form.Label>
                      <div className="d-flex flex-column gap-1">
                        {[
                          { value: 'asap', label: 'ASAP' },
                          { value: '1-month', label: 'Within 1 Month' },
                          { value: '2-3-months', label: '2-3 Months' },
                          { value: 'flexible', label: 'Flexible' },
                        ].map((option) => (
                          <Form.Check
                            key={option.value}
                            type="checkbox"
                            id={`timeline-${option.value}`}
                            label={option.label}
                            checked={filters.moveInTimeline.includes(option.value)}
                            onChange={(e) => handleCheckboxChange('moveInTimeline', option.value, e.target.checked)}
                          />
                        ))}
                      </div>
                    </Form.Group>
                  </Col>
                </Row>
              </div>
            </Collapse>
          </div>
        </Collapse>
      </Card.Body>
    </Card>
  );
};

export default MatchFilterPanel;
