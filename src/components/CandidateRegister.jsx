import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function CandidateRegister() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: "",
        age: "",
        email: "",
        password: "",
        mobile: "",
        qualification: "",
        location: "",
        occupationStatus: ""
    });
    const [message, setMessage] = useState("");

    // handle input change
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // handle form submit
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Simple validation
        if (!form.email.includes("@")) {
            setMessage("Invalid email format");
            return;
        }
        if (form.age < 18 || form.age > 60) {
            setMessage("Age must be between 18 and 60");
            return;
        }

        try {
            const res = await axios.post("/api/candidates/register", form);
            setMessage(res.data.message); // show success from API
        } catch (err) {
            setMessage("Registration failed!");
        }
    };

    return (
        <div className="container mt-5">
            <div className="card shadow p-4">
                <h2 className="mb-4 text-center">Candidate Registration</h2>
                {message && <div className="alert alert-info">{message}</div>}

                <form onSubmit={handleSubmit} className="row g-3">
                    <div className="col-md-6">
                        <label className="form-label">Name</label>
                        <input
                            type="text"
                            name="name"
                            className="form-control"
                            required
                            onChange={handleChange}
                        />
                    </div>

                    <div className="col-md-6">
                        <label className="form-label">Age</label>
                        <input
                            type="number"
                            name="age"
                            className="form-control"
                            required
                            onChange={handleChange}
                        />
                    </div>

                    <div className="col-md-6">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            name="email"
                            className="form-control"
                            required
                            onChange={handleChange}
                        />
                    </div>

                    <div className="col-md-6">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            name="password"
                            className="form-control"
                            required
                            onChange={handleChange}
                        />
                    </div>

                    <div className="col-md-6">
                        <label className="form-label">Mobile</label>
                        <input
                            type="text"
                            name="mobile"
                            className="form-control"
                            required
                            onChange={handleChange}
                        />
                    </div>

                    <div className="col-md-6">
                        <label className="form-label">Qualification</label>
                        <input
                            type="text"
                            name="qualification"
                            className="form-control"
                            onChange={handleChange}
                        />
                    </div>

                    <div className="col-md-6">
                        <label className="form-label">Location</label>
                        <input
                            type="text"
                            name="location"
                            className="form-control"
                            onChange={handleChange}
                        />
                    </div>

                    <div className="col-md-6">
                        <label className="form-label">Occupation Status</label>
                        <select
                            name="occupationStatus"
                            className="form-select"
                            onChange={handleChange}
                        >
                            <option value="">Select</option>
                            <option value="Available">Available</option>
                            <option value="Not Available">Not Available</option>
                        </select>
                    </div>

                    <div className="col-12 text-center">
                        <button className="btn btn-primary px-5">Register</button>
                    </div>
                </form>

                <div className="text-center mt-4">
                    <p className="text-muted">
                        Already have an account? 
                        <button 
                            type="button"
                            onClick={() => navigate("/login")}
                            className="btn btn-link text-primary fw-semibold p-0 ms-1"
                        >
                            Sign in here
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default CandidateRegister;
