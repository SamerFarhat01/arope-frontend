import React, { useState, useEffect } from 'react';
import Axios from 'axios';
import './Login.css';
import videoFile from '../../assets/anim_logo_eng_arb_1-1835582063.mp4';
import logo from '../../assets/arope_logoo.png';
import loginBgVideo from '../../assets/login-bg-video.mp4';

const baseUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'

const Login = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [verifyPassword, setVerifyPassword] = useState('');
    const [error, setError] = useState('');
    const [isInitialLogin, setIsInitialLogin] = useState(null);

    const checkIfInitialLogin = async () => {
        const res = await Axios.get(`${baseUrl}/initial/login/${email}`);
        var { email_exists, password_is_null } = res.data;
        console.log("Check if initial login:", res.data);
        if (!email_exists) {
            setError("Email does not exist");
            setIsInitialLogin(null);
        } else {
            setIsInitialLogin(email_exists && password_is_null);
            setError('');
        }
    }

    const passwordsMatch = () => {
        return (password === verifyPassword);
    }

    useEffect(() => {
        document.querySelector('.background-video').playbackRate = 0.6;
        if (email) {
            const handler = setTimeout(() => {
                checkIfInitialLogin();
            }, 1600);

            return () => {
                clearTimeout(handler);
            };
        }
    }, [email]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isInitialLogin || passwordsMatch()) {
            try {
                const req = {
                    email: email,
                    password: password,
                    isInitialLogin: isInitialLogin
                }
                const res = await Axios.post(`${baseUrl}/login`, req);
                setError('');
                console.log('Login response:', res.data); // Debugging line
                const { token, department, firstName, lastName, isHr, isManager } = res.data;
                console.log('User Info:', firstName, lastName, isHr, isManager); // Debugging line
                onLoginSuccess(token, department, firstName, lastName, isHr, isManager);
            } catch (err) {
                setError(err.response?.data?.message || 'Login failed');
            }
        } else {
            setError('Passwords do not match');
        }
    };

    return (
        <div className="login-container">
            <video className="background-video" autoPlay loop muted>
                <source src={loginBgVideo} type="video/mp4" />
                Your browser does not support the video tag.
            </video>
            <div className="login-form">
                <img src={logo} alt="Logo" className="login-logo" />
                <form onSubmit={handleSubmit}>
                    <div>
                        <label>Email:</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label>Password:</label>
                        <input
                            type="password"
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={isInitialLogin == null}
                        />
                    </div>
                    {
                        (isInitialLogin == true) &&
                        <div>
                            <label>Verify Password:</label>
                            <input
                                type="password"
                                onChange={(e) => setVerifyPassword(e.target.value)}
                                required
                                disabled={isInitialLogin == null}
                            />
                        </div>
                    }
                    {error && <div className="error">{error}</div>}
                    <button type="submit" disabled={isInitialLogin == null}>{isInitialLogin ? "Sign Up" : "Login"}</button>
                </form>
            </div>
        </div>
    );
};

export default Login;


