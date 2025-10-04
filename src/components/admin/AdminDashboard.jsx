import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-hot-toast';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        qualification: "",
        location: "",
        occupationStatus: "",
        age: "",
        name: ""
    });
    const [searchInput, setSearchInput] = useState(""); // Separate state for search input
    const [filteredCandidates, setFilteredCandidates] = useState([]); // State for filtered results
    const [allCandidates, setAllCandidates] = useState([]); // State for all candidates
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalElements: 0,
        pageSize: 10
    });
    const [filterOptions, setFilterOptions] = useState({
        qualifications: [],
        locations: [],
        occupationStatuses: [],
        ages: []
    });

    // Improved debounce function
    const useDebounce = (value, delay) => {
        const [debouncedValue, setDebouncedValue] = useState(value);

        useEffect(() => {
            const handler = setTimeout(() => {
                setDebouncedValue(value);
            }, delay);

            return () => {
                clearTimeout(handler);
            };
        }, [value, delay]);

        return debouncedValue;
    };

    const debouncedSearchTerm = useDebounce(searchInput, 300); // Reduced delay for better UX

    // Check admin authentication and load initial data
    useEffect(() => {
        const adminUser = JSON.parse(localStorage.getItem("adminUser"));
        console.log("Admin User from localStorage:", adminUser);

        if (!adminUser || adminUser.role !== "ADMIN") {
            console.log("No valid admin user found, redirecting to login");
            toast.error("Please login as admin first");
            setTimeout(() => navigate("/admin/login"), 1500);
            return;
        }

        console.log("Admin authentication successful!");
        loadInitialData();
    }, [navigate]);

    // Apply filters and search when any filter changes or search term changes
    useEffect(() => {
        applyFiltersAndSearch();
    }, [filters, debouncedSearchTerm, allCandidates]);

    // Load initial data
    const loadInitialData = async () => {
        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 300));
            const candidates = getAllRegisteredCandidates();
            const candidateData = candidates.length > 0 ? candidates : getMockCandidates();
            
            setAllCandidates(candidateData);
            loadFilterOptions(candidateData);
            
        } catch (error) {
            toast.error("Failed to load candidates");
            console.error("Error loading candidates:", error);
        } finally {
            setLoading(false);
        }
    };

    // Apply filters and search
    const applyFiltersAndSearch = () => {
        let filtered = [...allCandidates];

        // Apply search filter
        if (debouncedSearchTerm.trim()) {
            filtered = filtered.filter(candidate =>
                candidate.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
            );
        }

        // Apply other filters
        if (filters.qualification) {
            filtered = filtered.filter(candidate =>
                candidate.qualification === filters.qualification
            );
        }
        if (filters.location) {
            filtered = filtered.filter(candidate =>
                candidate.location === filters.location
            );
        }
        if (filters.occupationStatus) {
            filtered = filtered.filter(candidate =>
                candidate.occupationStatus === filters.occupationStatus
            );
        }
        if (filters.age) {
            filtered = filtered.filter(candidate =>
                candidate.age === parseInt(filters.age)
            );
        }

        setFilteredCandidates(filtered);
        
        // Update pagination
        const totalPages = Math.ceil(filtered.length / pagination.pageSize);
        setPagination(prev => ({
            ...prev,
            totalPages,
            totalElements: filtered.length,
            currentPage: 1 // Reset to first page when filters change
        }));

        // Set candidates for current page
        const startIndex = 0; // Always start from first page when filters change
        const endIndex = pagination.pageSize;
        const paginatedCandidates = filtered.slice(startIndex, endIndex);
        setCandidates(paginatedCandidates);
    };

    // Handle pagination separately
    useEffect(() => {
        if (filteredCandidates.length > 0) {
            const startIndex = (pagination.currentPage - 1) * pagination.pageSize;
            const endIndex = startIndex + pagination.pageSize;
            const paginatedCandidates = filteredCandidates.slice(startIndex, endIndex);
            setCandidates(paginatedCandidates);
        }
    }, [pagination.currentPage, filteredCandidates, pagination.pageSize]);

    // Function to get all registered candidates from sessionStorage
    const getAllRegisteredCandidates = () => {
        try {
            // Get the main registered user
            const registeredUser = JSON.parse(sessionStorage.getItem("registeredUser"));

            // You can also check for multiple candidates if stored in different keys
            // For example, if you store multiple candidates in an array
            const additionalCandidates = JSON.parse(sessionStorage.getItem("candidates") || "[]");

            const candidatesList = [];

            // Add main registered user if exists
            if (registeredUser) {
                candidatesList.push({
                    id: registeredUser.id || Date.now(),
                    name: registeredUser.name || "N/A",
                    age: registeredUser.age || "N/A",
                    email: registeredUser.email || "N/A",
                    mobile: registeredUser.mobile || "N/A",
                    qualification: registeredUser.qualification || "N/A",
                    location: registeredUser.location || "N/A",
                    occupationStatus: registeredUser.occupationStatus || "Not Available",
                    registrationDate: registeredUser.createdAt || new Date().toISOString().split('T')[0],
                    resume: registeredUser.resume ? "Uploaded" : "Not Uploaded",
                    idProof: registeredUser.idProof ? "Uploaded" : "Not Uploaded"
                });
            }

            // Add additional candidates if any
            if (Array.isArray(additionalCandidates)) {
                additionalCandidates.forEach(candidate => {
                    candidatesList.push({
                        id: candidate.id || Date.now() + Math.random(),
                        name: candidate.name || "N/A",
                        age: candidate.age || "N/A",
                        email: candidate.email || "N/A",
                        mobile: candidate.mobile || "N/A",
                        qualification: candidate.qualification || "N/A",
                        location: candidate.location || "N/A",
                        occupationStatus: candidate.occupationStatus || "Not Available",
                        registrationDate: candidate.createdAt || new Date().toISOString().split('T')[0],
                        resume: candidate.resume ? "Uploaded" : "Not Uploaded",
                        idProof: candidate.idProof ? "Uploaded" : "Not Uploaded"
                    });
                });
            }

            console.log("Found candidates:", candidatesList);
            return candidatesList;

        } catch (error) {
            console.error("Error fetching candidates from sessionStorage:", error);
            return [];
        }
    };

    // Mock candidate data as fallback
    const getMockCandidates = () => {
        return [
            { id: 101, name: "John Doe", age: 25, email: "john@example.com", mobile: "9876543210", qualification: "Graduate", location: "New Delhi", occupationStatus: "Available", registrationDate: "2023-08-15", resume: "Uploaded", idProof: "Uploaded" },
            { id: 102, name: "Jane Smith", age: 28, email: "jane@example.com", mobile: "9876543211", qualification: "Post Graduate", location: "Mumbai", occupationStatus: "Working", registrationDate: "2023-08-10", resume: "Uploaded", idProof: "Uploaded" },
            { id: 103, name: "Robert Johnson", age: 22, email: "robert@example.com", mobile: "9876543212", qualification: "Diploma", location: "Bangalore", occupationStatus: "Available", registrationDate: "2023-08-18", resume: "Not Uploaded", idProof: "Uploaded" },
            { id: 104, name: "Sarah Williams", age: 30, email: "sarah@example.com", mobile: "9876543213", qualification: "Doctorate", location: "Chennai", occupationStatus: "Working", registrationDate: "2023-08-05", resume: "Uploaded", idProof: "Not Uploaded" },
            { id: 105, name: "Michael Brown", age: 26, email: "michael@example.com", mobile: "9876543214", qualification: "Graduate", location: "Hyderabad", occupationStatus: "Available", registrationDate: "2023-08-20", resume: "Uploaded", idProof: "Uploaded" }
        ];
    };

    const loadFilterOptions = (candidateData) => {
        try {
            const candidates = candidateData || allCandidates;
            
            setFilterOptions({
                qualifications: [...new Set(candidates.map(c => c.qualification).filter(q => q && q !== "N/A"))],
                locations: [...new Set(candidates.map(c => c.location).filter(l => l && l !== "N/A"))],
                occupationStatuses: [...new Set(candidates.map(c => c.occupationStatus).filter(s => s && s !== "N/A"))],
                ages: [...new Set(candidates.map(c => c.age).filter(a => a && a !== "N/A"))].sort((a, b) => a - b)
            });
        } catch (error) {
            console.error("Error loading filter options:", error);
        }
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchInput(value); // Update search input immediately for UI responsiveness
        // The actual filtering will be applied after debounce delay
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const clearFilters = () => {
        setFilters({
            qualification: "",
            location: "",
            occupationStatus: "",
            age: ""
        });
        setSearchInput(""); // Clear the search input
        toast.success("Filters cleared");
    };

    const handlePageChange = (newPage) => {
        setPagination(prev => ({ ...prev, currentPage: newPage }));
    };

    const handleLogout = () => {
        localStorage.removeItem("adminUser");
        toast.success("Logged out successfully");
        setTimeout(() => navigate("/admin/login"), 1000);
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            "Available": "bg-success",
            "Working": "bg-primary",
            "Not Available": "bg-warning",
            "Not Looking": "bg-secondary"
        };
        return statusConfig[status] || "bg-secondary";
    };

    const getDocumentBadge = (status) => {
        return status === "Uploaded" ? "bg-success" : "bg-warning";
    };

    // Generate pagination buttons
    const renderPagination = () => {
        const pages = [];
        const maxVisiblePages = 5;
        const startPage = Math.max(1, pagination.currentPage - Math.floor(maxVisiblePages / 2));
        const endPage = Math.min(pagination.totalPages, startPage + maxVisiblePages - 1);

        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <li key={i} className={`page-item ${pagination.currentPage === i ? 'active' : ''}`}>
                    <button
                        className="page-link"
                        onClick={() => handlePageChange(i)}
                        disabled={loading}
                    >
                        {i}
                    </button>
                </li>
            );
        }

        return pages;
    };

    const handleRefresh = () => {
        const loadingToast = toast.loading("Refreshing candidates...");
        loadCandidates().finally(() => {
            toast.dismiss(loadingToast);
            toast.success("Candidates refreshed successfully");
        });
    };

    // Function to export candidates data
    const exportCandidates = () => {
        const allCandidates = getAllRegisteredCandidates().length > 0 ?
            getAllRegisteredCandidates() : getMockCandidates();

        const csvContent = "data:text/csv;charset=utf-8,"
            + "ID,Name,Age,Email,Mobile,Qualification,Location,Status,Registration Date,Resume,ID Proof\n"
            + allCandidates.map(candidate =>
                `"${candidate.id}","${candidate.name}","${candidate.age}","${candidate.email}","${candidate.mobile}","${candidate.qualification}","${candidate.location}","${candidate.occupationStatus}","${candidate.registrationDate}","${candidate.resume}","${candidate.idProof}"`
            ).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "candidates_data.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success("Candidates data exported successfully");
    };

    return (
        <div className="container-fluid py-4">
            {/* Header */}
            <div className="row mb-4">
                <div className="col">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h1 className="h3 fw-bold text-primary">
                                <i className="bi bi-people-fill me-2"></i>
                                Admin Dashboard
                            </h1>
                            <p className="text-muted mb-0">
                                Manage registered candidate profiles
                            </p>
                        </div>
                        <div>
                            <button
                                className="btn btn-success me-2"
                                onClick={exportCandidates}
                                disabled={loading}
                            >
                                <i className="bi bi-download me-1"></i>
                                Export Data
                            </button>
                            <button
                                className="btn btn-outline-danger"
                                onClick={handleLogout}
                                disabled={loading}
                            >
                                <i className="bi bi-box-arrow-right me-2"></i>
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="row mb-4">
                <div className="col-xl-3 col-md-6 mb-3">
                    <div className="card bg-primary text-white">
                        <div className="card-body">
                            <div className="d-flex justify-content-between">
                                <div>
                                    <h6 className="card-title">Total Candidates</h6>
                                    <h3 className="mb-0">{pagination.totalElements}</h3>
                                </div>
                                <div className="align-self-center">
                                    <i className="bi bi-people-fill fs-1"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-xl-3 col-md-6 mb-3">
                    <div className="card bg-success text-white">
                        <div className="card-body">
                            <div className="d-flex justify-content-between">
                                <div>
                                    <h6 className="card-title">Available</h6>
                                    <h3 className="mb-0">
                                        {candidates.filter(c => c.occupationStatus === "Available").length}
                                    </h3>
                                </div>
                                <div className="align-self-center">
                                    <i className="bi bi-person-check fs-1"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-xl-3 col-md-6 mb-3">
                    <div className="card bg-info text-white">
                        <div className="card-body">
                            <div className="d-flex justify-content-between">
                                <div>
                                    <h6 className="card-title">Working</h6>
                                    <h3 className="mb-0">
                                        {candidates.filter(c => c.occupationStatus === "Working").length}
                                    </h3>
                                </div>
                                <div className="align-self-center">
                                    <i className="bi bi-briefcase fs-1"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-xl-3 col-md-6 mb-3">
                    <div className="card bg-warning text-dark">
                        <div className="card-body">
                            <div className="d-flex justify-content-between">
                                <div>
                                    <h6 className="card-title">Documents Ready</h6>
                                    <h3 className="mb-0">
                                        {candidates.filter(c => c.resume === "Uploaded" && c.idProof === "Uploaded").length}
                                    </h3>
                                </div>
                                <div className="align-self-center">
                                    <i className="bi bi-file-check fs-1"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters Card */}
            <div className="card shadow mb-4">
                <div className="card-header bg-light">
                    <h5 className="card-title mb-0">
                        <i className="bi bi-funnel me-2"></i>
                        Filters
                    </h5>
                </div>
                <div className="card-body">
                    <div className="row g-3">
                        {/* Name Search with Debounce */}
                        <div className="col-md-3">
                            <label className="form-label fw-semibold">Search by Name</label>
                            <input
                                type="text"
                                name="name"
                                className="form-control"
                                placeholder="Enter candidate name..."
                                value={searchInput}
                                onChange={handleSearchChange}
                                disabled={loading}
                            />
                        </div>

                        {/* Qualification Filter */}
                        <div className="col-md-2">
                            <label className="form-label fw-semibold">Qualification</label>
                            <select
                                name="qualification"
                                className="form-select"
                                value={filters.qualification}
                                onChange={handleFilterChange}
                                disabled={loading}
                            >
                                <option value="">All Qualifications</option>
                                {filterOptions.qualifications.map(qual => (
                                    <option key={qual} value={qual}>{qual}</option>
                                ))}
                            </select>
                        </div>

                        {/* Location Filter */}
                        <div className="col-md-2">
                            <label className="form-label fw-semibold">Location</label>
                            <select
                                name="location"
                                className="form-select"
                                value={filters.location}
                                onChange={handleFilterChange}
                                disabled={loading}
                            >
                                <option value="">All Locations</option>
                                {filterOptions.locations.map(location => (
                                    <option key={location} value={location}>{location}</option>
                                ))}
                            </select>
                        </div>

                        {/* Status Filter */}
                        <div className="col-md-2">
                            <label className="form-label fw-semibold">Status</label>
                            <select
                                name="occupationStatus"
                                className="form-select"
                                value={filters.occupationStatus}
                                onChange={handleFilterChange}
                                disabled={loading}
                            >
                                <option value="">All Status</option>
                                {filterOptions.occupationStatuses.map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                        </div>

                        {/* Age Filter */}
                        <div className="col-md-2">
                            <label className="form-label fw-semibold">Age</label>
                            <select
                                name="age"
                                className="form-select"
                                value={filters.age}
                                onChange={handleFilterChange}
                                disabled={loading}
                            >
                                <option value="">All Ages</option>
                                {filterOptions.ages.map(age => (
                                    <option key={age} value={age}>{age}</option>
                                ))}
                            </select>
                        </div>

                        {/* Clear Filters Button */}
                        <div className="col-md-1 d-flex align-items-end">
                            <button
                                className="btn btn-outline-secondary w-100"
                                onClick={clearFilters}
                                disabled={loading}
                                title="Clear all filters"
                            >
                                <i className="bi bi-arrow-clockwise"></i>
                                <span className="d-none d-lg-inline ms-1">Clear</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Candidates Table */}
            <div className="card shadow">
                <div className="card-header bg-light d-flex justify-content-between align-items-center">
                    <h5 className="card-title mb-0">
                        <i className="bi bi-list-ul me-2"></i>
                        Registered Candidates
                        {pagination.totalElements > 0 && (
                            <span className="badge bg-primary ms-2">{pagination.totalElements}</span>
                        )}
                    </h5>
                    <div>
                        {loading && (
                            <span className="text-muted me-3">
                                <i className="bi bi-hourglass-split me-1"></i>
                                Loading...
                            </span>
                        )}
                        <button
                            className="btn btn-primary btn-sm"
                            onClick={handleRefresh}
                            disabled={loading}
                        >
                            <i className="bi bi-arrow-clockwise me-1"></i>
                            Refresh
                        </button>
                    </div>
                </div>
                <div className="card-body p-0">
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="mt-2 text-muted">Loading candidates...</p>
                        </div>
                    ) : candidates.length > 0 ? (
                        <>
                            <div className="table-responsive">
                                <table className="table table-hover mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th>ID</th>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Mobile</th>
                                            <th>Age</th>
                                            <th>Qualification</th>
                                            <th>Location</th>
                                            <th>Status</th>
                                            <th>Resume</th>
                                            <th>ID Proof</th>
                                            <th>Registration Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {candidates.map(candidate => (
                                            <tr key={candidate.id}>
                                                <td className="fw-semibold">#{candidate.id}</td>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <i className="bi bi-person-circle text-muted me-2"></i>
                                                        {candidate.name}
                                                    </div>
                                                </td>
                                                <td>{candidate.email}</td>
                                                <td>{candidate.mobile}</td>
                                                <td>{candidate.age}</td>
                                                <td>{candidate.qualification}</td>
                                                <td>
                                                    <span className="badge bg-light text-dark">
                                                        <i className="bi bi-geo-alt me-1"></i>
                                                        {candidate.location}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`badge ${getStatusBadge(candidate.occupationStatus)}`}>
                                                        {candidate.occupationStatus}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`badge ${getDocumentBadge(candidate.resume)}`}>
                                                        {candidate.resume}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`badge ${getDocumentBadge(candidate.idProof)}`}>
                                                        {candidate.idProof}
                                                    </span>
                                                </td>
                                                <td>{candidate.registrationDate}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {pagination.totalPages > 1 && (
                                <div className="card-footer">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <small className="text-muted">
                                                Showing {((pagination.currentPage - 1) * pagination.pageSize) + 1} to{" "}
                                                {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalElements)} of{" "}
                                                {pagination.totalElements} candidates
                                            </small>
                                        </div>
                                        <nav>
                                            <ul className="pagination mb-0">
                                                <li className={`page-item ${pagination.currentPage === 1 ? 'disabled' : ''}`}>
                                                    <button
                                                        className="page-link"
                                                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                                                        disabled={pagination.currentPage === 1 || loading}
                                                    >
                                                        Previous
                                                    </button>
                                                </li>
                                                {renderPagination()}
                                                <li className={`page-item ${pagination.currentPage === pagination.totalPages ? 'disabled' : ''}`}>
                                                    <button
                                                        className="page-link"
                                                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                                                        disabled={pagination.currentPage === pagination.totalPages || loading}
                                                    >
                                                        Next
                                                    </button>
                                                </li>
                                            </ul>
                                        </nav>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-5">
                            <i className="bi bi-search display-4 text-muted"></i>
                            <h5 className="mt-3">No candidates found</h5>
                            <p className="text-muted">
                                {Object.values(filters).some(f => f) || searchInput
                                    ? "Try adjusting your filters"
                                    : "No registered candidates available"
                                }
                            </p>
                            {(Object.values(filters).some(f => f) || searchInput) && (
                                <button
                                    className="btn btn-primary mt-2"
                                    onClick={clearFilters}
                                >
                                    Clear Filters
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;