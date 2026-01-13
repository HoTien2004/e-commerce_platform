import { useState, useEffect, useRef } from 'react';
import { FiMapPin } from 'react-icons/fi';

interface AddressSuggestion {
    display_name: string;
    lat: string;
    lon: string;
    address?: {
        house_number?: string;
        road?: string;
        suburb?: string;
        city?: string;
        state?: string;
        postcode?: string;
        country?: string;
    };
}

interface AddressAutocompleteProps {
    value: string;
    onChange: (address: string) => void;
    placeholder?: string;
    error?: string;
    disabled?: boolean;
}

const AddressAutocomplete = ({
    value,
    onChange,
    placeholder = 'Nhập địa chỉ...',
    error,
    disabled = false,
}: AddressAutocompleteProps) => {
    const [inputValue, setInputValue] = useState(value);
    const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isSelectingRef = useRef(false); // Track if user is selecting a suggestion

    // Sync input value with prop value (only if not selecting)
    useEffect(() => {
        if (!isSelectingRef.current) {
            setInputValue(value);
        }
    }, [value]);

    // Fetch suggestions from Nominatim API
    useEffect(() => {
        // Don't fetch if user is selecting a suggestion
        if (isSelectingRef.current) {
            return;
        }

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        if (inputValue.length > 2 && !disabled) {
            setIsSearching(true);
            timeoutRef.current = setTimeout(() => {
                fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                        inputValue
                    )}&limit=5&countrycodes=vn&addressdetails=1`
                )
                    .then((res) => res.json())
                    .then((data: AddressSuggestion[]) => {
                        setSuggestions(data);
                        setShowSuggestions(true);
                        setIsSearching(false);
                    })
                    .catch((err) => {
                        console.error('Error fetching address suggestions:', err);
                        setSuggestions([]);
                        setShowSuggestions(false);
                        setIsSearching(false);
                    });
            }, 300);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
            setIsSearching(false);
        }

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [inputValue, disabled]);

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };

        if (showSuggestions) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showSuggestions]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setInputValue(newValue);
        onChange(newValue);
    };

    const handleSelectSuggestion = (suggestion: AddressSuggestion) => {
        isSelectingRef.current = true; // Set flag to prevent refetch
        setShowSuggestions(false);
        setSuggestions([]);
        setInputValue(suggestion.display_name);
        onChange(suggestion.display_name);
        // Reset flag after a short delay to allow state updates to complete
        setTimeout(() => {
            isSelectingRef.current = false;
        }, 100);
    };

    return (
        <div className="relative" ref={containerRef}>
            <div className="relative">
                <input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onFocus={() => {
                        if (suggestions.length > 0) {
                            setShowSuggestions(true);
                        }
                    }}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={`input-primary w-full pr-10 ${error ? 'border-red-500' : ''} ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''
                        }`}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    {isSearching ? (
                        <div className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <FiMapPin className="w-5 h-5 text-gray-400" />
                    )}
                </div>
            </div>

            {showSuggestions && suggestions.length > 0 && !disabled && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-[200px] overflow-y-auto no-scrollbar">
                    <ul className="py-1">
                        {suggestions.map((suggestion, index) => (
                            <li
                                key={index}
                                onClick={() => handleSelectSuggestion(suggestion)}
                                className="px-4 py-2 cursor-pointer hover:bg-primary-50 transition-colors text-sm text-gray-900"
                            >
                                <div className="flex items-start gap-2">
                                    <FiMapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                    <span className="line-clamp-2">{suggestion.display_name}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
    );
};

export default AddressAutocomplete;

