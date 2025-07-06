import React, { useState } from 'react'; // Import useState
import { NavLink } from 'react-router-dom';
import {
  User, BrainCircuit, BarChart3, MessageSquare, Award,
  BarChartHorizontal, Users, Settings, LogOut, Menu, X // Import Menu and X icons
} from 'lucide-react';
import { auth } from '../../firebase';
import { signOut } from 'firebase/auth';

const professionalSidebarStyles = `
  /* Base styles for sidebar container - Mobile First */
  .sidebar-container {
    width: 280px; /* Slightly wider for mobile slide-in */
    background-color: #111827; /* Darker background */
    display: flex;
    flex-direction: column;
    padding: 1.5rem 1rem; /* More padding */
    flex-shrink: 0;

    /* Mobile specific positioning */
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    transform: translateX(-100%); /* Hidden off-screen by default */
    transition: transform 0.3s ease-out; /* Smooth slide transition */
    z-index: 1000; /* Ensure it's above other content */
    border-right: none; /* No border for slide-in menu */
    box-shadow: 0 0 15px rgba(0, 0, 0, 0.5); /* Add shadow for depth */
    overflow-y: auto; /* Enable scrolling for long content on mobile */
  }

  /* When sidebar is open on mobile */
  .sidebar-container.is-open {
    transform: translateX(0%); /* Slide into view */
  }

  /* Hamburger menu button */
  .sidebar-toggle-button {
    display: block; /* Show by default on small screens */
    background: none;
    border: none;
    color: #fff;
    font-size: 2rem;
    cursor: pointer;
    padding: 0.75rem;
    position: fixed; /* Fixed position so it's always available */
    top: 1rem;
    left: 1rem;
    z-index: 1001; /* Above sidebar and backdrop */
    border-radius: 8px;
    transition: background-color 0.2s ease;
  }

  .sidebar-toggle-button:hover {
    background-color: #1f2937;
  }

  /* Backdrop for mobile overlay */
  .sidebar-backdrop {
    display: none; /* Hidden by default */
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.6); /* Semi-transparent overlay */
    z-index: 999; /* Below sidebar, above content */
  }

  /* When backdrop is active on mobile */
  .sidebar-backdrop.is-open {
    display: block; /* Show when sidebar is open */
  }

  /* Styles for larger screens (e.g., tablets and desktops) */
  @media (min-width: 768px) {
    .sidebar-container {
      width: 260px; /* Original fixed width for desktop */
      position: sticky; /* Stays in place when scrolling */
      top: 0; /* Aligns to the top of its parent */
      left: auto; /* Reset left property from fixed */
      transform: translateX(0%); /* Always visible on desktop */
      height: 100vh; /* Full viewport height */
      border-right: 1px solid #1f2937; /* Original border */
      box-shadow: none; /* No shadow needed */
      overflow-y: auto; /* Maintain scrolling if content is long */
      padding-bottom: 1rem; /* Ensure space for logout button at bottom */
    }

    /* Hide the toggle button and backdrop on desktop */
    .sidebar-toggle-button,
    .sidebar-backdrop {
      display: none;
    }
  }

  /* General styles (applies to all screen sizes unless overridden) */
  .sidebar-header {
    padding: 0 0.5rem;
    margin-bottom: 2rem;
    display: flex; /* Flex to center/align items */
    align-items: center;
    justify-content: space-between; /* Space out title and close button */
  }

  /* Close button inside sidebar for mobile */
  .sidebar-close-button {
    display: none; /* Hidden by default */
    background: none;
    border: none;
    color: #9ca3af;
    cursor: pointer;
    padding: 0.5rem;
    transition: color 0.2s ease;
  }

  .sidebar-close-button:hover {
    color: #fff;
  }

  @media (max-width: 767px) {
    .sidebar-close-button {
      display: block; /* Show close button on mobile */
    }
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
    text-align: left; /* Align text to left */
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
  const [isOpen, setIsOpen] = useState(false); // State for sidebar open/close

  const handleLogout = async () => {
    await signOut(auth);
    // Optionally close sidebar after logout
    setIsOpen(false);
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const closeSidebar = () => {
    setIsOpen(false);
  };

  return (
    <>
      <style>{professionalSidebarStyles}</style>

      {/* Hamburger Menu Toggle Button (visible on mobile) */}
      <button className="sidebar-toggle-button" onClick={toggleSidebar}>
        {isOpen ? <X size={32} /> : <Menu size={32} />} {/* Change icon based on state */}
      </button>

      {/* Backdrop (visible when sidebar is open on mobile) */}
      <div
        className={`sidebar-backdrop ${isOpen ? 'is-open' : ''}`}
        onClick={closeSidebar}
      ></div>

      {/* Sidebar Container */}
      <div className={`sidebar-container ${isOpen ? 'is-open' : ''}`}>
        <div className="sidebar-header">
          <h1 className="sidebar-title">EDU-AI</h1>
          {/* Close button inside sidebar (visible on mobile) */}
          <button className="sidebar-close-button" onClick={closeSidebar}>
            <X size={24} />
          </button>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `nav-link ${isActive ? 'nav-link-active' : ''}`
              }
              onClick={closeSidebar} 
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