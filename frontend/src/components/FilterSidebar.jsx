import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

function FilterGroup({ label, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-clavier-border py-4">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between"
      >
        <span className="font-inter text-xs text-clavier-muted tracking-wide uppercase">
          {label}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-clavier-dim transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>
      {open && <div className="mt-3 flex flex-col gap-2">{children}</div>}
    </div>
  );
}

function CheckboxOption({ label, checked, onChange, count }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="w-4 h-4 accent-clavier-red bg-clavier-input border-clavier-border rounded-sm"
      />
      <span className="font-inter text-sm text-clavier-muted group-hover:text-clavier-cream transition-colors flex-1">
        {label}
      </span>
      {count !== undefined && (
        <span className="font-inter text-[11px] text-clavier-dim">({count})</span>
      )}
    </label>
  );
}

export default function FilterSidebar({
  categoryOptions,
  categoryFilter,
  onCategoryChange,
  switchOptions,
  switchFilter,
  onSwitchChange,
  priceRanges,
  priceRange,
  onPriceRangeChange,
  featureOptions,
  featureFilters,
  onFeatureToggle,
  onClearAll,
}) {
  return (
    <div className="sticky top-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="font-inter text-[11px] text-clavier-muted tracking-widest uppercase">
          Filters
        </span>
        <button
          onClick={onClearAll}
          className="font-inter text-xs text-clavier-red hover:underline"
        >
          Clear all
        </button>
      </div>

      {/* Layout / Category Filter */}
      <FilterGroup label="Layout">
        <CheckboxOption
          label="All"
          checked={!categoryFilter}
          onChange={() => onCategoryChange('')}
        />
        {categoryOptions.map(cat => (
          <CheckboxOption
            key={cat}
            label={cat.charAt(0).toUpperCase() + cat.slice(1)}
            checked={categoryFilter === cat}
            onChange={() => onCategoryChange(categoryFilter === cat ? '' : cat)}
          />
        ))}
      </FilterGroup>

      {/* Switch Type */}
      <FilterGroup label="Switch Type">
        <CheckboxOption
          label="All"
          checked={!switchFilter}
          onChange={() => onSwitchChange('')}
        />
        {switchOptions.map(sw => (
          <CheckboxOption
            key={sw}
            label={sw}
            checked={switchFilter === sw.toLowerCase()}
            onChange={() => onSwitchChange(switchFilter === sw.toLowerCase() ? '' : sw.toLowerCase())}
          />
        ))}
      </FilterGroup>

      {/* Price Range */}
      <FilterGroup label="Price Range">
        <CheckboxOption
          label="All Prices"
          checked={!priceRange}
          onChange={() => onPriceRangeChange(null)}
        />
        {priceRanges.map(range => (
          <CheckboxOption
            key={range.label}
            label={range.label}
            checked={priceRange === range}
            onChange={() => onPriceRangeChange(priceRange === range ? null : range)}
          />
        ))}
      </FilterGroup>

      {/* Features */}
      <FilterGroup label="Features">
        {featureOptions.map(feature => (
          <CheckboxOption
            key={feature}
            label={feature}
            checked={featureFilters.includes(feature)}
            onChange={() => onFeatureToggle(feature)}
          />
        ))}
      </FilterGroup>
    </div>
  );
}
