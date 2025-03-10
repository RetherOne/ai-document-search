import React, { useState } from 'react';
import './RegistrStyle.css';
import { Button, Form, Input, TextField } from "react-aria-components";
import { useNavigate } from 'react-router-dom';

const Register = ({ authorizationSeter, setUsername }) => {
    const [loginError, setLoginError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [phoneError, setPhoneError] = useState('');
    const [checkboxError, setCheckboxError] = useState(false);

    const navigate = useNavigate();

    const handleRegister = (event) => {
        event.preventDefault();

        const login = event.target['login'].value;
        const password = event.target['password'].value;
        const email = event.target['email'].value;
        const phone = event.target['phone'].value;
        const isCheckboxChecked = event.target['agree'].checked;

        let isValid = true;


        if (login.length < 1) {
            setLoginError('Login is required');
            isValid = false;
        } else {
            setLoginError('');
        }

        if (password.length < 1) {
            setPasswordError('Password is required');
            isValid = false;
        } else {
            setPasswordError('');
        }

        if (email.length < 1) {
            setEmailError('Email is required');
            isValid = false;
        } else {
            setEmailError('');
        }

        if (phone.length < 1) {
            setPhoneError('Phone number is required');
            isValid = false;
        } else {
            setPhoneError('');
        }

        if (!isCheckboxChecked) {
            setCheckboxError(true);
            isValid = false;
        } else {
            setCheckboxError(false);
        }

        if (isValid) {
            authorizationSeter(true);
            setUsername(login);
            navigate('/');
        }
    };

    return (
        <div className="singin-main">
            <p className="singin-main-text">Registration</p>
            <Form className="singin-form" name="searchForm" onSubmit={handleRegister}>
                <TextField className="singin-textField" aria-label="login">
                    <div className="singin-div">
                        <label>Login</label>
                        <Input
                            className="singin-input"
                            type="text"
                            name="login"
                            placeholder="Enter login"
                        />
                        {loginError && <p className="error">{loginError}</p>}
                    </div>
                </TextField>
                <TextField aria-label="password" className="singin-textField">
                    <div className="singin-div">
                        <label>Password</label>
                        <Input
                            className="singin-input"
                            type="text"
                            name="password"
                            placeholder="Enter password"
                        />
                        {passwordError && <p className="error">{passwordError}</p>}
                    </div>
                </TextField>
                <TextField aria-label="email" className="singin-textField">
                    <div className="singin-div">
                        <label>E-mail</label>
                        <Input
                            className="singin-input"
                            type="text"
                            name="email"
                            placeholder="Enter e-mail"
                        />
                        {emailError && <p className="error">{emailError}</p>}
                    </div>
                </TextField>
                <TextField aria-label="phone" className="singin-textField">
                    <div className="singin-div">
                        <label>Phone number</label>
                        <Input
                            className="singin-input"
                            type="text"
                            name="phone"
                            placeholder="Enter phone number"
                        />
                        {phoneError && <p className="error">{phoneError}</p>}
                    </div>
                </TextField>
                <div style={{ width: '100%' }}>
                    <div className="singin-label">
                        <Input
                            type="checkbox"
                            name="agree"
                        />
                        <label>I agree with the policy</label>
                    </div>
                    {checkboxError && <p className="error">You must agree with the policy</p>}
                </div>
                <Button className="singin-button" type="submit">Register</Button>
            </Form>
        </div>
    );
}

export default Register;
