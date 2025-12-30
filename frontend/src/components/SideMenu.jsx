import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

/**
 * サイドメニューコンポーネント
 * ワイヤーフレーム通りのデザイン
 */
const SideMenu = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [expandedMenu, setExpandedMenu] = useState('マッチングステータス'); // Default expanded
    const [isCollapsed, setIsCollapsed] = useState(() => {
        return localStorage.getItem('sidebarCollapsed') === 'true';
    });

    const toggleCollapse = () => {
        const newState = !isCollapsed;
        setIsCollapsed(newState);
        localStorage.setItem('sidebarCollapsed', newState.toString());
    };

    const toggleSubMenu = (label) => {
        setExpandedMenu(expandedMenu === label ? null : label);
    };

    const menuItems = [
        {
            path: '/home',
            label: 'ホーム',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            )
        },
        {
            path: '/profile/me',
            label: 'プロフィール',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            )
        },
        {
            path: '/teacher-connection',
            label: '教師とのつながり',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            )
        },
        {
            path: '',
            label: 'マッチングステータス',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            ),
            // Define sub-items for accordion
            subItems: [
                { path: '/matching-status/pending', label: '保留中' },
                { path: '/matching-status/approved', label: '承認済み' },
                { path: '/matching-status/finished', label: '終了' }
            ]
        },
        {
            path: '/schedule',
            label: 'スケジュール',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            )
        },
        {
            path: '/feedback',
            label: 'フィードバック',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
            )
        },
        {
            path: '/messages',
            label: 'メッセージ',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
            )
        },
    ];

    const isActive = (item) => {
        // If it's a string path (for sub-items), do exact match
        if (typeof item === 'string') {
            return location.pathname === item;
        }

        const path = item.path;

        // For items with sub-menu, DON'T highlight parent
        if (item.subItems) {
            return false;
        }

        // Special case for profile routes
        if (path === '/profile/me' && location.pathname.startsWith('/profile')) {
            return true;
        }

        // Exact match for other routes
        return location.pathname === path;
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <>
            {/* ハンバーガーメニューボタン（モバイル用） */}
            <button
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-900 text-white rounded-md shadow-lg"
                onClick={() => setIsOpen(!isOpen)}
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {isOpen ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                </svg>
            </button>

            {/* サイドメニュー */}
            <aside
                className={`
          fixed top-0 left-0 h-screen bg-gradient-to-b from-gray-900 to-gray-800 shadow-2xl z-40
          transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:sticky lg:top-0 ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
          flex flex-col
        `}
            >
                {/* ロゴ & Toggle */}
                <div className="p-6 border-b border-gray-700 flex items-center justify-between">
                    <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center w-full' : ''}`}>
                        <div onClick={toggleCollapse} className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                        {!isCollapsed && (
                            <h1 className="text-lg font-bold text-white">
                                先生リンク
                            </h1>
                        )}
                    </div>
                </div>

                {/* ナビゲーションメニュー */}
                <nav className="flex-1 p-4 overflow-y-auto">
                    <ul className="space-y-1">
                        {menuItems.map((item) => (
                            <li key={item.path}>
                                <div
                                    className={`
                                        flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer
                                        transition-all duration-200
                                        ${isCollapsed ? 'justify-center' : ''}
                                        ${isActive(item)
                                            ? 'bg-white text-gray-900 shadow-lg'
                                            : 'text-gray-300 hover:bg-gray-700 hover:text-white'}
                                    `}
                                    onClick={() => {
                                        if (item.subItems) {
                                            if (!isCollapsed) {
                                                toggleSubMenu(item.label);
                                            }
                                        } else {
                                            navigate(item.path);
                                            setIsOpen(false);
                                        }
                                    }}
                                    title={isCollapsed ? item.label : ''}
                                >
                                    {item.icon}
                                    {!isCollapsed && (
                                        <span className="font-medium text-sm">{item.label}</span>
                                    )}
                                </div>

                                {!isCollapsed && item.subItems && expandedMenu === item.label && (
                                    <ul className="ml-10 mt-1 space-y-1">
                                        {item.subItems.map((sub) => (
                                            <li key={sub.path}>
                                                <Link
                                                    to={sub.path}
                                                    className={`
                                                        block px-3 py-2 text-sm rounded-md
                                                        ${isActive(sub.path)
                                                            ? 'bg-white text-gray-900 shadow'
                                                            : 'text-gray-300 hover:bg-gray-700 hover:text-white'}
                                                    `}
                                                    onClick={() => setIsOpen(false)}
                                                >
                                                    {sub.label}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* ユーザープロフィール */}
                <div className="p-4 border-t border-gray-700">
                    <div className={`flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-800 ${isCollapsed ? 'justify-center px-0' : ''}`}>
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        {!isCollapsed && (
                            <>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-white truncate">
                                        {user?.name || 'ユーザー'}
                                    </p>
                                    <p className="text-xs text-gray-400 truncate">
                                        {user?.email || ''}
                                    </p>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="p-1 text-gray-400 hover:text-white transition-colors"
                                    title="ログアウト"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </aside>

            {/* オーバーレイ（モバイル用） */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
};

export default SideMenu;
