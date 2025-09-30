import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function CandidateProfile() {
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [candidateData, setCandidateData] = useState({
        name: "",
        age: "",
        email: "",
        mobile: "",
        qualification: "",
        location: "",
        occupationStatus: "",
        resume: null,
        idProof: null
    });

    // Check authentication and load data on component mount
    useEffect(() => {
        const isLoggedIn = sessionStorage.getItem("isLoggedIn");
        const userData = JSON.parse(sessionStorage.getItem("registeredUser"));

        console.log("Auth Check - Logged In:", isLoggedIn);
        console.log("User Data:", userData);

        if (!isLoggedIn) {
            setMessage("Please login first");
            setTimeout(() => navigate("/candidate/login"), 2000);
            return;
        }

        if (!userData) {
            setMessage("No profile data found. Please register first.");
            setTimeout(() => navigate("/candidate/register"), 2000);
            return;
        }

        // Set candidate data with ALL fields including Base64 files
        setCandidateData({
            name: userData.name || "",
            age: userData.age || "",
            email: userData.email || "",
            mobile: userData.mobile || "",
            qualification: userData.qualification || "",
            location: userData.location || "",
            occupationStatus: userData.occupationStatus || "",
            resume: userData.resume || null,
            idProof: userData.idProof || null
        });
    }, [navigate]);

    // Handle input changes for editing
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCandidateData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle file uploads - convert to Base64 like registration page
    const handleFileChange = (e) => {
        const { name, files } = e.target;
        if (files && files[0]) {
            if (files[0].size > 5 * 1024 * 1024) {
                setMessage("File size must be less than 5MB");
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setCandidateData(prev => ({
                    ...prev,
                    [name]: reader.result // store as Base64 string
                }));
                setMessage(`${files[0].name} selected successfully!`);
            };
            reader.readAsDataURL(files[0]);
        }
    };

    // Handle profile update
    const handleSaveProfile = (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage("");

        // Validation
        if (candidateData.age && (candidateData.age < 18 || candidateData.age > 65)) {
            setMessage("Age must be between 18 and 65");
            setIsLoading(false);
            return;
        }

        try {
            // Update user data in sessionStorage
            const updatedUserData = {
                ...candidateData,
                updatedAt: new Date().toISOString()
            };

            sessionStorage.setItem("registeredUser", JSON.stringify(updatedUserData));
            setMessage("Profile updated successfully!");
            setIsEditing(false);

        } catch (error) {
            setMessage("Failed to update profile. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    // Handle logout
    const handleLogout = () => {
        sessionStorage.removeItem("isLoggedIn");
        navigate("/candidate/login");
    };

    // Check if file is Base64 string and get file info
    const getFileInfo = (fileData) => {
        if (!fileData) return null;

        if (typeof fileData === 'string' && fileData.startsWith('data:')) {
            // It's a Base64 string
            const matches = fileData.match(/^data:(.+);base64,/);
            if (matches) {
                const mimeType = matches[1];
                const base64Data = fileData.split(',')[1];
                const fileSize = Math.round((base64Data.length * 3) / 4); // Approximate size

                return {
                    type: mimeType,
                    size: fileSize,
                    isBase64: true,
                    name: `document.${mimeType.split('/')[1] || 'file'}`
                };
            }
        }

        // If it's already an object with file info
        return fileData;
    };

    // Format file size
    const formatFileSize = (bytes) => {
        if (!bytes) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Download file
    const handleDownloadFile = (fileData, fileName) => {
        if (!fileData) return;

        if (fileData.startsWith('data:')) {
            // Base64 download
            const link = document.createElement('a');
            link.href = fileData;
            link.download = fileName || 'document';
            link.click();
        }
    };

    if (!candidateData.email) {
        return (
            <div className="container mt-4">
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2">Loading profile...</p>
                </div>
            </div>
        );
    }

    const resumeInfo = getFileInfo(candidateData.resume);
    const idProofInfo = getFileInfo(candidateData.idProof);

    return (
        <div className="container mt-4">
            {/* Header */}
            <div className="row mb-4">
                <div className="col-md-8">
                    <h2 className="text-primary fw-bold">
                        <i className="bi bi-person-circle me-2"></i>
                        Candidate Profile
                    </h2>
                </div>
                <div className="col-md-4 text-end">
                    <button
                        className="btn btn-outline-danger"
                        onClick={handleLogout}
                    >
                        <i className="bi bi-box-arrow-right me-2"></i>
                        Logout
                    </button>
                </div>
            </div>

            {/* Message Alert */}
            {message && (
                <div className={`alert ${message.includes("success") ? "alert-success" : message.includes("selected") ? "alert-info" : "alert-danger"} alert-dismissible fade show`}>
                    {message}
                    <button
                        type="button"
                        className="btn-close"
                        onClick={() => setMessage("")}
                    ></button>
                </div>
            )}

            <div className="row">
                {/* Profile Information Card */}
                <div className="col-lg-8">
                    <div className="card shadow">
                        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">
                                <i className="bi bi-info-circle me-2"></i>
                                Profile Information
                            </h5>
                            {!isEditing ? (
                                <button
                                    className="btn btn-light btn-sm"
                                    onClick={() => setIsEditing(true)}
                                >
                                    <i className="bi bi-pencil me-1"></i>
                                    Edit Profile
                                </button>
                            ) : (
                                <div>
                                    <button
                                        className="btn btn-light btn-sm me-2"
                                        onClick={() => setIsEditing(false)}
                                        disabled={isLoading}
                                    >
                                        <i className="bi bi-x me-1"></i>
                                        Cancel
                                    </button>
                                    <button
                                        className="btn btn-success btn-sm"
                                        onClick={handleSaveProfile}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-1"></span>
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-check me-1"></i>
                                                Save Changes
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleSaveProfile}>
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-semibold">Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            className="form-control"
                                            value={candidateData.name || ""}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-semibold">Age</label>
                                        <input
                                            type="number"
                                            name="age"
                                            className="form-control"
                                            value={candidateData.age || ""}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                            min="18"
                                            max="65"
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-semibold">Email</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            value={candidateData.email || ""}
                                            disabled
                                        />
                                        <small className="text-muted">Email cannot be changed</small>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-semibold">Mobile</label>
                                        <input
                                            type="text"
                                            name="mobile"
                                            className="form-control"
                                            value={candidateData.mobile || ""}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-semibold">Qualification</label>
                                        <input
                                            type="text"
                                            name="qualification"
                                            className="form-control"
                                            value={candidateData.qualification || ""}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-semibold">Location</label>
                                        <input
                                            type="text"
                                            name="location"
                                            className="form-control"
                                            value={candidateData.location || ""}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                        />
                                    </div>
                                    <div className="col-md-12 mb-3">
                                        <label className="form-label fw-semibold">Occupation Status</label>
                                        <select
                                            name="occupationStatus"
                                            className="form-select"
                                            value={candidateData.occupationStatus || ""}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                        >
                                            <option value="">Select Status</option>
                                            <option value="Available">Available</option>
                                            <option value="Not Available">Not Available</option>
                                        </select>
                                    </div>

                                    {/* File upload fields - only show when editing */}
                                    {isEditing && (
                                        <>
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label fw-semibold">
                                                    <i className="bi bi-file-earmark-text me-2"></i>
                                                    Update Resume
                                                </label>
                                                <input
                                                    type="file"
                                                    name="resume"
                                                    className="form-control"
                                                    onChange={handleFileChange}
                                                    accept=".pdf,.doc,.docx"
                                                />
                                                <small className="text-muted">Accepted formats: PDF, DOC, DOCX (Max 5MB)</small>
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label fw-semibold">
                                                    <i className="bi bi-file-earmark-image me-2"></i>
                                                    Update ID Proof
                                                </label>
                                                <input
                                                    type="file"
                                                    name="idProof"
                                                    className="form-control"
                                                    onChange={handleFileChange}
                                                    accept=".pdf,.jpg,.jpeg,.png"
                                                />
                                                <small className="text-muted">Accepted formats: PDF, JPG, PNG (Max 5MB)</small>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Profile Summary Card */}
                <div className="col-lg-4">
                    <div className="card shadow">
                        <div className="card-header bg-info text-white">
                            <h5 className="mb-0">
                                <i className="bi bi-person-badge me-2"></i>
                                Profile Summary
                            </h5>
                        </div>
                        <div className="card-body">
                            <div className="text-center mb-3">
                                <div className="bg-primary rounded-circle d-inline-flex align-items-center justify-content-center"
                                    style={{ width: '80px', height: '80px' }}>
                                    <i className="bi bi-person-fill text-white" style={{ fontSize: '2rem' }}></i>
                                </div>
                                <h5 className="mt-2 mb-0">{candidateData.name || "Not Set"}</h5>
                                <small className="text-muted">{candidateData.email || "No email"}</small>
                            </div>

                            <div className="border-top pt-3">
                                <div className="d-flex justify-content-between mb-2">
                                    <span className="text-muted">Status:</span>
                                    <span className={`badge ${candidateData.occupationStatus === 'Available' ? 'bg-success' : 'bg-secondary'}`}>
                                        {candidateData.occupationStatus || 'Not Set'}
                                    </span>
                                </div>
                                <div className="d-flex justify-content-between mb-2">
                                    <span className="text-muted">Age:</span>
                                    <span>{candidateData.age || 'Not Set'}</span>
                                </div>
                                <div className="d-flex justify-content-between mb-2">
                                    <span className="text-muted">Mobile:</span>
                                    <span>{candidateData.mobile || 'Not Set'}</span>
                                </div>
                                <div className="d-flex justify-content-between mb-2">
                                    <span className="text-muted">Location:</span>
                                    <span>{candidateData.location || 'Not Set'}</span>
                                </div>
                                <div className="d-flex justify-content-between">
                                    <span className="text-muted">Qualification:</span>
                                    <span>{candidateData.qualification || 'Not Set'}</span>
                                </div>
                            </div>

                            {/* File Status with Download Options */}
                            <div className="border-top pt-3 mt-3">
                                <h6 className="fw-semibold">
                                    <i className="bi bi-files me-2"></i>
                                    Documents Status
                                </h6>

                                {/* Resume Status */}
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <span className="text-muted">Resume:</span>
                                    <div>
                                        {resumeInfo ? (
                                            <div className="d-flex align-items-center gap-2">
                                                <span className="badge bg-success">Uploaded</span>

                                            </div>
                                        ) : (
                                            <span className="badge bg-warning">Pending</span>
                                        )}
                                    </div>
                                </div>
                                {resumeInfo && (
                                    <small className="text-muted d-block mb-2">
                                        <i className="bi bi-info-circle me-1"></i>
                                        Size: {formatFileSize(resumeInfo.size)} | Type: {resumeInfo.type?.split('/')[1] || 'file'}
                                    </small>
                                )}

                                {/* ID Proof Status */}
                                <div className="d-flex justify-content-between align-items-center">
                                    <span className="text-muted">ID Proof:</span>
                                    <div>
                                        {idProofInfo ? (
                                            <div className="d-flex align-items-center gap-2">
                                                <span className="badge bg-success">Uploaded</span>

                                            </div>
                                        ) : (
                                            <span className="badge bg-warning">Pending</span>
                                        )}
                                    </div>
                                </div>
                                {idProofInfo && (
                                    <small className="text-muted d-block">
                                        <i className="bi bi-info-circle me-1"></i>
                                        Size: {formatFileSize(idProofInfo.size)} | Type: {idProofInfo.type?.split('/')[1] || 'file'}
                                    </small>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions Card */}
                    <div className="card shadow mt-3">
                        <div className="card-header bg-secondary text-white">
                            <h6 className="mb-0">
                                <i className="bi bi-lightning me-2"></i>
                                Quick Actions
                            </h6>
                        </div>
                        <div className="card-body">
                            <div className="d-grid gap-2">
                                <button
                                    className="btn btn-outline-primary btn-sm"
                                    onClick={() => setIsEditing(!isEditing)}
                                    disabled={isLoading}
                                >
                                    <i className="bi bi-pencil me-1"></i>
                                    {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                                </button>
                                <button
                                    className="btn btn-outline-info btn-sm"
                                    onClick={() => window.location.reload()}
                                    disabled={isLoading}
                                >
                                    <i className="bi bi-arrow-clockwise me-1"></i>
                                    Refresh Data
                                </button>
                                <button
                                    className="btn btn-outline-success btn-sm"
                                    onClick={() => navigate("/candidate/register")}
                                >
                                    <i className="bi bi-person-plus me-1"></i>
                                    Create New Account
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CandidateProfile;