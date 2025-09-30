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
        <div className="min-vh-100" style={{ backgroundColor: '#f8f9fa' }}>
            <style jsx>{`
                .info-card {
                    background: white;
                    border-radius: 12px;
                    padding: 1.5rem;
                    border: 1px solid #e9ecef;
                    transition: all 0.3s ease;
                }
                
                .info-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                    border-color: #dee2e6;
                }
                
                .update-card {
                    background: white;
                    border-radius: 15px;
                    padding: 1.5rem;
                    border: 2px solid #e9ecef;
                    transition: all 0.3s ease;
                }
                
                .update-card:hover {
                    border-color: #667eea;
                    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.1);
                }
                
                .completion-card {
                    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                    border-radius: 15px;
                    padding: 2rem;
                    border: 1px solid #dee2e6;
                }
                
                .completion-item {
                    padding: 1rem;
                    border-radius: 10px;
                    background: white;
                    transition: all 0.3s ease;
                }
                
                .completion-item:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 6px 20px rgba(0,0,0,0.1);
                }
                
                .icon-wrapper {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: rgba(102, 126, 234, 0.1);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.2rem;
                }
                
                .status-display .badge {
                    font-size: 0.9rem;
                    padding: 0.5rem 1rem;
                    border-radius: 20px;
                }
                
                .btn:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 8px rgba(0,0,0,0.15);
                }
            `}</style>
            <div className="container py-5">
                {/* Header */}
                <div className="row mb-4">
                    <div className="col-12">
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <h2 className="text-dark fw-bold mb-1">Candidate Profile</h2>
                                <p className="text-muted mb-0">Manage your profile information</p>
                            </div>
                            <button
                                className="btn btn-outline-danger"
                                onClick={handleLogout}
                            >
                                <i className="bi bi-box-arrow-right me-2"></i>
                                Logout
                            </button>
                        </div>
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

                {/* Main Profile Card */}
                <div className="row justify-content-center">
                    <div className="col-lg-8">
                        <div className="card shadow-lg border-0" style={{ borderRadius: '20px' }}>
                            <div className="card-body p-0">
                                {/* Header Section with Avatar */}
                                <div className="bg-gradient text-white text-center p-4" style={{ 
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                                    borderRadius: '20px 20px 0 0' 
                                }}>
                                    <div className="position-relative d-inline-block mb-3">
                                        <div className="bg-white rounded-circle d-flex align-items-center justify-content-center mx-auto shadow" 
                                             style={{ width: '100px', height: '100px' }}>
                                            <span className="text-primary fw-bold" style={{ fontSize: '2.5rem' }}>
                                                {candidateData.name ? 
                                                    candidateData.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) 
                                                    : 'NA'
                                                }
                                            </span>
                                        </div>
                                        <div className="position-absolute bottom-0 end-0 bg-success rounded-circle" 
                                             style={{ width: '25px', height: '25px' }}>
                                            <i className="bi bi-check text-white" style={{ fontSize: '0.8rem', marginLeft: '6px', marginTop: '3px' }}></i>
                                        </div>
                                    </div>
                                    <h3 className="fw-bold mb-1">{candidateData.name || "Not Set"}</h3>
                                    <p className="mb-0 opacity-75">{candidateData.email || "No email"}</p>
                                </div>

                                {/* Profile Content */}
                                <div className="p-5">
                                    {/* Personal Information Grid */}
                                    <div className="row g-4 mb-5">
                                        <div className="col-md-6">
                                            <div className="info-card h-100">
                                                <div className="d-flex align-items-center mb-2">
                                                    <div className="icon-wrapper me-3">
                                                        <i className="bi bi-person text-primary"></i>
                                                    </div>
                                                    <div>
                                                        <small className="text-muted">Full Name</small>
                                                        <div className="fw-semibold">{candidateData.name || "Not Available"}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="col-md-6">
                                            <div className="info-card h-100">
                                                <div className="d-flex align-items-center mb-2">
                                                    <div className="icon-wrapper me-3">
                                                        <i className="bi bi-calendar text-primary"></i>
                                                    </div>
                                                    <div>
                                                        <small className="text-muted">Age</small>
                                                        <div className="fw-semibold">{candidateData.age || "Not Available"}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="col-md-6">
                                            <div className="info-card h-100">
                                                <div className="d-flex align-items-center mb-2">
                                                    <div className="icon-wrapper me-3">
                                                        <i className="bi bi-envelope text-primary"></i>
                                                    </div>
                                                    <div>
                                                        <small className="text-muted">Email Address</small>
                                                        <div className="fw-semibold">{candidateData.email || "Not Available"}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="col-md-6">
                                            <div className="info-card h-100">
                                                <div className="d-flex align-items-center mb-2">
                                                    <div className="icon-wrapper me-3">
                                                        <i className="bi bi-phone text-primary"></i>
                                                    </div>
                                                    <div>
                                                        <small className="text-muted">Mobile Number</small>
                                                        <div className="fw-semibold">{candidateData.mobile || "Not Available"}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="col-md-6">
                                            <div className="info-card h-100">
                                                <div className="d-flex align-items-center mb-2">
                                                    <div className="icon-wrapper me-3">
                                                        <i className="bi bi-mortarboard text-primary"></i>
                                                    </div>
                                                    <div>
                                                        <small className="text-muted">Qualification</small>
                                                        <div className="fw-semibold">{candidateData.qualification || "Not Available"}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="col-md-6">
                                            <div className="info-card h-100">
                                                <div className="d-flex align-items-center mb-2">
                                                    <div className="icon-wrapper me-3">
                                                        <i className="bi bi-geo-alt text-primary"></i>
                                                    </div>
                                                    <div>
                                                        <small className="text-muted">Location</small>
                                                        <div className="fw-semibold">{candidateData.location || "Not Available"}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Work Status & Documents Section */}
                                    <div className="row g-4">
                                        {/* Work Status */}
                                        <div className="col-12">
                                            <div className="update-card">
                                                <div className="d-flex align-items-center justify-content-between mb-3">
                                                    <div className="d-flex align-items-center">
                                                        <div className="icon-wrapper me-3">
                                                            <i className="bi bi-briefcase text-success"></i>
                                                        </div>
                                                        <div>
                                                            <h6 className="mb-0 fw-bold">Work Status</h6>
                                                            <small className="text-muted">Your current availability</small>
                                                        </div>
                                                    </div>
                                                    {!isEditing && (
                                                        <button
                                                            className="btn btn-outline-primary btn-sm"
                                                            onClick={() => setIsEditing(true)}
                                                        >
                                                            <i className="bi bi-pencil me-1"></i>
                                                            Update
                                                        </button>
                                                    )}
                                                </div>
                                                
                                                {isEditing ? (
                                                    <div className="d-flex gap-2 align-items-center">
                                                        <select
                                                            name="occupationStatus"
                                                            className="form-select"
                                                            value={candidateData.occupationStatus || ""}
                                                            onChange={handleInputChange}
                                                        >
                                                            <option value="">Select Work Status</option>
                                                            <option value="Available">Available for Work</option>
                                                            <option value="Not Available">Not Available</option>
                                                            <option value="Currently Employed">Currently Employed</option>
                                                            <option value="Freelancing">Freelancing</option>
                                                        </select>
                                                        <button
                                                            className="btn btn-success btn-sm"
                                                            onClick={handleSaveProfile}
                                                            disabled={isLoading}
                                                        >
                                                            {isLoading ? (
                                                                <span className="spinner-border spinner-border-sm"></span>
                                                            ) : (
                                                                <i className="bi bi-check"></i>
                                                            )}
                                                        </button>
                                                        <button
                                                            className="btn btn-secondary btn-sm"
                                                            onClick={() => setIsEditing(false)}
                                                            disabled={isLoading}
                                                        >
                                                            <i className="bi bi-x"></i>
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="status-display">
                                                        <span className={`badge ${candidateData.occupationStatus === 'Available' ? 'bg-success' : 
                                                                       candidateData.occupationStatus === 'Currently Employed' ? 'bg-info' :
                                                                       candidateData.occupationStatus === 'Freelancing' ? 'bg-warning' : 'bg-secondary'}`}>
                                                            {candidateData.occupationStatus || "Status not set"}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Documents Section */}
                                        <div className="col-md-6">
                                            <div className="update-card h-100">
                                                <div className="d-flex align-items-center justify-content-between mb-3">
                                                    <div className="d-flex align-items-center">
                                                        <div className="icon-wrapper me-3">
                                                            <i className="bi bi-file-earmark-text text-info"></i>
                                                        </div>
                                                        <div>
                                                            <h6 className="mb-0 fw-bold">Resume</h6>
                                                            <small className="text-muted">Upload your CV</small>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                {isEditing ? (
                                                    <div>
                                                        <input
                                                            type="file"
                                                            name="resume"
                                                            className="form-control"
                                                            onChange={handleFileChange}
                                                            accept=".pdf,.doc,.docx"
                                                        />
                                                        <small className="text-muted">PDF, DOC, DOCX (Max 5MB)</small>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        {resumeInfo ? (
                                                            <div className="d-flex align-items-center justify-content-between">
                                                                <div>
                                                                    <span className="badge bg-success mb-1">
                                                                        <i className="bi bi-check-circle me-1"></i>
                                                                        Uploaded
                                                                    </span>
                                                                    <div>
                                                                        <small className="text-muted">
                                                                            {formatFileSize(resumeInfo.size)} • {resumeInfo.type?.split('/')[1] || 'file'}
                                                                        </small>
                                                                    </div>
                                                                </div>
                                                                <button
                                                                    className="btn btn-outline-primary btn-sm"
                                                                    onClick={() => handleDownloadFile(candidateData.resume, 'resume')}
                                                                >
                                                                    <i className="bi bi-download"></i>
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="text-center py-3">
                                                                <i className="bi bi-cloud-upload text-muted" style={{ fontSize: '2rem' }}></i>
                                                                <div className="text-muted mt-2">No resume uploaded</div>
                                                                <button
                                                                    className="btn btn-outline-primary btn-sm mt-2"
                                                                    onClick={() => setIsEditing(true)}
                                                                >
                                                                    Upload Resume
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="col-md-6">
                                            <div className="update-card h-100">
                                                <div className="d-flex align-items-center justify-content-between mb-3">
                                                    <div className="d-flex align-items-center">
                                                        <div className="icon-wrapper me-3">
                                                            <i className="bi bi-file-earmark-image text-warning"></i>
                                                        </div>
                                                        <div>
                                                            <h6 className="mb-0 fw-bold">ID Proof</h6>
                                                            <small className="text-muted">Identity verification</small>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                {isEditing ? (
                                                    <div>
                                                        <input
                                                            type="file"
                                                            name="idProof"
                                                            className="form-control"
                                                            onChange={handleFileChange}
                                                            accept=".pdf,.jpg,.jpeg,.png"
                                                        />
                                                        <small className="text-muted">PDF, JPG, PNG (Max 5MB)</small>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        {idProofInfo ? (
                                                            <div className="d-flex align-items-center justify-content-between">
                                                                <div>
                                                                    <span className="badge bg-success mb-1">
                                                                        <i className="bi bi-check-circle me-1"></i>
                                                                        Uploaded
                                                                    </span>
                                                                    <div>
                                                                        <small className="text-muted">
                                                                            {formatFileSize(idProofInfo.size)} • {idProofInfo.type?.split('/')[1] || 'file'}
                                                                        </small>
                                                                    </div>
                                                                </div>
                                                                <button
                                                                    className="btn btn-outline-primary btn-sm"
                                                                    onClick={() => handleDownloadFile(candidateData.idProof, 'id-proof')}
                                                                >
                                                                    <i className="bi bi-download"></i>
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="text-center py-3">
                                                                <i className="bi bi-cloud-upload text-muted" style={{ fontSize: '2rem' }}></i>
                                                                <div className="text-muted mt-2">No ID proof uploaded</div>
                                                                <button
                                                                    className="btn btn-outline-primary btn-sm mt-2"
                                                                    onClick={() => setIsEditing(true)}
                                                                >
                                                                    Upload ID Proof
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Profile Completion Stats */}
                                    <div className="row mt-5">
                                        <div className="col-12">
                                            <div className="completion-card">
                                                <h6 className="fw-bold mb-3 text-center">Profile Completion</h6>
                                                <div className="row text-center g-3">
                                                    <div className="col-4">
                                                        <div className="completion-item">
                                                            <i className="bi bi-person-check text-success" style={{ fontSize: '2rem' }}></i>
                                                            <div className="mt-2">
                                                                <strong>Personal Info</strong>
                                                                <div className="text-success small">Complete</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-4">
                                                        <div className="completion-item">
                                                            <i className={`bi bi-file-earmark-text ${resumeInfo ? 'text-success' : 'text-muted'}`} 
                                                               style={{ fontSize: '2rem' }}></i>
                                                            <div className="mt-2">
                                                                <strong>Resume</strong>
                                                                <div className={`small ${resumeInfo ? 'text-success' : 'text-muted'}`}>
                                                                    {resumeInfo ? 'Uploaded' : 'Pending'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-4">
                                                        <div className="completion-item">
                                                            <i className={`bi bi-file-earmark-image ${idProofInfo ? 'text-success' : 'text-muted'}`} 
                                                               style={{ fontSize: '2rem' }}></i>
                                                            <div className="mt-2">
                                                                <strong>ID Proof</strong>
                                                                <div className={`small ${idProofInfo ? 'text-success' : 'text-muted'}`}>
                                                                    {idProofInfo ? 'Uploaded' : 'Pending'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
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