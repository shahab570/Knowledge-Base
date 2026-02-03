import React, { useEffect } from 'react';
import { useAuth } from "../contexts/AuthContext";
import { BrainCircuit } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';

export default function Login() {
    const { login, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate('/', { replace: true });
        }
    }, [user, navigate]);

    return (
        <div className="login-container">
            <div className="glass-panel login-card">
                <div className="logo-wrapper">
                    <BrainCircuit size={64} className="logo-icon" />
                </div>
                <h1>Knowledge <span className="highlight">Hub</span></h1>
                <p className="subtitle">Organize your learning journey.</p>

                <button className="btn-primary login-btn" onClick={login}>
                    Continue with Google
                </button>
            </div>
        </div>
    );
}
