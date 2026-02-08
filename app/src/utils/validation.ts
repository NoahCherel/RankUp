// Email validation
export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Password validation (min 6 characters)
export const isValidPassword = (password: string): boolean => {
    return password.length >= 6;
};

// Name validation (min 2 characters, letters only)
export const isValidName = (name: string): boolean => {
    const nameRegex = /^[a-zA-ZÀ-ÿ\s'-]{2,}$/;
    return nameRegex.test(name.trim());
};

// Phone validation (French format)
export const isValidPhone = (phone: string): boolean => {
    const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
    return phoneRegex.test(phone);
};

// Age validation (must be 16+)
export const isValidAge = (age: number): boolean => {
    return age >= 16 && age <= 100;
};

// Price validation (positive number)
export const isValidPrice = (price: number): boolean => {
    return price > 0 && price <= 1000;
};

// Ranking validation (positive integer)
export const isValidRanking = (ranking: number): boolean => {
    return Number.isInteger(ranking) && ranking > 0 && ranking <= 100000;
};

// Form validation helper
interface ValidationError {
    field: string;
    message: string;
}

export interface LoginFormData {
    email: string;
    password: string;
}

export interface SignupFormData extends LoginFormData {
    confirmPassword?: string;
}

export const validateLoginForm = (data: LoginFormData): ValidationError[] => {
    const errors: ValidationError[] = [];

    if (!data.email) {
        errors.push({ field: 'email', message: 'Email requis' });
    } else if (!isValidEmail(data.email)) {
        errors.push({ field: 'email', message: 'Email invalide' });
    }

    if (!data.password) {
        errors.push({ field: 'password', message: 'Mot de passe requis' });
    } else if (!isValidPassword(data.password)) {
        errors.push({ field: 'password', message: 'Mot de passe trop court (min. 6 caractères)' });
    }

    return errors;
};

export const validateSignupForm = (data: SignupFormData): ValidationError[] => {
    const errors = validateLoginForm(data);

    if (data.confirmPassword !== undefined && data.password !== data.confirmPassword) {
        errors.push({ field: 'confirmPassword', message: 'Les mots de passe ne correspondent pas' });
    }

    return errors;
};

// Get first error for a field
export const getFieldError = (errors: ValidationError[], field: string): string | undefined => {
    const error = errors.find(e => e.field === field);
    return error?.message;
};
