import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import '../css/Login.css';

const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const { register } = useContext(AuthContext);
    const { login } = useContext(AuthContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        try {
            await register(username, password);
            // automatically login after registration
            await login(username, password);
            document.location.href = '/';
        } catch (err) {
            console.error('Registration error:', err);
            setError('Registration failed');
        }
    };

    return (
        <div id="loginContainer">
            <div id="loginHeader">Sign Up</div>
            <div id="formContainer">
                <form onSubmit={handleSubmit}>
                    <div className="inputGroup">
                        <label id="inputHeading" htmlFor="usernameInput">Email</label>
                        <input
                            id="usernameInput"
                            type="text"
                            placeholder="example@email.com"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div className="inputGroup">
                        <label id="inputHeading" htmlFor="passwordInput">Password</label>
                        <input
                            id="passwordInput"
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <div className="inputGroup">
                        <label id="inputHeading" htmlFor="confirmPasswordInput">Confirm Password</label>
                        <input
                            id="confirmPasswordInput"
                            type="password"
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>
                    <button type="submit" id="loginButton">Register</button>
                    {error && <div id="errorMessage" className="error">{error}</div>}
                </form>
            </div>
            <div>
                <a id="registerLink" href="/login">Already have an account? Log in</a>
            </div>
        </div>
    );
};

export default Register;
// version: "Register form validation" by ChatGPT