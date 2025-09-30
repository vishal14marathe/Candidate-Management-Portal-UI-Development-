import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';
import { Password } from 'primereact/password';
import { Divider } from 'primereact/divider';

import { FormSanitizer } from "../../utils/sanitize";
import { useNoCopyPaste } from "../../hook/useNoCopyPaste";

function CandidateRegister() {
    const navigate = useNavigate();
    const { handlePaste, handleCopy, handleCut } = useNoCopyPaste();

    const header = <div className="font-bold mb-0">Pick a password</div>;
    const footer = (
        <>
            <Divider />
            <p className="mt-1 text-2">Suggestions</p>
            <ul className="pl-1 ml-1 mt-0 line-height-1">
                <li>At least one lowercase</li>
                <li>At least one uppercase</li>
                <li>At least one numeric</li>
                <li>Minimum 8 characters</li>
            </ul>
        </>
    );

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

    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState("");
    const [isButtonDisabled, setIsButtonDisabled] = useState(true);

    // NEW: useEffect to check form validity whenever form or errors change
    useEffect(() => {
        // Check if all fields are filled
        const allFieldsFilled = Object.values(form).every(field => field !== "" && field !== null);

        // Check if there are any validation errors
        const noErrors = Object.values(errors).every(error => error === "");

        // Enable the button only if all fields are filled and there are no errors
        setIsButtonDisabled(!(allFieldsFilled && noErrors));
    }, [form, errors]);

    // UPDATED: handle text input change with sanitization
    const handleChange = (e) => {
        const { name, value } = e.target;

        let sanitizedValue = value;

        // Apply appropriate sanitization based on field type
        switch (name) {
            case 'name':
                sanitizedValue = FormSanitizer.sanitizeString(value, { maxLength: 100 });
                break;
            case 'age':
                sanitizedValue = FormSanitizer.sanitizeNumber(value, { min: 1, max: 120, integerOnly: true });
                break;
            case 'email':
                sanitizedValue = FormSanitizer.sanitizeEmail(value);
                break;
            case 'password':
                sanitizedValue = FormSanitizer.sanitizePassword(value);
                break;
            case 'mobile':
                sanitizedValue = FormSanitizer.sanitizePhone(value);
                break;
            case 'qualification':
            case 'location':
            case 'occupationStatus':
                sanitizedValue = FormSanitizer.sanitizeString(value, { maxLength: 100 });
                break;
            default:
                sanitizedValue = FormSanitizer.sanitizeString(value);
        }

        setForm({ ...form, [name]: sanitizedValue });

        // Clear the error for a field when the user starts typing in it again
        if (errors[name]) {
            setErrors({ ...errors, [name]: "" });
        }
    };

    // UPDATED: handle file input change with filename sanitization
    const handleFileChange = (e) => {
        const { name, files } = e.target;
        const file = files[0];
        if (!file) return;

        // Sanitize the file name
        const sanitizedFileName = FormSanitizer.sanitizeFilename(file.name);

        // Create a new File object with the sanitized name
        const sanitizedFile = new File([file], sanitizedFileName, { type: file.type });

        const reader = new FileReader();
        reader.onloadend = () => {
            setForm((prev) => ({
                ...prev,
                [name]: {
                    file: sanitizedFile,
                    base64: reader.result,
                    fileName: sanitizedFileName
                },
            }));
            // Clear error on successful file selection
            setErrors(prev => ({ ...prev, [name]: "" }));
        };
        reader.readAsDataURL(sanitizedFile);
    };

    // UPDATED: Validation logic for each field with sanitization checks
    const validateField = (name, value) => {
        let error = "";

        // Check for dangerous content first
        if (typeof value === 'string' && FormSanitizer.hasDangerousContent(value)) {
            return "Input contains potentially dangerous content.";
        }

        switch (name) {
            case "name":
                if (value.length < 3) error = "Name must be at least 3 characters.";
                else if (/\d/.test(value)) error = "Name must not include numbers.";
                break;
            case "age":
                if (!value) error = "Age is required.";
                else if (isNaN(value) || value < 18 || value > 99) error = "Please enter a valid age (18-99).";
                break;
            case "email":
                if (!/\S+@\S+\.\S+/.test(value)) error = "Invalid email format.";
                break;
            case "password":
                if (value.length < 8) error = "Password must be at least 8 characters.";
                // Enhanced password strength validation
                else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
                    error = "Password must include at least one lowercase, one uppercase, and one number.";
                }
                break;
            case "mobile":
                if (!/^\d{10}$/.test(value)) error = "Mobile number must be exactly 10 digits.";
                break;
            case "qualification":
            case "location":
            case "occupationStatus":
                if (!value) error = "This field is required.";
                break;
            case "resume":
            case "idProof":
                if (!value) error = "A file must be uploaded.";
                break;
            default:
                break;
        }
        return error;
    };

    // Handle validation when user leaves a field (onBlur)
    const handleBlur = (e) => {
        const { name, value } = e.target;
        const error = validateField(name, value);
        setErrors({ ...errors, [name]: error });
    };

    // UPDATED: handleSubmit with comprehensive sanitization and validation
    const handleSubmit = (e) => {
        e.preventDefault();

        // Sanitize all form data before processing
        const sanitizedForm = FormSanitizer.sanitizeFormData(form);

        // Check for dangerous content across all fields
        const dangerousFields = Object.entries(sanitizedForm).filter(([key, value]) =>
            typeof value === 'string' && FormSanitizer.hasDangerousContent(value)
        );

        if (dangerousFields.length > 0) {
            toast.error("Potentially dangerous content detected. Please check your inputs.");
            return;
        }

        // Final validation check
        const finalErrors = {};
        Object.keys(sanitizedForm).forEach(key => {
            const error = validateField(key, sanitizedForm[key]);
            if (error) {
                finalErrors[key] = error;
            }
        });

        if (Object.keys(finalErrors).length > 0) {
            setErrors(finalErrors);
            toast.error("Please fix the highlighted errors before submitting.");
            return;
        }

        // Enhanced validation checks
        if (!sanitizedForm.email.includes("@")) {
            setMessage("Invalid email format");
            toast.error("Invalid email format");
            return;
        }

        if (sanitizedForm.password.length < 8) {
            setMessage("Password must be at least 8 characters long");
            toast.error("Password must be at least 8 characters long");
            return;
        }

        // FIXED: Corrected the mobile validation logic
        if (sanitizedForm.mobile.length !== 10 || isNaN(sanitizedForm.mobile)) {
            setMessage("Mobile number must be exactly 10 digits and only numbers");
            toast.error("Mobile number must be exactly 10 digits");
            return;
        }

        // FIXED: Corrected age validation logic
        const age = parseInt(sanitizedForm.age);
        if (age < 18 || age > 99 || isNaN(age)) {
            setMessage("Age must be between 18 and 99");
            toast.error("Age must be between 18 and 99");
            return;
        }

        if (sanitizedForm.name.length < 3 || /\d/.test(sanitizedForm.name)) {
            setMessage("Name must be at least 3 characters and not include numbers.");
            toast.error("Name must be at least 3 characters without numbers");
            return;
        }

        // Save sanitized data to sessionStorage
        try {
            sessionStorage.setItem(
                "registeredUser",
                JSON.stringify({
                    name: sanitizedForm.name,
                    age: sanitizedForm.age,
                    email: sanitizedForm.email,
                    password: sanitizedForm.password, // Note: In real app, hash this!
                    mobile: sanitizedForm.mobile,
                    qualification: sanitizedForm.qualification,
                    location: sanitizedForm.location,
                    occupationStatus: sanitizedForm.occupationStatus,
                    resume: sanitizedForm.resume,
                    idProof: sanitizedForm.idProof,
                    registeredAt: new Date().toISOString()
                })
            );

            toast.success("Registration successful! Redirecting to login...");
            setMessage("");

            setTimeout(() => {
                navigate("/candidate/login");
            }, 2000);

        } catch (error) {
            console.error("Error saving to sessionStorage:", error);
            toast.error("Registration failed. Please try again.");
        }
    };

    return (
        <div className="container mt-4">
            <div className="card shadow p-4">
                <h2 className="text-center text-primary">Candidate Registration</h2>
                {message && <div className="alert alert-info mt-3">{message}</div>}

                <form onSubmit={handleSubmit} className="row g-3 mt-2">
                    {/* Name */}
                    <div className="col-md-6">
                        <label className="form-label">Name <span style={{ color: "red" }}>*</span></label>
                        <input
                            type="text"
                            name="name"
                            className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                            placeholder="Enter your name"
                            required
                            onChange={handleChange}
                            onBlur={handleBlur}
                            onPaste={handlePaste}
                            onCopy={handleCopy}
                            onCut={handleCut}
                            maxLength={100}
                        />
                        {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                    </div>

                    {/* Age */}
                    <div className="col-md-6">
                        <label className="form-label">Age <span style={{ color: "red" }}>*</span></label>
                        <input
                            type="number"
                            name="age"
                            className={`form-control ${errors.age ? 'is-invalid' : ''}`}
                            placeholder="Enter your age (18-99)"
                            required
                            min="18"
                            max="99"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            onPaste={handlePaste}
                            onCopy={handleCopy}
                            onCut={handleCut}
                        />
                        {errors.age && <div className="invalid-feedback">{errors.age}</div>}
                    </div>

                    {/* Email */}
                    <div className="col-md-6">
                        <label className="form-label">Email <span style={{ color: "red" }}>*</span></label>
                        <input
                            type="email"
                            name="email"
                            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                            placeholder="Enter your email"
                            required
                            onChange={handleChange}
                            onBlur={handleBlur}
                            onPaste={handlePaste}
                            onCopy={handleCopy}
                            onCut={handleCut}
                            maxLength={254}
                        />
                        {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                    </div>

                    {/* Password */}
                    <div className="col-md-6">
                        <label className="form-label">Password <span style={{ color: "red" }}>*</span></label>
                        <Password
                            name="password"
                            placeholder="Eg- Password@1234"
                            className={`w-100 ${errors.password ? 'p-invalid' : ''}`}
                            inputClassName="w-100"
                            value={form.password}
                            onChange={(e) => {
                                const sanitizedValue = FormSanitizer.sanitizePassword(e.target.value);
                                setForm({ ...form, password: sanitizedValue });
                                if (errors.password) setErrors({ ...errors, password: "" });
                            }}
                            onBlur={handleBlur}
                            header={header}
                            footer={footer}
                            feedback={true}
                            onPaste={handlePaste}
                            onCopy={handleCopy}
                            onCut={handleCut}
                            maxLength={128}
                        />
                        {errors.password && <small className="p-error">{errors.password}</small>}
                    </div>

                    {/* Mobile */}
                    <div className="col-md-6">
                        <label className="form-label">Mobile <span style={{ color: "red" }}>*</span></label>
                        <input
                            type="text"
                            name="mobile"
                            className={`form-control ${errors.mobile ? 'is-invalid' : ''}`}
                            placeholder="Enter mobile number"
                            required
                            onChange={handleChange}
                            onBlur={handleBlur}
                            onPaste={handlePaste}
                            onCopy={handleCopy}
                            onCut={handleCut}
                            maxLength={10}
                            pattern="[0-9]{10}"
                        />
                        {errors.mobile && <div className="invalid-feedback">{errors.mobile}</div>}
                    </div>

                    {/* Qualification */}
                    <div className="col-md-6">
                        <label className="form-label">Qualification <span style={{ color: "red" }}>*</span></label>
                        <select
                            name="qualification"
                            className={`form-select ${errors.qualification ? 'is-invalid' : ''}`}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            required
                            value={form.qualification}
                        >
                            <option value="">Select Qualification</option>
                            <option value="10th">10th</option>
                            <option value="12th">12th</option>
                            <option value="Graduate">Graduate</option>
                            <option value="Postgraduate">Postgraduate</option>
                        </select>
                        {errors.qualification && <div className="invalid-feedback">{errors.qualification}</div>}
                    </div>

                    {/* Location */}
                    <div className="col-md-6">
                        <label className="form-label">Location <span style={{ color: "red" }}>*</span></label>
                        <select
                            name="location"
                            className={`form-select ${errors.location ? 'is-invalid' : ''}`}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            required
                            value={form.location}
                        >
                            <option value="">Select Location</option>
                            <option value="maharashtra">Maharashtra</option>
                            <option value="delhi">Delhi</option>
                            <option value="karnataka">Karnataka</option>
                        </select>
                        {errors.location && <div className="invalid-feedback">{errors.location}</div>}
                    </div>

                    {/* Occupation Status */}
                    <div className="col-md-6">
                        <label className="form-label">Occupation Status <span style={{ color: "red" }}>*</span></label>
                        <select
                            name="occupationStatus"
                            className={`form-select ${errors.occupationStatus ? 'is-invalid' : ''}`}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            required
                            value={form.occupationStatus}
                        >
                            <option value="">Select occupation status</option>
                            <option value="Available">Available</option>
                            <option value="Not Available">Not Available</option>
                        </select>
                        {errors.occupationStatus && <div className="invalid-feedback">{errors.occupationStatus}</div>}
                    </div>

                    {/* Resume */}
                    <div className="col-md-6">
                        <label className="form-label">Resume (PDF/DOC) <span style={{ color: "red" }}>*</span></label>
                        <input
                            type="file"
                            name="resume"
                            className={`form-control ${errors.resume ? 'is-invalid' : ''}`}
                            accept=".pdf,.doc,.docx"
                            required
                            onChange={handleFileChange}
                        />
                        {errors.resume && <div className="invalid-feedback d-block">{errors.resume}</div>}
                        <small className="text-muted">Max file size: 5MB</small>
                    </div>

                    {/* ID Proof */}
                    <div className="col-md-6">
                        <label className="form-label">ID Proof (PDF/JPG/PNG) <span style={{ color: "red" }}>*</span></label>
                        <input
                            type="file"
                            name="idProof"
                            className={`form-control ${errors.idProof ? 'is-invalid' : ''}`}
                            accept=".pdf,.jpg,.jpeg,.png"
                            required
                            onChange={handleFileChange}
                        />
                        {errors.idProof && <div className="invalid-feedback d-block">{errors.idProof}</div>}
                        <small className="text-muted">Max file size: 5MB</small>
                    </div>

                    {/* Submit Button */}
                    <div className="col-12 text-center">
                        <button
                            type="submit"
                            className="btn btn-primary px-5"
                            disabled={isButtonDisabled}
                        >
                            Register
                        </button>
                    </div>
                </form>

                {/* Redirect to login */}
                <div className="text-center mt-4">
                    <p className="text-muted">
                        Already have an account?
                        <button
                            type="button"
                            onClick={() => navigate("/candidate/login")}
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