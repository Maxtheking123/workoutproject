import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../css/Navbar.css';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const [showPanel, setShowPanel] = useState(false);

    const handleLogout = () => {
        togglePanel();
        logout();
    };

    const togglePanel = () => {
        setShowPanel((prevShowPanel) => !prevShowPanel);
    };

    return (
        <>
            <nav>
                <div className="float-left">
                    {user && user.username ? (
                        <div className="user-info">
                            <div className="user-avatar" onClick={togglePanel}>
                                {user.username.charAt(0).toUpperCase()}
                            </div>
                        </div>
                    ) : (
                        <Link to="/login">Login</Link>
                    )}
                </div>
            </nav>
            <div className={`background ${showPanel ? 'show' : ''}`}></div>
            <div className={`panel ${showPanel ? 'show' : ''}`}>
                <div className="float-right">
                    <p>Account center</p>
                </div>
                <div className="panel-content">
                    {user ? (
                        <>
                            <div>
                                <p><strong className={'header'}>Username</strong></p>
                                <p className={'information'}>{user.username}</p>
                            </div>
                            <div>
                                <p><strong className={'header'}>Password</strong></p>
                                <p className={'information'}>Hidden</p>
                            </div>
                        </>
                    ) : (
                        <p>User not logged in</p>
                    )}
                </div>
                <button className="logout-button" onClick={handleLogout}>Logga ut</button>
            </div>
        </>
    );
};

export default Navbar;