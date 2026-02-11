/**
 * TypeScript definitions for Google Maps Places API (New)
 * This extends the standard @types/google.maps to include the new Places API
 */

declare namespace google.maps.places {
    /**
     * Options for PlaceAutocompleteElement
     */
    interface PlaceAutocompleteElementOptions {
        /** Placeholder text for the input field */
        placeholder?: string;
        /** Array of country codes to restrict results (e.g., ['gb', 'us']) */
        includedRegionCodes?: string[];
        /** Restrict results to a geographic area */
        locationRestriction?: google.maps.LatLngBounds | google.maps.LatLngBoundsLiteral;
        /** Bias results towards a geographic area */
        locationBias?:
            | google.maps.LatLngBounds
            | google.maps.LatLngBoundsLiteral
            | google.maps.Circle
            | google.maps.CircleLiteral;
        /** Filter results by place types */
        includedPrimaryTypes?: string[];
    }

    /**
     * Session token for billing optimization
     */
    class AutocompleteSessionToken {
        constructor();
    }

    /**
     * Request for fetching autocomplete suggestions
     */
    interface AutocompleteSuggestionRequest {
        /** The input text to get suggestions for */
        input: string;
        /** Session token for billing optimization */
        sessionToken?: AutocompleteSessionToken;
        /** Array of country codes to restrict results */
        includedRegionCodes?: string[];
        /** Restrict results to a geographic area */
        locationRestriction?: google.maps.LatLngBounds | google.maps.LatLngBoundsLiteral;
        /** Bias results towards a geographic area */
        locationBias?:
            | google.maps.LatLngBounds
            | google.maps.LatLngBoundsLiteral
            | google.maps.Circle
            | google.maps.CircleLiteral;
        /** Filter results by place types */
        includedPrimaryTypes?: string[];
        /** Include query predictions in results */
        includeQueryPredictions?: boolean;
        /** Language code for results */
        language?: string;
        /** Region code for geocoding bias */
        region?: string;
    }

    /**
     * Text representation with formatting
     */
    interface PlaceTextRepresentation {
        /** Full text */
        text: string;
    }

    /**
     * Autocomplete suggestion (returned from fetchAutocompleteSuggestions)
     */
    interface AutocompleteSuggestion {
        /** Place prediction data */
        placePrediction?: PlacePrediction;
    }

    /**
     * Response from fetchAutocompleteSuggestions
     */
    interface AutocompleteSuggestionResponse {
        /** Array of autocomplete suggestions */
        suggestions: AutocompleteSuggestion[];
    }

    /**
     * Address component in the new Place API format
     */
    interface AddressComponent {
        /** Full text of the component */
        longText: string;
        /** Abbreviated text of the component */
        shortText: string;
        /** Array of types for this component (e.g., ['postal_code'], ['locality']) */
        types: string[];
    }

    /**
     * Place prediction object returned from autocomplete
     */
    interface PlacePrediction {
        /** Convert prediction to a Place object */
        toPlace(): Place;
        /** Main text of the prediction (e.g., street address) */
        text?: PlaceTextRepresentation;
        /** Structured formatted text */
        structuredFormat?: {
            /** Main text (e.g., "123 Main St") */
            mainText: PlaceTextRepresentation;
            /** Secondary text (e.g., "London, UK") */
            secondaryText?: PlaceTextRepresentation;
        };
        /** Place ID */
        placeId?: string;
    }

    /**
     * Options for fetching place fields
     */
    interface FetchFieldsOptions {
        /** Array of field names to fetch */
        fields: string[];
    }

    /**
     * Place object (New API)
     */
    interface Place {
        /** Array of address components */
        addressComponents?: AddressComponent[];
        /** Geographic coordinates */
        location?: google.maps.LatLng;
        /** Formatted address string */
        formattedAddress?: string;
        /** Display name of the place */
        displayName?: string;
        /** Viewport for the place */
        viewport?: google.maps.LatLngBounds;

        /**
         * Fetch additional fields for this place
         * @param options Options specifying which fields to fetch
         */
        fetchFields(options: FetchFieldsOptions): Promise<void>;
    }

    /**
     * Event detail for gmp-placeselect event
     */
    interface PlaceSelectEventDetail {
        /** The selected place prediction */
        placePrediction: PlacePrediction;
    }

    /**
     * PlaceAutocompleteElement - New autocomplete widget (replaces deprecated Autocomplete)
     * This is a custom HTML element that provides address autocomplete functionality
     */
    class PlaceAutocompleteElement extends HTMLElement {
        constructor(options?: PlaceAutocompleteElementOptions);

        /**
         * Add event listener for place selection
         * Event name is 'gmp-placeselect' (note: some docs show 'gmp-select')
         */
        addEventListener(
            type: 'gmp-placeselect',
            listener: (event: CustomEvent<PlaceSelectEventDetail>) => void,
            options?: boolean | AddEventListenerOptions
        ): void;

        addEventListener(
            type: 'gmp-select',
            listener: (event: CustomEvent<PlaceSelectEventDetail>) => void,
            options?: boolean | AddEventListenerOptions
        ): void;

        addEventListener(
            type: string,
            listener: EventListenerOrEventListenerObject,
            options?: boolean | AddEventListenerOptions
        ): void;

        removeEventListener(
            type: string,
            listener: EventListenerOrEventListenerObject,
            options?: boolean | EventListenerOptions
        ): void;
    }

    /**
     * AutocompleteSuggestion class for fetching suggestions programmatically
     */
    class AutocompleteSuggestion {
        /**
         * Fetch autocomplete suggestions based on input
         * @param request Request parameters for autocomplete
         * @returns Promise resolving to response with suggestions
         */
        static fetchAutocompleteSuggestions(
            request: AutocompleteSuggestionRequest
        ): Promise<AutocompleteSuggestionResponse>;
    }

}

// Extend PlacesLibrary to include the new API
declare module '@googlemaps/js-api-loader' {
    export interface PlacesLibrary extends google.maps.PlacesLibrary {
        PlaceAutocompleteElement: typeof google.maps.places.PlaceAutocompleteElement;
    }
}

// Extend the window object for custom event types
interface WindowEventMap {
    'gmp-placeselect': CustomEvent<google.maps.places.PlaceSelectEventDetail>;
    'gmp-select': CustomEvent<google.maps.places.PlaceSelectEventDetail>;
}
