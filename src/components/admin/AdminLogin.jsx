import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-hot-toast';

const AdminLogin = () => {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        email: "",
        password: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Set default admin credentials in localStorage (not sessionStorage)
        if (!localStorage.getItem("adminEmail")) {
            localStorage.setItem("adminEmail", "admin@example.com");
        }
        if (!localStorage.getItem("adminPassword")) {
            localStorage.setItem("adminPassword", "adminPass");
        }
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const storedEmail = localStorage.getItem("adminEmail");
        const storedPassword = localStorage.getItem("adminPassword");

        if (form.email === storedEmail && form.password === storedPassword) {
            // Create admin user object and store in localStorage
            const adminUser = {
                id: 1,
                email: form.email,
                name: 'Admin User',
                role: 'ADMIN',
                token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
                loginTime: new Date().toISOString()
            };

            // Store in localStorage (same as AdminDashboard expects)
            localStorage.setItem("adminUser", JSON.stringify(adminUser));

            toast.success("Login successful! Redirecting to dashboard...");

            setTimeout(() => {
                navigate("/admin/dashboard");
            }, 1000);
        } else {
            setError("Invalid email or password");
            toast.error("Invalid credentials");
        }

        setLoading(false);
    };

    return (
        <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
            <div className="card shadow p-4" style={{ width: "380px" }}>
                <h2 className="text-center mb-4">Admin Login</h2>

                {error && (
                    <div className="alert alert-danger" role="alert">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            className="form-control"
                            required
                            autoComplete="email"
                            placeholder="admin@example.com"
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            className="form-control"
                            required
                            autoComplete="current-password"
                            placeholder="Enter password"
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary w-100"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2"></span>
                                Checking...
                            </>
                        ) : (
                            "Login"
                        )}
                    </button>
                </form>

                <div className="text-center mt-3">
                    <small className="text-muted">
                        Demo: admin@example.com / adminPass
                    </small>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;