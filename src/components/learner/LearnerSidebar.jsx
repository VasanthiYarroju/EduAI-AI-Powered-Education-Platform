import React from 'react';
import { NavLink } from 'react-router-dom';
import { User, BrainCircuit, BarChart3, MessageSquare, Award, BarChartHorizontal, Users, Settings, LogOut } from 'lucide-react';
import { auth } from '../../firebase';
import { signOut } from 'firebase/auth';

const professionalSidebarStyles = `
  .sidebar-container {
    width: 260px;
    background-color: #111827; /* Darker background */
    display: flex;
    flex-direction: column;
    padding: 1.5rem 1rem; /* More padding */
    border-right: 1px solid #1f2937; /* Softer border */
    flex-shrink: 0;
    transition: width 0.3s ease;
  }
  .sidebar-header {
    padding: 0 0.5rem;
    margin-bottom: 2rem;
  }
  .sidebar-title {
    font-size: 1.75rem;
    font-weight: 700;
    color: #fff;
    letter-spacing: 2px;
  }
  .sidebar-nav {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
  }
  .nav-link {
    display: flex;
    align-items: center;
    padding: 0.8rem 1rem;
    margin: 0.2rem 0;
    border-radius: 8px;
    color: #9ca3af; /* Muted text */
    text-decoration: none;
    transition: all 0.2s ease-in-out;
    font-weight: 500;
  }
  .nav-link:hover {
    background-color: #1f2937; /* Hover effect */
    color: #fff;
  }
  .nav-link-active {
    background-color: #0891b2; /* Cyan-700 for a richer color */
    color: #fff;
    box-shadow: 0 4px 14px 0 rgba(8, 145, 178, 0.3);
  }
  .sidebar-icon {
    margin-right: 1rem;
    width: 22px;
    height: 22px;
  }
  .logout-button {
    background: none;
    border: none;
    width: 100%;
    cursor: pointer;
    margin-top: auto; /* Pushes to the bottom */
  }
`;

const navItems = [
    { name: 'Profile', icon: User, path: 'profile' },
    { name: 'My Learning Path', icon: BrainCircuit, path: 'learning-path' },
    { name: 'Assessments', icon: BarChart3, path: 'assessments' },
    { name: 'Discussions', icon: MessageSquare, path:'forum' },
    { name: 'Achievements', icon: Award, path: 'achievements' },
    { name: 'Progress Report', icon: BarChartHorizontal, path: 'progress-report' },
    { name: 'Mentorship', icon: Users, path: 'mentorship' },
    { name: 'Settings', icon: Settings, path: 'settings' },
];

const LearnerSidebar = () => {
  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <>
      <style>{professionalSidebarStyles}</style>
      <div className="sidebar-container">
        <div className="sidebar-header">
          <h1 className="sidebar-title">EDU-AI</h1>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `nav-link ${isActive ? 'nav-link-active' : ''}`
              }
            >
              <item.icon className="sidebar-icon" />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
        <button onClick={handleLogout} className="nav-link logout-button">
          <LogOut className="sidebar-icon" />
          <span>Logout</span>
        </button>
      </div>
    </>
  );
};

export default LearnerSidebar;