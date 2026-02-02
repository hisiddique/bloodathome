interface ProviderMarkerProps {
    type: 'phlebotomist' | 'clinic' | 'user';
    imageUrl?: string;
    showImage?: boolean;
    isSelected?: boolean;
}

export function createProviderMarkerElement({
    type,
    imageUrl,
    showImage,
    isSelected,
}: ProviderMarkerProps): HTMLElement {
    const container = document.createElement('div');
    container.className = `relative flex items-center justify-center transition-all ${
        isSelected ? 'scale-125' : 'scale-100'
    }`;

    let svgContent = '';
    let bgColor = '';
    let borderColor = '';

    switch (type) {
        case 'phlebotomist':
            bgColor = isSelected ? 'bg-teal-600' : 'bg-teal-500';
            borderColor = 'border-teal-700';
            svgContent = `
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="m18 2 4 4"/>
                    <path d="m17 7 3-3"/>
                    <path d="M19 9 8.7 19.3c-1 1-2.5 1-3.4 0l-.6-.6c-1-1-1-2.5 0-3.4L15 5"/>
                    <path d="m9 11 4 4"/>
                    <path d="m5 19-3 3"/>
                    <path d="m14 4 6 6"/>
                </svg>
            `;
            break;

        case 'clinic':
            bgColor = isSelected ? 'bg-blue-600' : 'bg-blue-500';
            borderColor = 'border-blue-700';
            svgContent = `
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect width="16" height="20" x="4" y="2" rx="2" ry="2"/>
                    <path d="M9 22v-4h6v4"/>
                    <path d="M8 6h.01"/>
                    <path d="M16 6h.01"/>
                    <path d="M12 6h.01"/>
                    <path d="M12 10h.01"/>
                    <path d="M12 14h.01"/>
                    <path d="M16 10h.01"/>
                    <path d="M16 14h.01"/>
                    <path d="M8 10h.01"/>
                    <path d="M8 14h.01"/>
                </svg>
            `;
            break;

        case 'user':
            bgColor = 'bg-red-500';
            borderColor = 'border-red-700';
            svgContent = `
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                    <circle cx="12" cy="10" r="3"/>
                </svg>
            `;
            break;
    }

    container.innerHTML = `
        <div class="relative">
            <div class="${bgColor} ${borderColor} border-2 rounded-full p-1 shadow-lg ${isSelected ? 'shadow-xl' : ''}">
                ${svgContent}
            </div>
            ${
                showImage && imageUrl
                    ? `
                <div class="absolute inset-0 flex items-center justify-center">
                    <img
                        src="${imageUrl}"
                        alt="Provider"
                        class="w-6 h-6 rounded-full border-2 border-white shadow-md object-cover"
                    />
                </div>
            `
                    : ''
            }
        </div>
    `;

    return container;
}

export function getMarkerIcon(
    type: 'phlebotomist' | 'clinic' | 'user',
): string {
    switch (type) {
        case 'phlebotomist':
            return `data:image/svg+xml,${encodeURIComponent(`
                <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="20" cy="20" r="18" fill="#14b8a6" stroke="#0f766e" stroke-width="2"/>
                    <path d="m24 8 4 4m-1 1 3-3m-7 4-10.3 10.3c-1 1-2.5 1-3.4 0l-.6-.6c-1-1-1-2.5 0-3.4L19 11m-4 6 4 4m-10 4-3 3m16-13 6 6"
                          fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            `)}`;

        case 'clinic':
            return `data:image/svg+xml,${encodeURIComponent(`
                <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="20" cy="20" r="18" fill="#3b82f6" stroke="#1e40af" stroke-width="2"/>
                    <rect width="12" height="15" x="14" y="10" rx="1.5" fill="none" stroke="white" stroke-width="1.5"/>
                    <path d="M15 27v-3h6v3M16 13h.01M22 13h.01M19 13h.01M19 16h.01M19 19h.01M22 16h.01M22 19h.01M16 16h.01M16 19h.01"
                          stroke="white" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
            `)}`;

        case 'user':
        default:
            return `data:image/svg+xml,${encodeURIComponent(`
                <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="20" cy="20" r="18" fill="#ef4444" stroke="#991b1b" stroke-width="2"/>
                    <path d="M26 16c0 4.5-6 9-6 9s-6-4.5-6-9a6 6 0 0 1 12 0Z" fill="none" stroke="white" stroke-width="2"/>
                    <circle cx="20" cy="16" r="2" fill="white"/>
                </svg>
            `)}`;
    }
}
