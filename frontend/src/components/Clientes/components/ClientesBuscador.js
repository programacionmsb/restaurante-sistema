import React from 'react';
import { Search } from 'lucide-react';

export const ClientesBuscador = ({ searchTerm, onSearch }) => {
  return (
    <div className="search-wrapper">
      <Search size={20} className="search-icon" />
      <input
        type="text"
        className="search-input"
        placeholder="Buscar por nombre, teléfono o email..."
        value={searchTerm}
        onChange={(e) => onSearch(e.target.value)}
      />
    </div>
  );
};