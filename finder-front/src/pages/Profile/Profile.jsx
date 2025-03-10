import React from 'react';
import './ProfileStyle.css';

const Profile = ({username }) => (
    <div className="singin-main">
        <p className="singin-main-text">Profile</p>
        <div className="profile-center">
            <img src="/images/full_avatar.png" alt="profile" style={{width: '350px'}} />
            <div className="profile-text">
                <p className="username">{username}</p>
                <p>E-mail : example@example.com</p>
                <p>Phone number : +1112223334</p>
                <p>Address :  Example st., 666</p>
            </div>
        </div>
    </div>
);

export default Profile;
