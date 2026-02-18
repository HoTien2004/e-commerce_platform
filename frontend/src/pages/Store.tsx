import { useState, useEffect, useRef } from 'react';
import { FiMapPin, FiSearch, FiX } from 'react-icons/fi';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

// Fix for default marker icon in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Routing Control Component
const RoutingControl = ({ from, to }: { from: [number, number] | null; to: [number, number] }) => {
  const map = useMap();
  const routingControlRef = useRef<L.Routing.Control | null>(null);

  useEffect(() => {
    if (from && routingControlRef.current) {
      routingControlRef.current.remove();
      routingControlRef.current = null;
    }

    if (from) {
      routingControlRef.current = L.Routing.control({
        waypoints: [
          L.latLng(from[0], from[1]),
          L.latLng(to[0], to[1]),
        ],
        routeWhileDragging: false,
        lineOptions: {
          styles: [{ color: '#6366f1', weight: 5 }],
          extendToWaypoints: true,
          missingRouteTolerance: 0,
        },
        show: false, // Hide the instructions panel
        addWaypoints: false, // Disable adding waypoints
        fitSelectedRoutes: true,
      }).addTo(map);
    }

    return () => {
      if (routingControlRef.current) {
        map.removeControl(routingControlRef.current);
        routingControlRef.current = null;
      }
    };
  }, [from, to, map]);

  return null;
};

// Map Controller Component to fly to position
const MapController = ({ center, zoom, trigger }: { center: [number, number]; zoom?: number; trigger?: number | null }) => {
  const map = useMap();

  useEffect(() => {
    if (trigger !== null && trigger !== undefined) {
      map.flyTo(center, zoom || 15, {
        duration: 1.5,
      });
    }
  }, [trigger, center, zoom, map]);

  return null;
};

// Marker with popup control
const MarkerWithPopupControl = ({ position, children, openPopup }: { position: [number, number]; children: React.ReactNode; openPopup?: boolean }) => {
  const markerRef = useRef<L.Marker>(null);

  useEffect(() => {
    if (openPopup && markerRef.current) {
      markerRef.current.openPopup();
      // Auto-close popup after 3 seconds
      const timeoutId = setTimeout(() => {
        if (markerRef.current) {
          markerRef.current.closePopup();
        }
      }, 3000);
      return () => clearTimeout(timeoutId);
    }
  }, [openPopup]);

  return (
    <Marker position={position} ref={markerRef}>
      {children}
    </Marker>
  );
};

// Map Click Handler Component
const MapClickHandler = ({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      onMapClick(lat, lng);
    },
  });
  return null;
};

