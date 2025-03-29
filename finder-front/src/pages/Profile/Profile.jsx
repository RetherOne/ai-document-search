import React from 'react';
import './ProfileStyle.css';

const Profile = ({username, csrfToken }) => {
    const handleSettings = (e) => {
        const uploadedFile = e.target.files[0];
        const formData = new FormData();
        formData.append('avatar', uploadedFile);

        fetch("http://localhost:8000/api/set-profile-data/", {
            method: "POST",
            headers: {
                "X-CSRFToken": csrfToken,
            },
            credentials: "include",
            body: formData,
        }).then(response => {
            if (response.ok) {
                console.log("File uploaded successfully");
            } else {
                console.log("Upload failed");
            }
        }).catch(error => {
            console.error("Error uploading file:", error);
        });
    }
    return (
        <div className="singin-main">
            <p className="singin-main-text">Profile</p>
            <div className="profile-center">
                <img src="/images/full_avatar.png" alt="profile" style={{width: '350px'}}/>
                <div className="profile-text">
                    <p className="username">{username}</p>
                    <p>E-mail : example@example.com</p>
                    <p>Phone number : +1112223334</p>
                    <p>Address : Example st., 666</p>
                    <div className="profile-address">
                        <input
                            onChange={handleSettings}
                            type="file"
                            accept=".jpg,.png"
                        />
                    </div>

                </div>
            </div>
        </div>
    )
}


export default Profile;
