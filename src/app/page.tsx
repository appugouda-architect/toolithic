"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Search, Star, Award, Globe, Zap, Shield, Users, TrendingUp } from "lucide-react";

const tools = [
  { name: "PII Masker", href: "/pii-masker", votes: 156, category: "Security", description: "Mask sensitive information securely", tags: ["pii", "masker", "security", "privacy", "text"] },
  { name: "Text Kitchen", href: "/text-kitchen", votes: 142, category: "Text", description: "Transform and clean text data", tags: ["text", "converter", "transform", "json", "csv"] },
  { name: "Multi-Format Converter", href: "/multi-format-converter", votes: 138, category: "Converters", description: "JSON, CSV, Excel, YAML converter", tags: ["converter", "json", "csv", "excel", "yaml"] },
  { name: "Context Calculator", href: "/context-calculator", votes: 124, category: "Calculators", description: "Natural language calculations", tags: ["calculator", "gst", "tax", "emi", "finance"] },
  { name: "Currency & Number", href: "/currency-number-converter", votes: 98, category: "Converters", description: "Currency conversion & formatting", tags: ["currency", "converter", "number", "format", "finance"] },
];

const searchTags = [
  { label: "PII Masker", tag: "masker" },
  { label: "Text Converter", tag: "text" },
  { label: "Calculator", tag: "calculator" },
  { label: "Currency", tag: "currency" },
];

