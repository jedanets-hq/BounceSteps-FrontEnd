import React, { useState, useEffect } from 'react';
import tanzaniaLocations from '../data/tanzaniaLocations.json';

const LocationSelector = ({ 
  value = {}, 
  onChange, 
  required = false,
  showWard = true,
  showStreet = true,
  className = ''
}) => {
  const [selectedRegion, setSelectedRegion] = useState(value.region || '');
  const [selectedDistrict, setSelectedDistrict] = useState(value.district || '');
  const [selectedWard, setSelectedWard] = useState(value.ward || '');
  const [selectedStreet, setSelectedStreet] = useState(value.street || '');
  
  const [availableDistricts, setAvailableDistricts] = useState([]);
  const [availableWards, setAvailableWards] = useState([]);
  const [availableStreets, setAvailableStreets] = useState([]);

  // Update available districts when region changes
  useEffect(() => {
    if (selectedRegion) {
      const region = tanzaniaLocations.regions.find(r => r.name === selectedRegion);
      setAvailableDistricts(region?.districts || []);
      setSelectedDistrict('');
      setSelectedWard('');
      setSelectedStreet('');
      setAvailableWards([]);
      setAvailableStreets([]);
    } else {
      setAvailableDistricts([]);
      setSelectedDistrict('');
      setSelectedWard('');
      setSelectedStreet('');
      setAvailableWards([]);
      setAvailableStreets([]);
    }
  }, [selectedRegion]);

  // Update available wards when district changes
  useEffect(() => {
    if (selectedDistrict && selectedRegion) {
      const region = tanzaniaLocations.regions.find(r => r.name === selectedRegion);
      const district = region?.districts.find(d => d.name === selectedDistrict);
      setAvailableWards(district?.wards || []);
      setSelectedWard('');
      setSelectedStreet('');
      setAvailableStreets([]);
    } else {
      setAvailableWards([]);
      setSelectedWard('');
      setSelectedStreet('');
      setAvailableStreets([]);
    }
  }, [selectedDistrict, selectedRegion]);

  // Update available streets when ward changes
  useEffect(() => {
    if (selectedWard && selectedDistrict && selectedRegion) {
      const region = tanzaniaLocations.regions.find(r => r.name === selectedRegion);
      const district = region?.districts.find(d => d.name === selectedDistrict);
      const ward = district?.wards.find(w => w.name === selectedWard);
      setAvailableStreets(ward?.streets || []);
      setSelectedStreet('');
    } else {
      setAvailableStreets([]);
      setSelectedStreet('');
    }
  }, [selectedWard, selectedDistrict, selectedRegion]);

  // Notify parent of changes
  useEffect(() => {
    if (onChange) {
      onChange({
        region: selectedRegion,
        district: selectedDistrict,
        ward: selectedWard,
        street: selectedStreet
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRegion, selectedDistrict, selectedWard, selectedStreet]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Region Selection */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Region (Mkoa) {required && <span className="text-destructive">*</span>}
        </label>
        <select
          value={selectedRegion}
          onChange={(e) => setSelectedRegion(e.target.value)}
          required={required}
          className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Select Region...</option>
          {tanzaniaLocations.regions.map((region) => (
            <option key={region.code} value={region.name}>
              {region.name}
            </option>
          ))}
        </select>
      </div>

      {/* District Selection */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          District (Wilaya) {required && <span className="text-destructive">*</span>}
        </label>
        <select
          value={selectedDistrict}
          onChange={(e) => setSelectedDistrict(e.target.value)}
          required={required}
          disabled={!selectedRegion}
          className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="">
            {selectedRegion ? 'Select District...' : 'Select Region first...'}
          </option>
          {availableDistricts.map((district) => (
            <option key={district.code} value={district.name}>
              {district.name}
            </option>
          ))}
        </select>
      </div>

      {/* Ward Selection */}
      {showWard && (
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Ward (Kata) {required && <span className="text-destructive">*</span>}
          </label>
          <select
            value={selectedWard}
            onChange={(e) => setSelectedWard(e.target.value)}
            required={required && showWard}
            disabled={!selectedDistrict}
            className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">
              {selectedDistrict ? 'Select Ward...' : 'Select District first...'}
            </option>
            {availableWards.map((ward) => (
              <option key={ward.code} value={ward.name}>
                {ward.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Street Selection */}
      {showStreet && showWard && (
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Street / Mtaa {required && <span className="text-destructive">*</span>}
          </label>
          <select
            value={selectedStreet}
            onChange={(e) => setSelectedStreet(e.target.value)}
            required={required && showStreet}
            disabled={!selectedWard}
            className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">
              {selectedWard ? 'Select Street...' : 'Select Ward first...'}
            </option>
            {availableStreets.map((street, index) => (
              <option key={`${street}-${index}`} value={street}>
                {street}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Selected Location Display */}
      {selectedRegion && (
        <div className="text-sm text-muted-foreground">
          <strong>Selected:</strong> {selectedRegion}
          {selectedDistrict && ` → ${selectedDistrict}`}
          {selectedWard && ` → ${selectedWard}`}
          {selectedStreet && ` → ${selectedStreet}`}
        </div>
      )}
    </div>
  );
};

export default LocationSelector;
