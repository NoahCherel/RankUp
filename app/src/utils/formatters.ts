// Format price with currency
export const formatPrice = (price: number, currency: string = '€'): string => {
    return `${price.toFixed(0)}${currency}`;
};

// Format date to French locale
export const formatDate = (date: Date): string => {
    return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
};

// Format time
export const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
    });
};

// Format relative time (e.g., "il y a 2 heures")
export const formatRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;

    return formatDate(date);
};

// Truncate text with ellipsis
export const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - 3) + '...';
};

// Get initials from name
export const getInitials = (firstName: string, lastName: string): string => {
    const first = firstName.charAt(0).toUpperCase();
    const last = lastName.charAt(0).toUpperCase();
    return `${first}${last}`;
};

// Format ranking
export const formatRanking = (ranking: number): string => {
    if (ranking <= 100) return `Top ${ranking}`;
    return `#${ranking.toLocaleString('fr-FR')}`;
};

// Format rating with stars
export const formatRating = (rating: number, maxStars: number = 5): string => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;

    let result = '★'.repeat(fullStars);
    if (hasHalfStar) result += '½';
    result += '☆'.repeat(maxStars - Math.ceil(rating));

    return result;
};
