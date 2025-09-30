import { useState } from "react";
import { useNavigate } from "react-router-dom";

function CandidateLogin() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        email: "",
        password: ""
    });
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage("");

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

        const storedUser = JSON.parse(sessionStorage.getItem("registeredUser"));

        if (storedUser && storedUser.email === form.email && storedUser.password === form.password) {

            setMessage("Login successful! Redirecting...");

            sessionStorage.setItem("isLoggedIn", "true");

            setTimeout(() => {
                navigate("/candidate/profile");
            }, 1500);

        } else {
            setMessage("Invalid email or password. Please try again.");
        }

        setIsLoading(false);
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
                                    className={`alert ${message.includes("successful")
                                        ? "alert-success"
                                        : "alert-danger"
                                        } text-center`}
                                >
                                    {message}
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label htmlFor="email" className="form-label fw-semibold">
                                        Email Address
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

                                <div className="mb-4">
                                    <label htmlFor="password" className="form-label fw-semibold">
                                        Password
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

                                <div className="d-grid">
                                    <button
                                        type="submit"
                                        className="btn btn-primary btn-lg"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? "Signing In..." : "Sign In"}
                                    </button>
                                </div>
                            </form>

                            <div className="text-center mt-4">
                                <p className="text-muted">
                                    Don't have an account?
                                    <button
                                        type="button"
                                        onClick={() => navigate("/cadidate/register")}
                                        className="btn btn-link text-primary fw-semibold p-0 ms-1"
                                    >
                                        Register here
                                    </button>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CandidateLogin;
