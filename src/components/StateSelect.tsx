import React, { useState, useRef, useMemo, useEffect } from 'react';
import { MdSearch, MdKeyboardArrowDown, MdClear, MdCheck } from 'react-icons/md';
import { INDIAN_STATES } from '../data/indianStates';
import { useClickOutside } from '../hooks/useClickOutside';
import './StateSelect.css';

interface StateSelectProps {
  value?: string;
  onChange: (state: string) => void;
  error?: boolean;
  placeholder?: string;
  className?: string;
  id?: string;
  name?: string;
  required?: boolean;
}

export const StateSelect: React.FC<StateSelectProps> = ({
  value = '',
  onChange,
  error = false,
  placeholder = 'Select State',
  className = '',
  id,
  name,
  required = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useClickOutside(containerRef, () => {
    setIsOpen(false);
    setSearchQuery('');
  });

  const filteredStates = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return INDIAN_STATES;
    return INDIAN_STATES.filter(state => state.toLowerCase().includes(q));
  }, [searchQuery]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setHighlightedIndex(-1);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  const handleSelect = (state: string) => {
    onChange(state);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      setSearchQuery('');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev < filteredStates.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : filteredStates.length - 1));
    } else if (e.key === 'Enter' && highlightedIndex >= 0 && highlightedIndex < filteredStates.length) {
      e.preventDefault();
      handleSelect(filteredStates[highlightedIndex]);
    }
  };

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const activeEl = listRef.current.children[highlightedIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex]);

  return (
    <div 
      className={`state-select-container ${className} ${error ? 'has-error' : ''} ${isOpen ? 'is-open' : ''}`}
      ref={containerRef}
      onKeyDown={handleKeyDown}
    >
      {/* Hidden input for form integrations / validation */}
      <input 
        type="hidden" 
        id={id}
        name={name} 
        value={value} 
        required={required}
      />

      {/* Main Trigger Box */}
      <div 
        className="state-select-trigger"
        onClick={() => setIsOpen(!isOpen)}
        tabIndex={0}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className={`state-select-value ${!value ? 'is-placeholder' : ''}`}>
          {value || placeholder}
        </span>

        <div className="state-select-actions">
          <MdKeyboardArrowDown 
            className={`state-select-chevron ${isOpen ? 'rotate' : ''}`} 
            size={20} 
          />
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="state-select-dropdown" role="listbox">
          {/* Quick Search Bar */}
          <div className="state-search-box" onClick={e => e.stopPropagation()}>
            <MdSearch className="state-search-icon" size={16} />
            <input
              ref={searchInputRef}
              type="text"
              className="state-search-input"
              placeholder="Type to filter state..."
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setHighlightedIndex(0);
              }}
              aria-label="Filter states"
            />
            {searchQuery && (
              <button 
                type="button"
                className="state-search-clear"
                onClick={() => setSearchQuery('')}
              >
                <MdClear size={14} />
              </button>
            )}
          </div>

          {/* Options List */}
          <ul className="state-options-list" ref={listRef}>
            {filteredStates.length === 0 ? (
              <li className="state-no-results">
                No states matching "{searchQuery}"
              </li>
            ) : (
              filteredStates.map((state, idx) => {
                const isSelected = state === value;
                const isHighlighted = idx === highlightedIndex;

                return (
                  <li
                    key={state}
                    className={`state-option-item ${isSelected ? 'selected' : ''} ${isHighlighted ? 'highlighted' : ''}`}
                    onClick={() => handleSelect(state)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <span>{state}</span>
                    {isSelected && <MdCheck className="state-check-icon" size={16} />}
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
};
