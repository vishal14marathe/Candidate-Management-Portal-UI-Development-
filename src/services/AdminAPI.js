// Mock API service for admin dashboard
class AdminAPI {
    // Mock candidate data
    static mockCandidates = [
        { id: 101, name: "John Doe", age: 25, email: "john@example.com", qualification: "Graduate", location: "New Delhi", occupationStatus: "Available", registrationDate: "2023-08-15" },
        { id: 102, name: "Jane Smith", age: 28, email: "jane@example.com", qualification: "Post Graduate", location: "Mumbai", occupationStatus: "Working", registrationDate: "2023-08-10" },
        { id: 103, name: "Robert Johnson", age: 22, email: "robert@example.com", qualification: "Diploma", location: "Bangalore", occupationStatus: "Available", registrationDate: "2023-08-18" },
        { id: 104, name: "Sarah Williams", age: 30, email: "sarah@example.com", qualification: "Doctorate", location: "Chennai", occupationStatus: "Working", registrationDate: "2023-08-05" },
        { id: 105, name: "Michael Brown", age: 26, email: "michael@example.com", qualification: "Graduate", location: "Hyderabad", occupationStatus: "Available", registrationDate: "2023-08-20" },
        { id: 106, name: "Emily Davis", age: 24, email: "emily@example.com", qualification: "Post Graduate", location: "Kolkata", occupationStatus: "Not Looking", registrationDate: "2023-08-12" },
        { id: 107, name: "David Wilson", age: 29, email: "david@example.com", qualification: "High School", location: "Pune", occupationStatus: "Working", registrationDate: "2023-08-08" },
        { id: 108, name: "Lisa Miller", age: 27, email: "lisa@example.com", qualification: "Graduate", location: "Ahmedabad", occupationStatus: "Available", registrationDate: "2023-08-22" },
        { id: 109, name: "James Taylor", age: 31, email: "james@example.com", qualification: "Post Graduate", location: "New Delhi", occupationStatus: "Working", registrationDate: "2023-08-25" },
        { id: 110, name: "Maria Garcia", age: 23, email: "maria@example.com", qualification: "Graduate", location: "Mumbai", occupationStatus: "Available", registrationDate: "2023-08-30" }
    ];

    // Simulate API delay
    static delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Get candidates with pagination and filtering
    static async getCandidates(filters = {}, page = 1, size = 10) {
        await this.delay(500); // Simulate API call

        let filteredCandidates = [...this.mockCandidates];

        // Apply filters
        if (filters.qualification) {
            filteredCandidates = filteredCandidates.filter(candidate =>
                candidate.qualification === filters.qualification
            );
        }
        if (filters.location) {
            filteredCandidates = filteredCandidates.filter(candidate =>
                candidate.location === filters.location
            );
        }
        if (filters.occupationStatus) {
            filteredCandidates = filteredCandidates.filter(candidate =>
                candidate.occupationStatus === filters.occupationStatus
            );
        }
        if (filters.age) {
            filteredCandidates = filteredCandidates.filter(candidate =>
                candidate.age === parseInt(filters.age)
            );
        }
        if (filters.name) {
            filteredCandidates = filteredCandidates.filter(candidate =>
                candidate.name.toLowerCase().includes(filters.name.toLowerCase())
            );
        }

        // Calculate pagination
        const startIndex = (page - 1) * size;
        const endIndex = startIndex + size;
        const paginatedCandidates = filteredCandidates.slice(startIndex, endIndex);

        return {
            content: paginatedCandidates,
            totalElements: filteredCandidates.length,
            totalPages: Math.ceil(filteredCandidates.length / size),
            currentPage: page,
            pageSize: size
        };
    }

    // Get filter options (unique values for dropdowns)
    static async getFilterOptions() {
        await this.delay(200);

        const candidates = this.mockCandidates;
        return {
            qualifications: [...new Set(candidates.map(c => c.qualification))],
            locations: [...new Set(candidates.map(c => c.location))],
            occupationStatuses: [...new Set(candidates.map(c => c.occupationStatus))],
            ages: [...new Set(candidates.map(c => c.age))].sort((a, b) => a - b)
        };
    }
}

export default AdminAPI;