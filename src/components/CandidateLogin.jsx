import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function CandidateLogin() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        email: "",
        password: ""
    });
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // handle input change
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // handle form submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage("");

        // Simple validation
        if (!form.email.includes("@")) {
            setMessage("Invalid email format");
            setIsLoading(false);
            return;
        }

        if (form.password.length < 6) {
            setMessage("Password must be at least 6 characters");
            setIsLoading(false);
            return;
        }

        try {
            const res = await axios.post("/api/login", {
                email: form.email,
                password: form.password,
            });

            if (res.data.token) {
                // Store token & role in localStorage
                localStorage.setItem("authToken", res.data.token);
                localStorage.setItem("userRole", res.data.role);

                setMessage("Login successful! Redirecting to profile...");

                // Navigate to profile page after 2 seconds
                setTimeout(() => {
                    navigate("/profile");
                }, 2000);
            }
        } catch (err) {
            if (err.response?.status === 401) {
                setMessage("Invalid email or password. Please try again.");
            } else if (err.response?.data?.message) {
                setMessage(err.response.data.message);
            } else {
                setMessage("Login failed! Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6 col-lg-5">
                    <div className="card shadow-lg">
                        <div className="card-body p-5">
                            <div className="text-center mb-4">
                                <h2 className="fw-bold text-primary">Candidate Login</h2>
                                <p className="text-muted">Sign in to access your profile</p>
                            </div>

                            {message && (
                                <div
                                    className={`alert ${
                                        message.includes("successful")
                                            ? "alert-success"
                                            : "alert-danger"
                                    } text-center`}
                                >
                                    {message}
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                {/* Email Input */}
                                <div className="mb-3">
                                    <label htmlFor="email" className="form-label fw-semibold">
                                        <i className="bi bi-envelope me-2"></i>Email Address
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        className="form-control form-control-lg"
                                        placeholder="Enter your email"
                                        value={form.email}
                                        onChange={handleChange}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>

                                {/* Password Input */}
                                <div className="mb-4">
                                    <label htmlFor="password" className="form-label fw-semibold">
                                        <i className="bi bi-lock me-2"></i>Password
                                    </label>
                                    <input
                                        type="password"
                                        id="password"
                                        name="password"
                                        className="form-control form-control-lg"
                                        placeholder="Enter your password"
                                        value={form.password}
                                        onChange={handleChange}
                                        required
                                        disabled={isLoading}
                                        minLength="6"
                                    />
                                </div>

                                {/* Submit Button */}
                                <div className="d-grid">
                                    <button
                                        type="submit"
                                        className="btn btn-primary btn-lg"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <span
                                                    className="spinner-border spinner-border-sm me-2"
                                                    role="status"
                                                    aria-hidden="true"
                                                ></span>
                                                Signing In...
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-box-arrow-in-right me-2"></i>
                                                Sign In
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>

                            {/* Register Link */}
                            <div className="text-center mt-4">
                                <p className="text-muted">
                                    Don't have an account?
                                    <button
                                        type="button"
                                        onClick={() => navigate("/register")}
                                        className="btn btn-link text-primary fw-semibold p-0 ms-1"
                                    >
                                        Register here
                                    </button>
                                </p>
                            </div>

                            {/* Forgot Password */}
                            <div className="text-center mt-3">
                                <small className="text-muted">
                                    <button
                                        type="button"
                                        onClick={() => navigate("/forgot-password")}
                                        className="btn btn-link text-muted p-0"
                                        style={{
                                            fontSize: "inherit",
                                            textDecoration: "none",
                                        }}
                                    >
                                        Forgot your password?
                                    </button>
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CandidateLogin;
