"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Shield, ChevronDown, Menu, X, Search, ArrowRight } from "lucide-react";

const categories = [
  {
    id: "text",
    label: "Text Tools",
    tools: [
      { name: "Text Kitchen", href: "/text-kitchen", description: "Transform text" },
      { name: "PII Masker", href: "/pii-masker", description: "Mask sensitive data" },
    ],
  },
  {
    id: "converter",
    label: "Conversion Tools",
    tools: [
      { name: "Multi-Format Converter", href: "/multi-format-converter", description: "JSON, CSV, Excel" },
      { name: "Currency & Number Converter", href: "/currency-number-converter", description: "Currency formats" },
    ],
  },
  {
    id: "calculator",
    label: "Finance Tools",
    tools: [
      { name: "Context Calculator", href: "/context-calculator", description: "Natural language" },
    ],
  },
  {
    id: "security",
    label: "Security",
    tools: [
      { name: "PII Masker", href: "/pii-masker", description: "Data privacy" },
    ],
  },
];

const mainNav = [
  { href: "/", label: "Home" },
];

const navCategories = [
  { id: "text", label: "Text Tools", href: "/pii-masker/", tools: categories[0].tools },
  { id: "converter", label: "Conversion Tools", href: "/multi-format-converter/", tools: categories[1].tools },
  { id: "calculator", label: "Finance Tools", href: "/context-calculator/", tools: categories[2].tools },
  { id: "security", label: "Security", href: "/pii-masker/", tools: categories[3].tools },
];

export function Header() {
  const pathname = usePathname();
  const [exploreOpen, setExploreOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!openDropdown) return;
    const handleClickOutside = () => setOpenDropdown(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [openDropdown]);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100" : "bg-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <Shield className="h-6 w-6 text-black" />
          <span className="text-black">Toolithic</span>
        </Link>

        {/* Main Navigation - Desktop */}
        <nav className="hidden lg:flex items-center gap-8">
          <div className="relative">
            <button
              onClick={() => setExploreOpen(!exploreOpen)}
              className={cn(
                "flex items-center gap-1 text-sm font-medium transition-colors hover:text-black",
                exploreOpen ? "text-black" : "text-gray-500"
              )}
            >
              Explore <ChevronDown className={cn("h-4 w-4 transition-transform", exploreOpen && "rotate-180")} />
            </button>

            {exploreOpen && (
              <>
                <div className="fixed inset-0" onClick={() => setExploreOpen(false)} />
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-[700px] bg-white rounded-xl shadow-xl border border-gray-100 p-6">
                  <div className="grid grid-cols-4 gap-4">
                    {categories.map((cat) => (
                      <div key={cat.id}>
                        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">{cat.label}</h4>
                        {cat.tools.map((tool) => (
                          <Link
                            key={tool.href}
                            href={tool.href}
                            onClick={() => setExploreOpen(false)}
                            className="block py-2 text-sm text-gray-600 hover:text-black transition-colors"
                          >
                            {tool.name}
                          </Link>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {navCategories.map((cat) => (
            <div key={cat.id} className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenDropdown(openDropdown === cat.id ? null : cat.id);
                }}
                className={cn(
                  "flex items-center gap-1 text-sm font-medium transition-colors hover:text-black",
                  openDropdown === cat.id ? "text-black" : "text-gray-500"
                )}
              >
                {cat.label} <ChevronDown className={cn("h-4 w-4 transition-transform", openDropdown === cat.id && "rotate-180")} />
              </button>
              {openDropdown === cat.id && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-48 bg-white rounded-xl shadow-xl border border-gray-100 p-3">
                  {cat.tools.map((tool) => (
                    <Link
                      key={tool.href}
                      href={tool.href}
                      onClick={() => setOpenDropdown(null)}
                      className="block py-2 text-sm text-gray-600 hover:text-black transition-colors"
                    >
                      {tool.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Search & Actions - Desktop */}
        <div className="hidden lg:flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search tools..."
              className="h-9 w-48 rounded-full border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm focus:outline-none focus:border-black focus:bg-white transition-colors"
            />
          </div>
          <Link
            href="/pii-masker/"
            className="flex items-center gap-2 rounded-full bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
          >
            Get Started <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white">
          <div className="p-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm"
              />
            </div>
            <nav className="space-y-1">
              {categories.map((cat) => (
                <div key={cat.id}>
                  <div className="py-2 text-xs font-semibold uppercase tracking-wider text-gray-400">{cat.label}</div>
                  {cat.tools.map((tool) => (
                    <Link
                      key={tool.href}
                      href={tool.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2 pl-4 text-sm font-medium text-gray-600"
                    >
                      {tool.name}
                    </Link>
                  ))}
                </div>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}