import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../component/authcontext';
import logo from '../assets/logo1.png';
import React, { useState } from "react";

const navigation = [
  { name: 'Home', href: '/home', current: true },
  { name: 'Playlist', href: '/profile', current: false },
  { name: 'History', href: '/history', current: false },
  { name: 'Liked Videos', href: '/like', current: false },
  { name: 'Blog', href: '/tweet', current: false },
  { name: 'Dashboard', href: '/dashboard', current: false },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter' && query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Disclosure as="nav" className="bg-gray-800">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-[1800px] px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 lg:h-20 items-center justify-between">
              {/* Left: Logo + mobile menu */}
              <div className="flex items-center">
                <div className="sm:hidden mr-2">
                  <DisclosureButton className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700">
                    {open ? (
                      <XMarkIcon className="h-6 w-6" />
                    ) : (
                      <Bars3Icon className="h-6 w-6" />
                    )}
                  </DisclosureButton>
                </div>
                <Link to="/">
                  <img
                    className="h-8 sm:h-10 xl:h-12 w-auto"
                    src={logo}
                    alt="Logo"
                  />
                </Link>
              </div>

              {/* Center Nav */}
              <div className="hidden sm:flex sm:space-x-4 lg:space-x-6 xl:space-x-10">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={classNames(
                      item.current
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                      'rounded-md px-3 py-2 text-sm lg:text-base xl:text-lg font-medium'
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>

              {/* Right: Search, Auth buttons, Avatar */}
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  placeholder="Search..."
                  className="w-28 sm:w-40 lg:w-64 xl:w-80 2xl:w-96 rounded-md bg-gray-700 px-3 py-1 text-sm lg:text-base text-white border border-white"
                />

                {!user ? (
                  <Link
                    to="/signup"
                    className="bg-indigo-600 px-3 py-1 text-sm font-medium text-white rounded hover:bg-indigo-500"
                  >
                    Signup
                  </Link>
                ) : (
                  <>
                    <button
                      onClick={handleLogout}
                      className="bg-red-600 px-3 py-1 text-sm font-medium text-white rounded hover:bg-red-500"
                    >
                      Logout
                    </button>
                    <Link to="/profile">
                      <img
                        src={user.avatar || 'https://via.placeholder.com/32'}
                        alt="User Avatar"
                        className="h-8 w-8 xl:h-10 xl:w-10 rounded-full object-cover border-2 border-white cursor-pointer"
                      />
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Nav */}
          <DisclosurePanel className="sm:hidden px-2 pt-2 pb-3">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={classNames(
                  item.current
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                  'block rounded-md px-3 py-2 text-base font-medium'
                )}
              >
                {item.name}
              </Link>
            ))}
          </DisclosurePanel>
        </>
      )}
    </Disclosure>
  );
}