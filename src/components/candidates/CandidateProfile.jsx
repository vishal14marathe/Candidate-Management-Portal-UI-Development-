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
        <div className="d-flex min-vh-100" style={{ backgroundColor: '#f8f9fa' }}>
            {/* Sidebar Navigation */}
            <div className="sidebar" style={{ 
                width: '280px', 
                backgroundColor: '#ffffff',
                boxShadow: '2px 0 10px rgba(0,0,0,0.1)',
                position: 'fixed',
                height: '100vh',
                overflowY: 'auto'
            }}>
                <div className="p-4 border-bottom">
                    <h5 className="text-primary fw-bold mb-0">Candidate Portal</h5>
                </div>
                
                <nav className="p-3">
                    <ul className="nav flex-column">
                        <li className="nav-item mb-2">
                            <a className="nav-link active d-flex align-items-center p-3 rounded" 
                               style={{ backgroundColor: '#e3f2fd', color: '#1976d2' }}>
                                <i className="bi bi-grid me-3" style={{ fontSize: '1.2rem' }}></i>
                                Dashboard
                            </a>
                        </li>
                        <li className="nav-item mb-2">
                            <a className="nav-link d-flex align-items-center p-3 rounded text-muted">
                                <i className="bi bi-person me-3" style={{ fontSize: '1.2rem' }}></i>
                                Profile
                            </a>
                        </li>
                        <li className="nav-item mb-2">
                            <a className="nav-link d-flex align-items-center p-3 rounded text-muted">
                                <i className="bi bi-file-earmark-text me-3" style={{ fontSize: '1.2rem' }}></i>
                                Applications
                            </a>
                        </li>
                        <li className="nav-item mb-2">
                            <a className="nav-link d-flex align-items-center p-3 rounded text-muted">
                                <i className="bi bi-gear me-3" style={{ fontSize: '1.2rem' }}></i>
                                Settings
                            </a>
                        </li>
                    </ul>
                </nav>
                
                <div className="mt-auto p-3 border-top">
                    <button
                        className="btn btn-outline-danger w-100"
                        onClick={handleLogout}
                    >
                        <i className="bi bi-box-arrow-right me-2"></i>
                        Logout
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="main-content" style={{ marginLeft: '280px', width: 'calc(100% - 280px)' }}>
                {/* Header */}
                <div className="bg-white border-bottom p-4">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h3 className="fw-bold text-dark mb-1">Welcome, {candidateData.name?.split(' ')[0] || 'Candidate'}</h3>
                            <p className="text-muted mb-0">Tue, {new Date().toLocaleDateString('en-US', { 
                                weekday: 'short', 
                                day: '2-digit', 
                                month: 'long', 
                                year: 'numeric' 
                            })}</p>
                        </div>
                        <div className="d-flex align-items-center">
                            <div className="search-box me-3">
                                <div className="input-group">
                                    <span className="input-group-text bg-light border-0">
                                        <i className="bi bi-search text-muted"></i>
                                    </span>
                                    <input type="text" className="form-control border-0 bg-light" placeholder="Search" />
                                </div>
                            </div>
                            <div className="notification-icon me-3">
                                <i className="bi bi-bell text-muted" style={{ fontSize: '1.2rem' }}></i>
                            </div>
                            <div className="profile-avatar">
                                <div className="rounded-circle bg-primary d-flex align-items-center justify-content-center"
                                     style={{ width: '40px', height: '40px' }}>
                                    <span className="text-white fw-bold">
                                        {candidateData.name ? 
                                            candidateData.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) 
                                            : 'NA'
                                        }
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Message Alert */}
                {message && (
                    <div className="p-4">
                        <div className={`alert ${message.includes("success") ? "alert-success" : message.includes("selected") ? "alert-info" : "alert-danger"} alert-dismissible fade show`}>
                            {message}
                            <button
                                type="button"
                                className="btn-close"
                                onClick={() => setMessage("")}
                            ></button>
                        </div>
                    </div>
                )}

                {/* Profile Content */}
                <div className="p-4">
                    <div className="row">
                        <div className="col-lg-8">
                            <div className="card border-0 shadow-sm">
                                <div className="card-body p-4">
                                    {/* Profile Header */}
                                    <div className="d-flex align-items-center justify-content-between mb-4">
                                        <div className="d-flex align-items-center">
                                            <div className="profile-image me-3">
                                                <div className="rounded-circle bg-gradient d-flex align-items-center justify-content-center"
                                                     style={{ 
                                                         width: '80px', 
                                                         height: '80px',
                                                         background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                                     }}>
                                                    <span className="text-white fw-bold" style={{ fontSize: '2rem' }}>
                                                        {candidateData.name ? 
                                                            candidateData.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) 
                                                            : 'NA'
                                                        }
                                                    </span>
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="fw-bold mb-1">{candidateData.name || "Candidate Name"}</h4>
                                                <p className="text-muted mb-0">{candidateData.email || "email@example.com"}</p>
                                            </div>
                                        </div>
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => setIsEditing(!isEditing)}
                                        >
                                            <i className="bi bi-pencil me-2"></i>
                                            {isEditing ? 'Cancel' : 'Edit'}
                                        </button>
                                    </div>

                                    <form onSubmit={handleSaveProfile}>
                                        <div className="row g-4">
                                            {/* Full Name */}
                                            <div className="col-md-6">
                                                <label className="form-label fw-semibold text-muted">Full Name</label>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    className="form-control form-control-lg bg-light border-0"
                                                    placeholder="Your First Name"
                                                    value={candidateData.name || ""}
                                                    onChange={handleInputChange}
                                                    disabled={!isEditing}
                                                    style={{ backgroundColor: '#f8f9fa !important' }}
                                                />
                                            </div>

                                            {/* Age */}
                                            <div className="col-md-6">
                                                <label className="form-label fw-semibold text-muted">Age</label>
                                                <input
                                                    type="number"
                                                    name="age"
                                                    className="form-control form-control-lg bg-light border-0"
                                                    placeholder="Your Age"
                                                    value={candidateData.age || ""}
                                                    onChange={handleInputChange}
                                                    disabled={!isEditing}
                                                    min="18"
                                                    max="65"
                                                />
                                            </div>

                                            {/* Email (Non-editable) */}
                                            <div className="col-md-6">
                                                <label className="form-label fw-semibold text-muted">Email Address</label>
                                                <input
                                                    type="email"
                                                    className="form-control form-control-lg bg-light border-0"
                                                    value={candidateData.email || ""}
                                                    disabled
                                                    style={{ backgroundColor: '#e9ecef !important' }}
                                                />
                                            </div>

                                            {/* Mobile */}
                                            <div className="col-md-6">
                                                <label className="form-label fw-semibold text-muted">Mobile</label>
                                                <input
                                                    type="text"
                                                    name="mobile"
                                                    className="form-control form-control-lg bg-light border-0"
                                                    placeholder="Your Mobile Number"
                                                    value={candidateData.mobile || ""}
                                                    onChange={handleInputChange}
                                                    disabled={!isEditing}
                                                />
                                            </div>

                                            {/* Qualification */}
                                            <div className="col-md-6">
                                                <label className="form-label fw-semibold text-muted">Qualification</label>
                                                <select
                                                    name="qualification"
                                                    className="form-select form-select-lg bg-light border-0"
                                                    value={candidateData.qualification || ""}
                                                    onChange={handleInputChange}
                                                    disabled={!isEditing}
                                                >
                                                    <option value="">Select Qualification</option>
                                                    <option value="High School">High School</option>
                                                    <option value="Graduate">Graduate</option>
                                                    <option value="Post Graduate">Post Graduate</option>
                                                    <option value="PhD">PhD</option>
                                                    <option value="Diploma">Diploma</option>
                                                    <option value="Certificate">Certificate</option>
                                                </select>
                                            </div>

                                            {/* Location */}
                                            <div className="col-md-6">
                                                <label className="form-label fw-semibold text-muted">Location</label>
                                                <select
                                                    name="location"
                                                    className="form-select form-select-lg bg-light border-0"
                                                    value={candidateData.location || ""}
                                                    onChange={handleInputChange}
                                                    disabled={!isEditing}
                                                >
                                                    <option value="">Select Location</option>
                                                    <option value="Mumbai">Mumbai</option>
                                                    <option value="Delhi">Delhi</option>
                                                    <option value="Bangalore">Bangalore</option>
                                                    <option value="Chennai">Chennai</option>
                                                    <option value="Hyderabad">Hyderabad</option>
                                                    <option value="Pune">Pune</option>
                                                    <option value="Kolkata">Kolkata</option>
                                                    <option value="Ahmedabad">Ahmedabad</option>
                                                </select>
                                            </div>

                                            {/* Occupation Status */}
                                            <div className="col-md-6">
                                                <label className="form-label fw-semibold text-muted">Occupation Status</label>
                                                <select
                                                    name="occupationStatus"
                                                    className="form-select form-select-lg bg-light border-0"
                                                    value={candidateData.occupationStatus || ""}
                                                    onChange={handleInputChange}
                                                    disabled={!isEditing}
                                                >
                                                    <option value="">Select Status</option>
                                                    <option value="Working">Working</option>
                                                    <option value="Looking for Job">Looking for Job</option>
                                                    <option value="Fresher">Fresher</option>
                                                    <option value="Student">Student</option>
                                                    <option value="Freelancer">Freelancer</option>
                                                </select>
                                            </div>

                                            {/* Resume Upload */}
                                            <div className="col-md-6">
                                                <label className="form-label fw-semibold text-muted">Resume</label>
                                                {isEditing ? (
                                                    <input
                                                        type="file"
                                                        name="resume"
                                                        className="form-control form-control-lg bg-light border-0"
                                                        onChange={handleFileChange}
                                                        accept=".pdf,.doc,.docx"
                                                    />
                                                ) : (
                                                    <div className="bg-light p-3 rounded">
                                                        {resumeInfo ? (
                                                            <div className="d-flex align-items-center justify-content-between">
                                                                <div>
                                                                    <span className="badge bg-success mb-1">Uploaded</span>
                                                                    <div className="small text-muted">
                                                                        {formatFileSize(resumeInfo.size)} • {resumeInfo.type?.split('/')[1]}
                                                                    </div>
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm btn-outline-primary"
                                                                    onClick={() => handleDownloadFile(candidateData.resume, 'resume')}
                                                                >
                                                                    <i className="bi bi-download"></i>
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="text-muted text-center py-2">
                                                                <i className="bi bi-file-earmark-text"></i> No resume uploaded
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* ID Proof Upload */}
                                            <div className="col-md-6">
                                                <label className="form-label fw-semibold text-muted">ID Proof</label>
                                                {isEditing ? (
                                                    <input
                                                        type="file"
                                                        name="idProof"
                                                        className="form-control form-control-lg bg-light border-0"
                                                        onChange={handleFileChange}
                                                        accept=".pdf,.jpg,.jpeg,.png"
                                                    />
                                                ) : (
                                                    <div className="bg-light p-3 rounded">
                                                        {idProofInfo ? (
                                                            <div className="d-flex align-items-center justify-content-between">
                                                                <div>
                                                                    <span className="badge bg-success mb-1">Uploaded</span>
                                                                    <div className="small text-muted">
                                                                        {formatFileSize(idProofInfo.size)} • {idProofInfo.type?.split('/')[1]}
                                                                    </div>
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm btn-outline-primary"
                                                                    onClick={() => handleDownloadFile(candidateData.idProof, 'id-proof')}
                                                                >
                                                                    <i className="bi bi-download"></i>
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="text-muted text-center py-2">
                                                                <i className="bi bi-file-earmark-image"></i> No ID proof uploaded
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Save Button */}
                                        {isEditing && (
                                            <div className="row mt-4">
                                                <div className="col-12">
                                                    <button
                                                        type="submit"
                                                        className="btn btn-primary btn-lg px-4"
                                                        disabled={isLoading}
                                                    >
                                                        {isLoading ? (
                                                            <>
                                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                                Updating...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <i className="bi bi-check-circle me-2"></i>
                                                                Save Changes
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </form>
                                </div>
                            </div>
                        </div>

                        {/* My Email Address Section */}
                        <div className="col-lg-4">
                            <div className="card border-0 shadow-sm">
                                <div className="card-body p-4">
                                    <h6 className="fw-bold mb-3">My Email Address</h6>
                                    <div className="d-flex align-items-center p-3 bg-light rounded mb-3">
                                        <div className="me-3">
                                            <div className="rounded-circle bg-primary d-flex align-items-center justify-content-center"
                                                 style={{ width: '40px', height: '40px' }}>
                                                <i className="bi bi-envelope text-white"></i>
                                            </div>
                                        </div>
                                        <div className="flex-grow-1">
                                            <div className="fw-semibold">{candidateData.email || "email@example.com"}</div>
                                            <small className="text-muted">Primary email</small>
                                        </div>
                                    </div>
                                    <button className="btn btn-outline-primary w-100">
                                        <i className="bi bi-plus-circle me-2"></i>
                                        Add Email Address
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CandidateProfile;