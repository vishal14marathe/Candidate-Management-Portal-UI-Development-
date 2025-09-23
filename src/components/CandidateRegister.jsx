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
        occupationStatus: "",
        resume: null,
        idProof: null,
    });
    const [message, setMessage] = useState("");

    // handle input change
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // handle file upload
    const handleFileChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.files[0] });
    };

    // handle form submit
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic email validation
        if (!form.email.includes("@")) {
            setMessage("Invalid email format");
            return;
        }

        try {
            // Use FormData for file + text data
            const formData = new FormData();
            Object.keys(form).forEach((key) => {
                formData.append(key, form[key]);
            });

            const res = await axios.post("/api/candidates/register", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            setMessage(res.data.message || "Registration successful!");
        } catch (err) {
            if (err.response?.data?.message) {
                setMessage(err.response.data.message);
            } else {
                setMessage("Registration failed! Please try again.");
            }
        }
    };

    return (
        <div className="container mt-3">
            <div className="card shadow p-3">
                <h2 className="mb-4 text-center fw-bold text-primary">
                    Candidate Registration
                </h2>

                {message && <div className="alert alert-info">{message}</div>}

                <form onSubmit={handleSubmit} className="row g-3">
                    <div className="col-md-6">
                        <label className="form-label">Name</label>
                        <input
                            type="text"
                            name="name"
                            className="form-control"
                            placeholder="Enter your name"
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
                            placeholder="Enter your age"
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
                            placeholder="Enter your email"
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
                            placeholder="Create password"
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
                            placeholder="Enter mobile number"
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
                            placeholder="Graduate, Postgraduate"
                            onChange={handleChange}
                        />
                    </div>

                    <div className="col-md-6">
                        <label className="form-label">Location</label>
                        <input
                            type="text"
                            name="location"
                            className="form-control"
                            placeholder="Enter your location"
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
                            <option value="">Select occupation status</option>
                            <option value="Available">Available</option>
                            <option value="Not Available">Not Available</option>
                        </select>
                    </div>

                    <div className="col-md-6">
                        <label className="form-label">Resume (PDF/DOC)</label>
                        <input
                            type="file"
                            name="resume"
                            className="form-control"
                            accept=".pdf,.doc,.docx"
                            required
                            onChange={handleFileChange}
                        />
                    </div>

                    <div className="col-md-6">
                        <label className="form-label">ID Proof (PDF/JPG/PNG)</label>
                        <input
                            type="file"
                            name="idProof"
                            className="form-control"
                            accept=".pdf,.jpg,.jpeg,.png"
                            required
                            onChange={handleFileChange}
                        />
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
