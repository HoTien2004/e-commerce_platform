import { useState, useEffect, useRef } from 'react';
import { FiChevronDown } from 'react-icons/fi';

interface AddressOption {
    code: string;
    name: string;
}

interface AddressDropdownProps {
    value: string;
    onChange: (value: string) => void;
    options: AddressOption[];
    placeholder?: string;
    error?: string;
    disabled?: boolean;
    onSearch?: (keyword: string) => void;
}

const AddressDropdown = ({
    value,
    onChange,
    options,
    placeholder = 'Chọn...',
    error,
    disabled = false,
    onSearch,
}: AddressDropdownProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [filteredOptions, setFilteredOptions] = useState<AddressOption[]>(options);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Filter options based on search keyword
    useEffect(() => {
        if (searchKeyword.trim()) {
            const filtered = options.filter((opt) =>
                opt.name.toLowerCase().includes(searchKeyword.toLowerCase())
            );
            setFilteredOptions(filtered);
        } else {
            setFilteredOptions(options);
        }
    }, [searchKeyword, options]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearchKeyword('');
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    // Note: Removed scroll handler to allow scrolling inside dropdown
    // Dropdown will only close on outside click

    const selectedOption = options.find((opt) => opt.code === value);

    const handleSelect = (option: AddressOption) => {
        onChange(option.code);
        setIsOpen(false);
        setSearchKeyword('');
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const keyword = e.target.value;
        setSearchKeyword(keyword);
        if (onSearch) {
            onSearch(keyword);
        }
    };

    const handleInputFocus = () => {
        setIsOpen(true);
    };

    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (filteredOptions.length > 0) {
                handleSelect(filteredOptions[0]);
            }
        } else if (e.key === 'Escape') {
            setIsOpen(false);
            setSearchKeyword('');
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <div className="relative m-0 p-0">
                <input
                    ref={inputRef}
                    type="text"
                    value={isOpen ? searchKeyword : selectedOption?.name || ''}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    onKeyDown={handleInputKeyDown}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${error ? 'border-red-500' : ''
                        } ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <FiChevronDown
                        className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
                    />
                </div>
            </div>

            {isOpen && !disabled && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-[200px] overflow-y-auto no-scrollbar">
                    {filteredOptions.length > 0 ? (
                        <ul className="py-1">
                            {filteredOptions.map((option) => (
                                <li
                                    key={option.code}
                                    onClick={() => handleSelect(option)}
                                    className={`px-4 py-2 cursor-pointer hover:bg-primary-50 transition-colors ${value === option.code ? 'bg-primary-100 text-primary-700 font-medium' : 'text-gray-900'
                                        }`}
                                >
                                    {option.name}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="px-4 py-2 text-sm text-gray-500 text-center">Không tìm thấy kết quả</div>
                    )}
                </div>
            )}

            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
    );
};

export default AddressDropdown;

