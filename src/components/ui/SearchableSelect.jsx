import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "../../lib/utils";
import { Input } from "./Input";

export function SearchableSelect({
  label,
  value,
  options,
  onChange,
  getOptionValue,
  getOptionLabel,
  getOptionDescription,
  placeholder = "Cari...",
  emptyText = "Data tidak ditemukan.",
  idleText = "Mulai ketik untuk mencari.",
  showOptionsWhenEmpty = true
}) {
  const [query, setQuery] = useState("");

  const selectedOption = useMemo(
    () => options.find((option) => getOptionValue(option) === value),
    [getOptionValue, options, value]
  );

  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return showOptionsWhenEmpty ? options : [];
    }

    return options.filter((option) => {
      const labelText = getOptionLabel(option).toLowerCase();
      const descriptionText = getOptionDescription?.(option)?.toLowerCase() ?? "";

      return labelText.includes(normalizedQuery) || descriptionText.includes(normalizedQuery);
    });
  }, [getOptionDescription, getOptionLabel, options, query, showOptionsWhenEmpty]);

  const isIdle = !query.trim() && !showOptionsWhenEmpty;

  return (
    <div className="min-w-0">
      {label && <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>}
      <div className="rounded-md border border-slate-200 bg-white p-3 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-100 dark:border-[#4a7378] dark:bg-[#101a1d] dark:focus-within:ring-[#0d3435]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <Input
            className="border-slate-100 pl-9 focus:border-slate-200 focus:ring-0 dark:border-[#35585e] dark:focus:border-[#4a7378]"
            placeholder={placeholder}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

        {selectedOption && (
          <div className="mt-3 rounded-md bg-primary-50 px-3 py-2 text-sm dark:bg-[#0d3435]">
            <p className="break-words font-medium text-primary-800 dark:text-primary-100">{getOptionLabel(selectedOption)}</p>
            {getOptionDescription && (
              <p className="mt-1 break-words text-xs text-primary-700 dark:text-primary-200">{getOptionDescription(selectedOption)}</p>
            )}
          </div>
        )}

        <div className="mt-3 max-h-56 space-y-2 overflow-y-auto pr-1">
          {isIdle ? (
            <p className="rounded-md border border-dashed border-primary-100 bg-primary-50/50 px-3 py-4 text-center text-sm text-slate-500 dark:border-[#4a7378] dark:bg-[#0b2324] dark:text-slate-400">
              {idleText}
            </p>
          ) : filteredOptions.length === 0 ? (
            <p className="rounded-md border border-dashed border-slate-200 px-3 py-4 text-center text-sm text-slate-500 dark:border-[#4a7378] dark:text-slate-400">
              {emptyText}
            </p>
          ) : (
            filteredOptions.map((option) => {
              const optionValue = getOptionValue(option);
              const isSelected = optionValue === value;

              return (
                <button
                  key={optionValue}
                  type="button"
                  className={cn(
                    "w-full rounded-md border px-3 py-2 text-left text-sm transition",
                    isSelected
                      ? "border-primary-700 bg-primary-700 text-white shadow-sm dark:border-[#48d6c9] dark:bg-[#249d8f] dark:text-white"
                      : "border-slate-100 bg-white text-slate-700 hover:border-primary-100 hover:bg-primary-50/70 dark:border-[#35585e] dark:bg-[#0b1518] dark:text-slate-300 dark:hover:border-[#4a7378] dark:hover:bg-[#0d3435]"
                  )}
                  onClick={() => {
                    onChange(optionValue);
                    setQuery("");
                  }}
                >
                  <span className="block break-words font-medium">{getOptionLabel(option)}</span>
                  {getOptionDescription && (
                    <span className={cn("mt-1 block break-words text-xs", isSelected ? "text-primary-50" : "text-slate-500 dark:text-slate-400")}>
                      {getOptionDescription(option)}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
