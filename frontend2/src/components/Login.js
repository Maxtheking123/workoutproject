import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import '../css/Login.css';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useContext(AuthContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        await login(username, password);
        document.location.href = '/';
    };

    return (
        <div id="loginContainer">
            <div id="loginHeader">Login</div>
            <div id="formContainer">
                <form onSubmit={handleSubmit}>
                    <div className="inputGroup">
                        <label htmlFor="usernameInput">Email</label>
                        <input
                            id = "usernameInput"
                            type="text"
                            placeholder="example@mail.com"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div className="inputGroup">
                        <label htmlFor="passwordInput">Password</label>
                        <input
                            id = "passwordInput"
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button type="submit" id="loginButton">Login</button>
                </form>
            </div>
            <div>
                <a id="registerLink" href="/register">Don’t have any account? Sign up</a>
            </div>
        </div>
    );
};

export default Login;