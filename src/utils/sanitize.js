import DOMPurify from 'dompurify';

/**
 * Comprehensive form sanitization utility for React applications
 */
export const FormSanitizer = {
    /**
     * Sanitize string input - removes HTML tags and escapes special characters
     * @param {string} input - The input string to sanitize
     * @param {Object} options - Sanitization options
     * @returns {string} - Sanitized string
     */
    sanitizeString: (input, options = {}) => {
        if (!input || typeof input !== 'string') return '';

        const {
            allowHtml = false,
            maxLength = 255,
            trim = true,
            caseTransform = null // 'lowercase', 'uppercase', or null
        } = options;

        let processedInput = input;

        // Trim whitespace
        if (trim) {
            processedInput = processedInput.trim();
        }

        // Apply case transformation
        if (caseTransform === 'lowercase') {
            processedInput = processedInput.toLowerCase();
        } else if (caseTransform === 'uppercase') {
            processedInput = processedInput.toUpperCase();
        }

        // Enforce maximum length
        if (processedInput.length > maxLength) {
            processedInput = processedInput.substring(0, maxLength);
        }

        // Sanitize HTML content
        if (allowHtml) {
            // Only allow safe HTML if explicitly permitted
            processedInput = DOMPurify.sanitize(processedInput, {
                ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
                ALLOWED_ATTR: []
            });
        } else {
            // Completely strip HTML tags and escape special characters
            processedInput = DOMPurify.sanitize(processedInput, {
                ALLOWED_TAGS: [],
                ALLOWED_ATTR: []
            });
        }

        return processedInput;
    },

    /**
     * Sanitize email address
     * @param {string} email - Email input
     * @returns {string} - Sanitized email
     */
    sanitizeEmail: (email) => {
        if (!email) return '';

        let sanitized = email.trim().toLowerCase();

        // Remove any HTML tags and special characters that shouldn't be in email
        sanitized = DOMPurify.sanitize(sanitized, {
            ALLOWED_TAGS: [],
            ALLOWED_ATTR: []
        });

        // Remove spaces and limit length
        sanitized = sanitized.replace(/\s+/g, '');

        if (sanitized.length > 254) {
            sanitized = sanitized.substring(0, 254);
        }

        return sanitized;
    },

    /**
     * Sanitize phone number - keeps only digits
     * @param {string} phone - Phone number input
     * @returns {string} - Sanitized phone number (digits only)
     */
    sanitizePhone: (phone) => {
        if (!phone) return '';

        // Remove all non-digit characters
        const digitsOnly = phone.replace(/\D/g, '');

        // Limit to reasonable length
        return digitsOnly.substring(0, 15);
    },

    /**
     * Sanitize number input
     * @param {string|number} number - Number input
     * @param {Object} options - Options for number sanitization
     * @returns {string} - Sanitized number as string
     */
    sanitizeNumber: (number, options = {}) => {
        if (number === null || number === undefined || number === '') return '';

        const {
            min = -Infinity,
            max = Infinity,
            integerOnly = false
        } = options;

        let processed = number.toString().trim();

        // Remove any non-digit characters (allow decimal point for floats)
        if (integerOnly) {
            processed = processed.replace(/\D/g, '');
        } else {
            processed = processed.replace(/[^\d.]/g, '');
            // Ensure only one decimal point
            const parts = processed.split('.');
            if (parts.length > 2) {
                processed = parts[0] + '.' + parts.slice(1).join('');
            }
        }

        // Convert to number for range checking
        const numValue = integerOnly ? parseInt(processed) : parseFloat(processed);

        // Check if it's a valid number
        if (isNaN(numValue)) return '';

        // Enforce min/max bounds
        let finalValue = numValue;
        if (numValue < min) finalValue = min;
        if (numValue > max) finalValue = max;

        return finalValue.toString();
    },

    /**
     * Sanitize file name
     * @param {string} filename - Original file name
     * @returns {string} - Sanitized file name
     */
    sanitizeFilename: (filename) => {
        if (!filename) return '';

        // Remove path traversal attempts and special characters
        let sanitized = filename
            .replace(/\.\.\/|\.\.\\/g, '') // Remove path traversal
            .replace(/[^a-zA-Z0-9.\-_]/g, '_') // Replace special chars with underscore
            .trim();

        // Limit length
        if (sanitized.length > 255) {
            const ext = sanitized.split('.').pop();
            const nameWithoutExt = sanitized.substring(0, sanitized.lastIndexOf('.'));
            sanitized = nameWithoutExt.substring(0, 255 - ext.length - 1) + '.' + ext;
        }

        return sanitized;
    },

    /**
     * Sanitize password - basic cleaning without altering strength
     * @param {string} password - Password input
     * @returns {string} - Sanitized password
     */
    sanitizePassword: (password) => {
        if (!password) return '';

        // Remove leading/trailing whitespace but preserve internal spaces if allowed
        let sanitized = password.trim();

        // Remove control characters and excessive whitespace
        sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');
        sanitized = sanitized.replace(/\s+/g, ' ');

        // Limit reasonable password length
        if (sanitized.length > 128) {
            sanitized = sanitized.substring(0, 128);
        }

        return sanitized;
    },

    /**
     * Comprehensive form data sanitizer
     * @param {Object} formData - Raw form data object
     * @returns {Object} - Sanitized form data
     */
    sanitizeFormData: (formData) => {
        if (!formData || typeof formData !== 'object') return {};

        const sanitized = { ...formData };

        // Sanitize each field based on its expected type
        if (sanitized.name) {
            sanitized.name = FormSanitizer.sanitizeString(sanitized.name, {
                maxLength: 100,
                trim: true
            });
        }

        if (sanitized.age) {
            sanitized.age = FormSanitizer.sanitizeNumber(sanitized.age, {
                min: 1,
                max: 120,
                integerOnly: true
            });
        }

        if (sanitized.email) {
            sanitized.email = FormSanitizer.sanitizeEmail(sanitized.email);
        }

        if (sanitized.password) {
            sanitized.password = FormSanitizer.sanitizePassword(sanitized.password);
        }

        if (sanitized.mobile) {
            sanitized.mobile = FormSanitizer.sanitizePhone(sanitized.mobile);
        }

        if (sanitized.qualification) {
            sanitized.qualification = FormSanitizer.sanitizeString(sanitized.qualification, {
                maxLength: 50,
                trim: true
            });
        }

        if (sanitized.location) {
            sanitized.location = FormSanitizer.sanitizeString(sanitized.location, {
                maxLength: 100,
                trim: true
            });
        }

        if (sanitized.occupationStatus) {
            sanitized.occupationStatus = FormSanitizer.sanitizeString(sanitized.occupationStatus, {
                maxLength: 50,
                trim: true
            });
        }

        // File fields - we don't sanitize the base64 content, but we could validate file types
        // Note: File content sanitization would happen during upload processing

        return sanitized;
    },

    /**
     * Validate if a string contains potentially dangerous content
     * @param {string} input - String to check
     * @returns {boolean} - true if potentially dangerous
     */
    hasDangerousContent: (input) => {
        if (!input) return false;

        const dangerousPatterns = [
            /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, // Script tags
            /javascript:/gi, // JavaScript protocol
            /on\w+\s*=/gi, // Event handlers
            /expression\s*\(/gi, // CSS expressions
            /vbscript:/gi, // VBScript
            /<\?php/gi, // PHP tags
            /<%.*%>/gi // ASP tags
        ];

        return dangerousPatterns.some(pattern => pattern.test(input));
    }
};

export default FormSanitizer;