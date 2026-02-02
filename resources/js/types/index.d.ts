import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface UserAddress {
    id: string;
    label: string;
    address_line1: string;
    address_line2?: string;
    town_city: string;
    postcode: string;
    is_default: boolean;
}

export interface UserPaymentMethod {
    id: string;
    card_brand: string;
    card_last_four: string;
    card_exp_month: number;
    card_exp_year: number;
    is_default: boolean;
}

export interface UserData {
    name: string;
    email: string;
    phone?: string;
}

export interface ServiceCategory {
    id: number;
    name: string;
    description?: string;
}

export interface Service {
    id: string;
    service_name: string;
    service_code: string;
    service_description?: string;
    category: ServiceCategory;
    base_price?: number;
    is_active: boolean;
}

export interface ProviderType {
    id: number;
    name: string;
    description?: string;
}

export interface Provider {
    id: string;
    provider_name?: string;
    user: {
        first_name: string;
        last_name: string;
        full_name: string;
        profile_image?: string;
    };
    type: ProviderType;
    latitude: number;
    longitude: number;
    average_rating: number;
    total_reviews: number;
    experience_years?: number;
    bio?: string;
    show_image_in_search: boolean;
    distance_km?: number;
    provider_services?: ProviderService[];
}

export interface ProviderService {
    id: string;
    service: Service;
    base_cost: number;
}

export interface TimeSlot {
    start_time: string;
    end_time: string;
    is_available: boolean;
}

export interface CollectionType {
    id: number;
    name: string;
    icon_class?: string;
    description?: string;
    display_order?: number;
}

export interface BookingDraft {
    id: string;
    session_token: string;
    current_step: number;
    step_data: Record<string, unknown>;
    expires_at: string;
    total_amount?: number;
}

export type BookingStep = 'collection' | 'location' | 'provider' | 'patient' | 'payment' | 'success';

export interface PlaceResult {
    postcode: string;
    lat: number;
    lng: number;
    formattedAddress: string;
}

export interface MapMarker {
    id: string;
    position: { lat: number; lng: number };
    type: 'phlebotomist' | 'clinic' | 'user';
    title?: string;
    price?: number;
    rating?: number;
    imageUrl?: string;
    showImage?: boolean;
}

export interface PageProps {
    name: string;
    quote: { message: string; author: string };
    auth: {
        user: User;
        roles: string[];
        isAdmin: boolean;
        isProvider: boolean;
        isPatient: boolean;
    };
    settings: {
        app_name: string;
        logo?: string;
        favicon?: string;
    };
    sidebarOpen: boolean;
    mapProvider: 'google' | 'mapbox';
    googleMapsKey?: string;
    mapboxToken?: string;
    stripePublicKey?: string;
    serviceFeePercentage: number;
    vatPercentage: number;
    [key: string]: unknown;
}
