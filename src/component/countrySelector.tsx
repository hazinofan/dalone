// components/CountrySelect.tsx
import { useState, Fragment } from "react";
import { Combobox, Transition } from "@headlessui/react";
import { getNames } from "country-list";
import { Check, ChevronsUpDown } from "lucide-react";

const allCountries = getNames(); // [ "Afghanistan", "Åland Islands", ... ]

interface CountrySelectProps {
  value: string;
  onChange: (country: string) => void;
  placeholder?: string;
}

export function CountrySelect({ value, onChange, placeholder }: CountrySelectProps) {
  const [query, setQuery] = useState("");

  const filtered =
    query === ""
      ? allCountries
      : allCountries.filter((c:any) =>
          c.toLowerCase().includes(query.toLowerCase())
        );

  return (
    <Combobox value={value} onChange={onChange}>
      <div className="relative">
        <Combobox.Input
          className="w-full h-14 border border-gray-300 rounded px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={placeholder}
          displayValue={(c: string) => c}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-3">
          <ChevronsUpDown className="w-5 h-5 text-gray-500" />
        </Combobox.Button>

        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          className="absolute mt-1 max-h-60 w-full overflow-auto rounded bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
        >
          <Combobox.Options>
            {filtered.length === 0 ? (
              <div className="px-3 py-2 text-gray-500">No countries found.</div>
            ) : (
              filtered.map((country) => (
                <Combobox.Option
                  key={country}
                  value={country}
                  className={({ active }) =>
                    `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                      active ? "bg-blue-600 text-white" : "text-gray-900"
                    }`
                  }
                >
                  {({ selected, active }) => (
                    <>
                      <span
                        className={`block truncate ${
                          selected ? "font-medium" : "font-normal"
                        }`}
                      >
                        {country}
                      </span>
                      {selected && (
                        <span
                          className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                            active ? "text-white" : "text-blue-600"
                          }`}
                        >
                          <Check className="w-5 h-5" />
                        </span>
                      )}
                    </>
                  )}
                </Combobox.Option>
              ))
            )}
          </Combobox.Options>
        </Transition>
      </div>
    </Combobox>
  );
}
