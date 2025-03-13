import React, {useState} from 'react';
import './SingInStyle.css'
import {Button, Form, Input, TextField} from "react-aria-components";
import { useNavigate } from 'react-router-dom';

const SingIn = ({authorizationSeter, setUsername, csrfToken}) => {
    const [username, setLocalUsername] = useState("NonE");
    const [password, setLocalPassword] = useState("NonE");

    const [loginError, setLoginError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const navigate = useNavigate();

    const handleSignIn = (event) => {
        event.preventDefault();

        const login = event.target['login'].value;
        const password = event.target['password'].value;

        let isValid = true;

        if (login.length < 1) {
            setLoginError('The login field is empty');
            isValid = false;
        } else {
            setLoginError('');
        }

        if (password.length < 1) {
            setPasswordError('The password field is empty');
            isValid = false;
        } else {
            setPasswordError('');
        }



        if (isValid) {
            setUsername(login);
            fetch("http://localhost:8000/api/login/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": csrfToken,
                },
                credentials: "include",
                body: JSON.stringify({username: login, password: password}),
            })
                .then(res => res.json())
                .then((data) => {
                    if (data.detail === "Successfully logged in.") {
                        authorizationSeter(true);
                        setUsername(username);
                    } else {
                        console.error("Login failed:", data.detail);
                    }
                })
                .catch(err => console.error("Login error:", err));
            navigate('/');
        }
    };



    return (
        <div className="singin-main">
            <p className="singin-main-text">Sing In</p>
            <Form className="singin-form" name="searchForm" onSubmit={handleSignIn}>
                <TextField className="singin-textField" aria-label="login">
                    <div className="singin-div">
                        <label>Login</label>
                        <Input className="singin-input"
                               type="text"
                               name="login"
                               placeholder="Enter login"/>
                        {loginError && <p className="error">{loginError}</p>}
                    </div>
                </TextField>
                <TextField aria-label="password" className="singin-textField">
                    <div className="singin-div">
                        <label>Password</label>
                        <Input className="singin-input"
                               type="text"
                               name="password"
                               placeholder="Enter password"/>
                        {passwordError && <p className="error">{passwordError}</p>}
                    </div>
                </TextField>
                <div className="singin-label">
                    <Input type="checkbox"/>
                    <label>Stay logged in</label>
                </div>
                <Button className="singin-button" type="submit">Sing In</Button>
            </Form>
        </div>
    );
}

export default SingIn;