const Store = () => {
  const [address, setAddress] = useState<string>('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<[number, number] | null>(null);
  const [selectedStore, setSelectedStore] = useState<number | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([10.7769, 106.7009]);
  const [viewingStoreIndex, setViewingStoreIndex] = useState<number | null>(null);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [isSearchingSuggestions, setIsSearchingSuggestions] = useState<boolean>(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Store locations
  const stores = [
    { name: 'HDQTShop - Quận 1', address: '123 Tech Street, Quận 1, TP. Hồ Chí Minh', position: [10.7769, 106.7009] as [number, number], phone: '0909 999 999' },
    { name: 'HDQTShop - Quận 7', address: '456 CMT8, Quận 7, TP. Hồ Chí Minh', position: [10.7294, 106.7219] as [number, number], phone: '0909 888 888' },
  ];

  // Fetch autocomplete suggestions
  useEffect(() => {
    if (address.length > 2 && !selectedAddress) {
      setIsSearchingSuggestions(true);
      const timeoutId = setTimeout(() => {
        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=5&countrycodes=vn&addressdetails=1`)
          .then((res) => res.json())
          .then((data) => {
            setSuggestions(data);
            setShowSuggestions(true);
            setIsSearchingSuggestions(false);
          })
          .catch((err) => {
            console.error('Error fetching suggestions:', err);
            setSuggestions([]);
            setShowSuggestions(true);
            setIsSearchingSuggestions(false);
          });
      }, 300);

      return () => clearTimeout(timeoutId);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      setIsSearchingSuggestions(false);
    }
  }, [address, selectedAddress]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectSuggestion = (suggestion: any) => {
    const lat = parseFloat(suggestion.lat);
    const lon = parseFloat(suggestion.lon);
    const coords: [number, number] = [lat, lon];
    setAddress(suggestion.display_name);
    setSelectedAddress(coords);
    setMapCenter(coords);
    setShowSuggestions(false);

    // Automatically find route when selecting from suggestions
    // Find nearest store
    let nearestStoreIndex = 0;
    let minDistance = Infinity;

    stores.forEach((store, index) => {
      const distance = Math.sqrt(
        Math.pow(coords[0] - store.position[0], 2) +
        Math.pow(coords[1] - store.position[1], 2)
      );
      if (distance < minDistance) {
        minDistance = distance;
        nearestStoreIndex = index;
      }
    });

    setSelectedStore(nearestStoreIndex);
  };

  const handleSearch = () => {
    setShowSuggestions(false); // Hide suggestions when searching
    if (selectedAddress) {
      // Find nearest store
      let nearestStoreIndex = 0;
      let minDistance = Infinity;

      stores.forEach((store, index) => {
        const distance = Math.sqrt(
          Math.pow(selectedAddress[0] - store.position[0], 2) +
          Math.pow(selectedAddress[1] - store.position[1], 2)
        );
        if (distance < minDistance) {
          minDistance = distance;
          nearestStoreIndex = index;
        }
      });

      setSelectedStore(nearestStoreIndex);
      setMapCenter(selectedAddress);
    } else if (address) {
      // Geocode address if not selected from suggestions
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&countrycodes=vn`)
        .then((res) => res.json())
        .then((data) => {
          if (data.length > 0) {
            const lat = parseFloat(data[0].lat);
            const lon = parseFloat(data[0].lon);
            const coords: [number, number] = [lat, lon];
            setSelectedAddress(coords);
            setMapCenter(coords);
            setShowSuggestions(false); // Hide suggestions after geocoding

            // Find nearest store
            let nearestStoreIndex = 0;
            let minDistance = Infinity;

            stores.forEach((store, index) => {
              const distance = Math.sqrt(
                Math.pow(coords[0] - store.position[0], 2) +
                Math.pow(coords[1] - store.position[1], 2)
              );
              if (distance < minDistance) {
                minDistance = distance;
                nearestStoreIndex = index;
              }
            });

            setSelectedStore(nearestStoreIndex);
          }
        })
        .catch((err) => {
          console.error('Error geocoding address:', err);
        });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearRoute = () => {
    setSelectedAddress(null);
    setSelectedStore(null);
    setAddress('');
    setViewingStoreIndex(null);
  };

  const handleViewOnMap = (storeIndex: number) => {
    setViewingStoreIndex(storeIndex);
    setMapCenter(stores[storeIndex].position);
    // Clear any existing route
    setSelectedAddress(null);
    setSelectedStore(null);
    // Scroll to top of page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMapClick = (lat: number, lng: number) => {
    const coords: [number, number] = [lat, lng];
    setSelectedAddress(coords);
    setMapCenter(coords);
    setViewingStoreIndex(null); // Clear viewing store index

    // Reverse geocode to get address
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`)
      .then((res) => res.json())
      .then((data) => {
        if (data.display_name) {
          setAddress(data.display_name);
        }

        // Find nearest store
        let nearestStoreIndex = 0;
        let minDistance = Infinity;

        stores.forEach((store, index) => {
          const distance = Math.sqrt(
            Math.pow(coords[0] - store.position[0], 2) +
            Math.pow(coords[1] - store.position[1], 2)
          );
          if (distance < minDistance) {
            minDistance = distance;
            nearestStoreIndex = index;
          }
        });

        setSelectedStore(nearestStoreIndex);
      })
      .catch((err) => {
        console.error('Error reverse geocoding:', err);
        // Still find nearest store even if reverse geocoding fails
        let nearestStoreIndex = 0;
        let minDistance = Infinity;

        stores.forEach((store, index) => {
          const distance = Math.sqrt(
            Math.pow(coords[0] - store.position[0], 2) +
            Math.pow(coords[1] - store.position[1], 2)
          );
          if (distance < minDistance) {
            minDistance = distance;
            nearestStoreIndex = index;
          }
        });

        setSelectedStore(nearestStoreIndex);
      });
  };

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      <div className="max-w-[1200px] mx-auto py-8 md:py-12">
        {/* Header section with address input and map */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden mb-8">
          <div className="grid md:grid-cols-10 gap-0">
            {/* Left: Address input */}
            <div className="md:col-span-4 p-6 md:p-8 border-r border-gray-200">
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Tìm cửa hàng gần bạn
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Nhập địa chỉ để tìm cửa hàng gần nhất
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="relative" ref={suggestionsRef}>
                    <FiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      onKeyPress={handleKeyPress}
                      onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                      placeholder="Nhập địa chỉ của bạn..."
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-colors"
                    />
                    {address && (
                      <button
                        onClick={clearRoute}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <FiX className="w-5 h-5" />
                      </button>
                    )}
                    {showSuggestions && !selectedAddress && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {suggestions.length > 0 ? (
                          suggestions.map((suggestion, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => handleSelectSuggestion(suggestion)}
                              className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                            >
                              <p className="text-sm font-medium text-gray-900">{suggestion.display_name}</p>
                            </button>
                          ))
                        ) : (
                          !isSearchingSuggestions && (
                            <div className="px-4 py-3 text-center">
                              <p className="text-sm text-gray-500">Không tìm thấy địa chỉ. Vui lòng nhập lại.</p>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleSearch}
                    className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    <FiSearch className="w-5 h-5" />
                    <span>Tìm kiếm</span>
                  </button>
                </div>

                {/* Store info */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-4">Thông tin cửa hàng</h3>
                  <div className="space-y-4 text-sm text-gray-600">
                    {stores.map((store, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-start gap-2">
                          <FiMapPin className="w-4 h-4 mt-0.5 text-primary-600 flex-shrink-0" />
                          <span className="font-medium text-gray-900">{store.name}</span>
                        </div>
                        <div className="pl-6 space-y-1">
                          <div className="flex items-start gap-2">
                            <span className="w-4 h-4 flex-shrink-0">📍</span>
                            <span>{store.address}</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="w-4 h-4 flex-shrink-0">📞</span>
                            <span>Hotline: {store.phone}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="flex items-start gap-2 pt-2">
                      <span className="w-4 h-4 flex-shrink-0">🕐</span>
                      <span>Mở cửa: 8:30 - 21:30 (Thứ 2 - Chủ nhật)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Map */}
            <div className="md:col-span-6 h-[500px] md:h-auto bg-gray-200 relative">
              <MapContainer
                center={mapCenter}
                zoom={13}
                className="w-full h-full z-0"
                scrollWheelZoom={true}
              >
                <TileLayer
                  attribution=""
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapClickHandler onMapClick={handleMapClick} />
                <MapController center={mapCenter} zoom={15} trigger={viewingStoreIndex} />
                {stores.map((store, index) => (
                  <MarkerWithPopupControl
                    key={index}
                    position={store.position}
                    openPopup={viewingStoreIndex === index}
                  >
                    <Popup>
                      <div className="text-center">
                        <p className="font-semibold text-gray-900">{store.name}</p>
                        <p className="text-sm text-gray-600">{store.address}</p>
                        <p className="text-sm text-gray-600">📞 {store.phone}</p>
                      </div>
                    </Popup>
                  </MarkerWithPopupControl>
                ))}
                {selectedAddress && selectedStore !== null && (
                  <>
                    <Marker position={selectedAddress}>
                      <Popup>
                        <div className="text-center">
                          <p className="font-semibold text-gray-900">Vị trí của bạn</p>
                          <p className="text-sm text-gray-600">{address}</p>
                        </div>
                      </Popup>
                    </Marker>
                    <RoutingControl from={selectedAddress} to={stores[selectedStore].position} />
                  </>
                )}
              </MapContainer>
            </div>
          </div>
        </div>

        {/* Additional content can go here */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 md:p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Danh sách cửa hàng</h3>
          <div className="space-y-4">
            {stores.map((store, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">{store.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">{store.address}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>📞 {store.phone}</span>
                      <span>🕐 8:30 - 21:30</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleViewOnMap(index)}
                    className="text-primary-600 hover:text-primary-700 font-medium text-sm transition-colors px-4 py-6 self-start"
                  >
                    Xem bản đồ
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Store;
