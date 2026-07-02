import Dropdown from '@/Components/Dropdown';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function AuthenticatedLayout({ children }) {
    const { auth } = usePage().props;
    const user = auth.user;
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);

    return (
        <div className="internal-app-shell">
            <nav className="internal-nav">
                <Link href="/" className="brand-block">
                    <span className="brand-mark">ME</span>
                    <span>
                        <strong>MANGROVE-EYE</strong>
                        <small>Internal dashboard</small>
                    </span>
                </Link>

                <div className="nav-links desktop-only">
                    <Link
                        href={route('dashboard')}
                        className={`nav-chip ${route().current('dashboard') ? 'is-active' : ''}`}
                    >
                        Dashboard
                    </Link>
                    <Link
                        href={route('profile.edit')}
                        className={`nav-chip ${route().current('profile.edit') ? 'is-active' : ''}`}
                    >
                        Profile
                    </Link>
                </div>

                <div className="nav-user desktop-only">
                    <Dropdown>
                        <Dropdown.Trigger>
                            <button type="button" className="user-trigger">
                                <span>
                                    <strong>{user.name}</strong>
                                    <small>{user.email}</small>
                                </span>
                                <svg
                                    className="h-4 w-4"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </button>
                        </Dropdown.Trigger>

                        <Dropdown.Content>
                            <Dropdown.Link href={route('profile.edit')}>
                                Profile
                            </Dropdown.Link>
                            <Dropdown.Link href={route('logout')} method="post" as="button">
                                Log Out
                            </Dropdown.Link>
                        </Dropdown.Content>
                    </Dropdown>
                </div>

                <button
                    type="button"
                    className="mobile-menu-trigger"
                    onClick={() => setShowingNavigationDropdown((state) => !state)}
                >
                    Menu
                </button>
            </nav>

            {showingNavigationDropdown ? (
                <div className="mobile-sheet">
                    <Link href={route('dashboard')} className="mobile-link">
                        Dashboard
                    </Link>
                    <Link href={route('profile.edit')} className="mobile-link">
                        Profile
                    </Link>
                    <Link href={route('logout')} method="post" as="button" className="mobile-link">
                        Log Out
                    </Link>
                </div>
            ) : null}

            <main>{children}</main>
        </div>
    );
}
