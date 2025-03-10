import React, {useEffect, useRef, useState} from 'react';
import './HeaderStyle.css'
import {NavLink, useNavigate} from "react-router-dom";

const Header = ({ authorization , setAuthorization, setUsername}) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);
    const navigate = useNavigate();

    const toggleMenu = () => {
        setMenuOpen((prev) => !prev);
    };

    const handleClickOutside = (event) => {
        // Check if the clicked element is outside the menu
        if (menuRef.current && !menuRef.current.contains(event.target)) {
            setMenuOpen(false);
        }
    };

    useEffect(() => {
        // Add a click event listener to the document
        document.addEventListener('click', handleClickOutside);
        return () => {
            // Remove the event listener on cleanup
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);


    return (
        <div className="header">
            <NavLink to="/" className='header-text'>Finder</NavLink>
            <div className='navigate'>
                <NavLink
                    className={({isActive}) => isActive ? 'nav-button isHere' : 'nav-button'}
                    to="/">Search</NavLink>
                <NavLink
                    className={({isActive}) => isActive ? 'nav-button isHere' : 'nav-button'}
                    to="/all">All documents</NavLink>
                <NavLink
                    className={({isActive}) => isActive ? 'nav-button isHere' : 'nav-button'}
                    to="/about">About Us</NavLink>
                <NavLink
                    className={({isActive}) => isActive ? 'nav-button isHere' : 'nav-button'}
                    to="/contact">Contact</NavLink>

                {authorization ? (
                    <>
                        <NavLink className="singin upload-button" to="/upload">
                            <img src="/images/Upload.png"
                                 alt="Upload img"
                                 style={{width: '16px', height: '16px'}}/>
                            Upload
                        </NavLink>
                        <div className="user-menu" style={{position: 'relative', display: 'inline-block', marginLeft: "8px"}} ref={menuRef}>

                            <button onClick={toggleMenu}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        padding: 0,
                                        cursor: 'pointer',
                                    }}>
                                <img
                                    className="user-avatar"
                                    src="/images/avatar.png"
                                    alt="User Avatar"
                                />
                            </button>

                            {menuOpen && (
                                <div className="menu-dropdown">
                                    <NavLink to="/profile" className="menu-button"
                                             onClick={() => {
                                                 toggleMenu();
                                             }}>
                                        <img src="/images/User.png"
                                             alt="Log Out"
                                             style={{width: '16px', height: '16px'}}/>
                                        Profile
                                    </NavLink>
                                    <button className="menu-button"
                                            onClick={() => {
                                                setAuthorization(false);
                                                setUsername("");
                                                navigate("/");
                                                toggleMenu();
                                            }}>
                                        <img src="/images/LogOut.png"
                                             alt="Log Out"
                                             style={{width: '16px', height: '16px'}}/>
                                        Log out
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <>
                        <NavLink className='singin' to="/singin">Sing In</NavLink>
                        <NavLink className='register' to="/register">Register</NavLink>
                    </>
                )}
            </div>
        </div>
    );
}

export default Header;