const features = [
  { icon: Shield, title: "Secure", count: "100%", label: "Client-side processing" },
  { icon: Zap, title: "Fast", count: "24/7", label: "Always available" },
  { icon: Globe, title: "Free", count: "5+", label: "Tools included" },
  { icon: Users, title: "Simple", count: "Easy", label: "No login required" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function LandingPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const toolsRef = useRef<HTMLDivElement>(null);

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20">
        <div className="mx-auto max-w-[1400px] px-6">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="mx-auto max-w-3xl text-center"
          >
            <motion.div variants={itemVariants} className="mb-6">
              <span className="inline-block rounded-full bg-black px-4 py-1.5 text-xs font-medium text-white uppercase tracking-wider">
                Ultimate pro toolkit that leaves zero footprints. 100% local, 100% secure
              </span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="mb-6 text-5xl font-bold leading-tight tracking-tight md:text-7xl"
            >
              Discover the best <br />
              <span className="text-gray-400">utility tools</span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="mb-8 text-lg text-gray-500"
            >
              Bite-sized utilities for your biggest daily headaches, for developers, designers, and creators.
            </motion.p>

            <motion.div variants={itemVariants} className="relative mx-auto max-w-xl mb-10">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchQuery.trim()) {
                    const matchedTool = tools.find(t => 
                      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      t.tags.some(tag => tag.includes(searchQuery.toLowerCase()))
                    );
                    if (matchedTool) {
                      router.push(matchedTool.href);
                    }
                  }
                }}
                className="w-full h-14 rounded-full border border-gray-200 bg-gray-50 pl-14 pr-36 text-base focus:outline-none focus:border-black focus:bg-white transition-all"
              />
              <button 
                onClick={() => {
                  if (searchQuery.trim()) {
                    const matchedTool = tools.find(t => 
                      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      t.tags.some(tag => tag.includes(searchQuery.toLowerCase()))
                    );
                    if (matchedTool) {
                      router.push(matchedTool.href);
                    }
                  }
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-10 rounded-full bg-black px-6 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
              >
                Search
              </button>
            </motion.div>

            <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-2">
              {searchTags.map((item) => (
                <button
                  key={item.tag}
                  onClick={() => {
                    setSelectedTag(item.tag);
                    toolsRef.current?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                    selectedTag === item.tag
                      ? "border-black bg-black text-white"
                      : "border-gray-200 text-gray-500 hover:border-black hover:text-black"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Bar */}
      <section className="border-y border-gray-100 py-8">
        <div className="mx-auto max-w-[1400px] px-6">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div key={idx} className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Icon className="h-5 w-5" />
                    <span className="text-2xl font-bold">{feature.count}</span>
                  </div>
                  <div className="text-xs font-medium uppercase tracking-wider text-gray-400">{feature.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section ref={toolsRef} className="py-20">
        <div className="mx-auto max-w-[1400px] px-6">
          <div className="mb-12 flex items-center justify-between">
            <h2 className="text-3xl font-bold">Tools of the Day</h2>
            <Link href="/websites/" className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-black">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tools.map((tool, idx) => (
              <motion.div
                key={tool.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="group relative"
              >
                <div className="absolute inset-x-0 top-0 h-1 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left bg-black rounded-t-xl" />
                <Link
                  href={tool.href}
                  className={`flex items-start justify-between rounded-xl border p-6 transition-all duration-300 ${
                    selectedTag && tool.tags.includes(selectedTag)
                      ? "border-black bg-black/5 shadow-lg"
                      : "border-gray-100 hover:border-gray-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.15)]"
                  } ${selectedTag && tool.tags.includes(selectedTag) ? "" : "hover:-translate-y-1"}`}
                >
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                        {tool.category}
                      </span>
                    </div>
                    <h3 className="mb-1 text-lg font-semibold group-hover:text-black">{tool.name}</h3>
                    <p className="text-sm text-gray-500">{tool.description}</p>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <Star className="h-4 w-4 text-gray-300" />
                    <span className="text-sm font-medium">{tool.votes}</span>
                  </div>
                  <div className="absolute bottom-6 right-6">
                    <span className="flex items-center gap-1 rounded-full bg-black px-3 py-1.5 text-xs font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      Use Tool <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-[1400px] px-6">
          <h2 className="mb-12 text-3xl font-bold">Browse by Category</h2>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              { name: "Security & Privacy", count: 2, desc: "Data masking and protection tools" },
              { name: "Text & Data", count: 2, desc: "Text transformation and formatting" },
              { name: "Converters", count: 2, desc: "Format conversion utilities" },
              { name: "Calculators", count: 1, desc: "Smart calculation tools" },
            ].map((category, idx) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="group relative"
              >
                <div className="absolute inset-x-0 top-0 h-1 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left bg-black rounded-t-xl" />
                <Link
                  href="/"
                  className="block rounded-xl border border-gray-200 bg-white p-8 hover:border-gray-400 hover:shadow-[0_20px_50px_rgba(0,0,0,0.15)] transition-all duration-300 hover:-translate-y-1"
                >
                  <h3 className="mb-2 text-xl font-semibold group-hover:text-black">{category.name}</h3>
                  <p className="mb-4 text-sm text-gray-500">{category.desc}</p>
                  <div className="text-sm font-medium text-gray-400">
                    <span className="text-black">{category.count}</span> tools
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="mx-auto max-w-[1400px] px-6">
          <div className="rounded-3xl bg-black px-12 py-16 text-center text-white">
            <h2 className="mb-4 text-4xl font-bold">Ready to get started?</h2>
            <p className="mb-8 text-lg text-gray-400">
              Join thousands of users who trust our tools for their daily workflow
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/pii-masker"
                className="rounded-full bg-white px-8 py-3 text-sm font-bold text-black hover:bg-gray-200 transition-colors"
              >
                Explore Tools
              </Link>
              <Link
                href="/pii-masker/"
                className="rounded-full border border-white/20 px-8 py-3 text-sm font-bold text-white hover:bg-white/10 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-16">
        <div className="mx-auto max-w-[1400px] px-6">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <Link href="/" className="flex items-center gap-2 font-bold text-xl mb-4">
                <Shield className="h-6 w-6" />
                <span>Utility<span className="text-gray-400">Hub</span></span>
              </Link>
              <p className="text-sm text-gray-500">
                The best free online utility tools for everyone. Fast, secure, and 100% client-side.
              </p>
            </div>

            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">Text Tools</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link href="/pii-masker/" className="hover:text-black">PII Masker</Link></li>
                <li><Link href="/text-kitchen/" className="hover:text-black">Text Kitchen</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">Conversion Tools</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link href="/multi-format-converter/" className="hover:text-black">Multi-Format Converter</Link></li>
                <li><Link href="/currency-number-converter/" className="hover:text-black">Currency & Number</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">Finance Tools</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link href="/context-calculator/" className="hover:text-black">Context Calculator</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-100 text-center text-sm text-gray-400">
            © 2024 Toolithic. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}