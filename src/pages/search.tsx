// pages/search.tsx
import { useEffect, useState, useRef, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal, ChevronDown } from "lucide-react";
import { findAll } from "../../core/services/auth.service";
import { Card, CardContent } from "@/components/ui/card";
import { useOnClickOutside } from "@/hooks/clickOutside";
import { fetchReviewsForProfessional } from "../../core/services/reviews.services";

const occupations = [
  "Nail Technician",
  "Barber",
  "Electrician",
  "Hairdresser",
  "Fitness Coach",
  "Photographer",
];

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function SearchPage() {
  const [countryFilter, setCountryFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [query, setQuery] = useState("");
  const [reviews, setReviews] = useState([])
  const [selectedOccupations, setSelectedOccupations] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const containerRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<any>(null);
  const avrgRating = reviews.length > 0 ? (reviews.reduce((sum, r: any) => sum + r.rating, 0 / reviews.length)).toFixed(1) : 0.0

  // Close suggestions when clicking outside
  useOnClickOutside(searchRef, () => setShowSuggestions(false));

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const all = await findAll();

        const allWithRatings = await Promise.all(
          all.map(async (pro: any) => {
            try {
              const reviews = await fetchReviewsForProfessional(pro.id);
              const averageRating =
                reviews.length > 0
                  ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
                  : "0.0";

              return { ...pro, averageRating: parseFloat(averageRating) };
            } catch {
              return { ...pro, averageRating: 0.0 };
            }
          })
        );

        // Sort results based on `sortBy`
        let sorted = [...allWithRatings];
        if (sortBy === "rating_desc") {
          sorted.sort((a, b) => b.averageRating - a.averageRating);
        } else if (sortBy === "rating_asc") {
          sorted.sort((a, b) => a.averageRating - b.averageRating);
        } else if (sortBy === "newest") {
          sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        } else if (sortBy === "oldest") {
          sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        }

        setResults(sorted);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [sortBy]);


  const filteredResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    const c = countryFilter.trim().toLowerCase();
    const ci = cityFilter.trim().toLowerCase();

    return results.filter(p => {
      const name = p.name.toLowerCase();
      const occupation = p.occupation.toLowerCase();
      const city = p.city.toLowerCase();
      const country = p.country.toLowerCase();

      // Query should match name OR occupation OR city OR country
      if (
        q &&
        !(
          name.includes(q) ||
          occupation.includes(q) ||
          city.includes(q) ||
          country.includes(q)
        )
      ) {
        return false;
      }

      // Occupation multi-select
      if (
        selectedOccupations.length > 0 &&
        !selectedOccupations.includes(occupation)
      ) return false;

      // Country filter
      if (c && country !== c) return false;

      // City filter
      if (ci && city !== ci) return false;

      return true;
    });
  }, [results, query, selectedOccupations, countryFilter, cityFilter]);


  // one‐time normalize all occupations/cities/countries into lowercase sets
  const allOccupations = useMemo(
    () => Array.from(new Set(results.map(p => p.occupation.toLowerCase()))),
    [results]
  );
  const allCities = useMemo(
    () => Array.from(new Set(results.map(p => p.city.toLowerCase()))),
    [results]
  );
  const allCountries = useMemo(
    () => Array.from(new Set(results.map(p => p.country.toLowerCase()))),
    [results]
  );

  // build the suggestions list
  const suggestions = useMemo(() => {
    if (!query) return [];
    const q = query.toLowerCase();

    // find up to 5 matching names
    const nameSugs = results
      .filter(p => p.name.toLowerCase().includes(q))
      .slice(0, 5)
      .map(p => ({ type: 'Name', label: p.name, value: p.name }));

    // up to 5 matching occupations
    const occSugs = allOccupations
      .filter(o => o.includes(q))
      .slice(0, 5)
      .map(o => ({ type: 'Occupation', label: o, value: o }));

    // up to 5 matching cities
    const citySugs = allCities
      .filter(c => c.includes(q))
      .slice(0, 5)
      .map(c => ({ type: 'City', label: c, value: c }));

    // up to 5 matching countries
    const countrySugs = allCountries
      .filter(c => c.includes(q))
      .slice(0, 5)
      .map(c => ({ type: 'Country', label: c, value: c }));

    return [...nameSugs, ...occSugs, ...citySugs, ...countrySugs];
  }, [results, allOccupations, allCities, allCountries, query]);

  // Infinite Scroll
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current || loading || !hasMore) return;
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 10) {
        setPage((prev) => prev + 1);
      }
    };
    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [loading, hasMore]);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
    setPage(1);
    setResults([]);
    setHasMore(true);
  };

  const handleSuggestionClick = (s: any) => {
    switch (s.type) {
      case 'Name':
        setQuery(s.value);
        break;
      case 'Occupation':
        setSelectedOccupations([s.value]);
        break;
      case 'City':
        setCityFilter(s.value);
        break;
      case 'Country':
        setCountryFilter(s.value);
        break;
    }
    setShowSuggestions(false);
  };

  return (
    <div className="pt-32 px-4 md:px-10">
      <div className="flex flex-col md:flex-row gap-6">
        {/* === Sidebar === */}
        <aside className="w-full md:w-1/4 space-y-6">
          {/* Filter Title */}
          <div className="font-semibold text-lg">Filter by</div>

          {/* Categories */}
          <div>
            <h4 className="font-medium mb-2 text-sm text-gray-700">Category</h4>
            <div className="space-y-2">
              {['Barber', 'Electrician', 'Fitness Coach', 'Photographer', 'Makeup Artist', 'Cleaner'].map((cat) => (
                <div key={cat} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={cat}
                    value={cat}
                    checked={selectedOccupations.includes(cat)}
                    onChange={(e) => {
                      const newVal = e.target.value;
                      setSelectedOccupations((prev) =>
                        prev.includes(newVal)
                          ? prev.filter((val) => val !== newVal)
                          : [...prev, newVal]
                      );
                    }}
                  />
                  <label htmlFor={cat} className="text-sm">{cat}</label>
                </div>
              ))}
            </div>
          </div>

          {/* Price Filter */}
          <div>
            <h4 className="font-medium mb-2 text-sm text-gray-700">Price Range</h4>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                className="w-1/2 px-2 py-1 border rounded text-sm"
                value={minPrice}
                onChange={(e) => setMinPrice(Number(e.target.value))}
              />
              <span>-</span>
              <input
                type="number"
                placeholder="Max"
                className="w-1/2 px-2 py-1 border rounded text-sm"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
              />
            </div>
          </div>
        </aside>

        {/* === Main Content === */}
        <main className="w-full md:w-3/4">
          {/* Search and Sort Row */}
          <div className="relative w-full md:w-4/5" ref={searchRef}>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <Input
              placeholder="Search professionals by name, occupation, or location..."
              className="pl-12 pr-4 py-6 w-full rounded-full bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-primary/50 transition-all"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
            />
          </div>

          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-50 mt-2 w-full max-h-60 overflow-auto bg-white rounded-lg shadow-lg border border-gray-200 animate-in fade-in slide-in-from-top-1">
              {['Name', 'Occupation', 'City', 'Country'].map(group => {
                const items = suggestions.filter(s => s.type === group);
                if (!items.length) return null;
                return (
                  <div key={group}>
                    <div className="px-4 py-2 text-xs font-semibold text-gray-500 bg-gray-50 sticky top-0">
                      {group}s
                    </div>
                    {items.map(s => (
                      <button
                        key={s.type + s.label}
                        className="w-full text-left px-4 py-2 hover:bg-indigo-50 transition-colors"
                        onClick={() => handleSuggestionClick(s)}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sort Dropdown */}
        <div className="w-full md:w-1/5">
          <div className="relative">
            <select
              value={sortBy}
              onChange={handleSortChange}
              className="appearance-none w-full pl-4 pr-10 py-6 rounded-full bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="rating_desc">Highest Rated</option>
              <option value="rating_asc">Lowest Rated</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
          </div>
        </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
            {filteredResults.map((pro) => (
              <Card key={pro.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 space-y-4">
                  <div className="flex gap-4 items-center">
                    <img
                      src={`${API_BASE_URL}${pro.avatar}`}
                      className="w-16 h-16 rounded-full object-cover border-2 border-white shadow"
                      alt={pro.name}
                    />
                    <div>
                      <h3 className="font-bold text-lg">{pro.name}</h3>
                      <p className="text-sm text-gray-600 capitalize">{pro.occupation}</p>
                      <p className="text-xs text-gray-400">
                        {pro.city}, {pro.country}
                      </p>

                      {/* ⭐ Average Rating */}
                      {pro.averageRating && pro.averageRating > 0 ? (
                        <p className="text-xs text-yellow-600 font-semibold mt-1">
                          ⭐ {pro.averageRating} / 5.0
                        </p>
                      ) : (
                        <p className="text-xs text-gray-400 italic mt-1">
                          No reviews yet!
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-4">
                    <Button size="sm" className="bg-primary hover:bg-primary/90">
                      Book Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredResults.length === 0 && !loading && (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 text-lg">
                  No professionals found. Try adjusting your search criteria.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}