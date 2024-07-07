import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../css/Footer.css';
import chartSvg from '../images/piechart.svg';
import calendarSvg from '../images/calender.svg';

const Footer = () => {
    const { user, logout } = useContext(AuthContext);
    const [showPanel, setShowPanel] = useState(false);

    const togglePanel = () => {
        setShowPanel((prevShowPanel) => !prevShowPanel);
        const panel = document.querySelector('.addSessionBackground');
        panel.classList.toggle('show');
    };

    return (
        <div className="footer">

            <nav className="container">
                <ul>
                    <div className="icons">
                        <li onClick={() => document.location.href = '/chart'}>
                            <div className="icon" style={{backgroundImage: `url(${chartSvg})`}}></div>
                        </li>
                        <li onClick={() => document.location.href = '/calender'}>
                            <div className="icon" style={{backgroundImage: `url(${calendarSvg})`}}></div>
                        </li>
                    </div>
                    <div className="addSession" onClick={() => togglePanel()}> Add session</div>
                </ul>
            </nav>
        </div>
    );
};

export default Footer;