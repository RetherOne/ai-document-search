import React, {useState} from 'react';
import './SingInStyle.css'
import {Button, Form, Input, TextField} from "react-aria-components";
import { useNavigate } from 'react-router-dom';

const SingIn = ({authorizationSeter, setUsername}) => {
    const [loginError, setLoginError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const navigate = useNavigate();

    const handleSignIn = (event) => {
        event.preventDefault();

        const login = event.target['login'].value; // Получаем значение из поля login
        const password = event.target['password'].value; // Получаем значение из поля password

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
            authorizationSeter(true);
            setUsername(login);
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
