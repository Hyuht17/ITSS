import { useState, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Autocomplete } from '@react-google-maps/api';

const libraries = ['places'];

const mapContainerStyle = {
    width: '100%',
    height: '400px'
};

const defaultCenter = {
    lat: 35.6762, // Tokyo
    lng: 139.6503
};

/**
 * Location Picker Component
 * Google Maps integration for selecting location
 */
const LocationPicker = ({ isOpen, onClose, onLocationSelect, apiKey }) => {
    const [map, setMap] = useState(null);
    const [marker, setMarker] = useState(null);
    const [searchBox, setSearchBox] = useState(null);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const autocompleteRef = useRef(null);

    const { isLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: apiKey || '',
        libraries
    });

    const onMapClick = useCallback((e) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();

        setMarker({ lat, lng });

        // Reverse geocoding to get address
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            if (status === 'OK' && results[0]) {
                setSelectedLocation({
                    lat,
                    lng,
                    address: results[0].formatted_address,
                    name: results[0].address_components[0]?.long_name || ''
                });
            }
        });
    }, []);

    const onLoad = useCallback((map) => {
        setMap(map);
    }, []);

    const onAutocompleteLoad = (autocomplete) => {
        setSearchBox(autocomplete);
    };

    const onPlaceChanged = () => {
        if (searchBox !== null) {
            const place = searchBox.getPlace();

            if (place.geometry) {
                const lat = place.geometry.location.lat();
                const lng = place.geometry.location.lng();

                setMarker({ lat, lng });
                setSelectedLocation({
                    lat,
                    lng,
                    address: place.formatted_address || '',
                    name: place.name || ''
                });

                if (map) {
                    map.panTo({ lat, lng });
                    map.setZoom(15);
                }
            }
        }
    };

    const handleConfirm = () => {
        if (selectedLocation) {
            onLocationSelect(selectedLocation);
            onClose();
        }
    };

    if (!isOpen) return null;

    if (loadError) {
        return (
            <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-md shadow-2xl">
                    <h3 className="text-lg font-bold text-red-600 mb-2">Error</h3>
                    <p className="text-gray-700 mb-4">
                        Google Maps の読み込みに失敗しました。API keyを確認してください。
                    </p>
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
                    >
                        閉じる
                    </button>
                </div>
            </div>
        );
    }

    if (!isLoaded) {
        return (
            <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 shadow-2xl">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
                        <p className="text-gray-700">地図を読み込み中...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!apiKey) {
        return (
            <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-md shadow-2xl">
                    <h3 className="text-lg font-bold text-yellow-600 mb-2">API Key Required</h3>
                    <p className="text-gray-700 mb-4">
                        Google Maps API keyが設定されていません。<br />
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                            VITE_GOOGLE_MAPS_API_KEY
                        </code>
                        を.envファイルに追加してください。
                    </p>
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
                    >
                        閉じる
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-gray-900">地図から場所を選択</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Search Box */}
                <div className="p-6 border-b border-gray-200">
                    <Autocomplete
                        onLoad={onAutocompleteLoad}
                        onPlaceChanged={onPlaceChanged}
                    >
                        <input
                            type="text"
                            placeholder="場所を検索..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                        />
                    </Autocomplete>
                </div>

                {/* Map */}
                <div className="p-6">
                    <GoogleMap
                        mapContainerStyle={mapContainerStyle}
                        center={marker || defaultCenter}
                        zoom={marker ? 15 : 11}
                        onClick={onMapClick}
                        onLoad={onLoad}
                    >
                        {marker && (
                            <Marker position={marker} />
                        )}
                    </GoogleMap>
                </div>

                {/* Selected Location Info */}
                {selectedLocation && (
                    <div className="px-6 pb-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h3 className="font-bold text-gray-900 mb-2">選択された場所:</h3>
                            <p className="text-sm text-gray-700 mb-1">
                                <span className="font-medium">名前:</span> {selectedLocation.name}
                            </p>
                            <p className="text-sm text-gray-700 mb-1">
                                <span className="font-medium">住所:</span> {selectedLocation.address}
                            </p>
                            <p className="text-xs text-gray-500">
                                座標: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                            </p>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 flex gap-4">
                    <button
                        onClick={onClose}
                        className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                        キャンセル
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={!selectedLocation}
                        className="flex-1 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-400 transition-colors"
                    >
                        この場所を選択
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LocationPicker;
