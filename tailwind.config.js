/** @type {import("tailwindcss").Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: "#F8FAFC",
        navy: { 50:"#F8FAFC",100:"#EAECF0",200:"#D0D5DD",300:"#BFC6D1",400:"#98A2B3",500:"#667085",600:"#475467",700:"#344054",800:"#101828",900:"#0B1220" },
        brand: { 50:"#EFF6FF",100:"#DBEAFE",200:"#BFDBFE",300:"#93C5FD",400:"#60A5FA",500:"#3B82F6",600:"#2563EB",700:"#1D4ED8",800:"#1E40AF" },
        violet: { 50:"#F5F3FF",100:"#EDE9FE",200:"#DDD6FE",300:"#C4B5FD",400:"#A78BFA",500:"#8B5CF6",600:"#7C3AED",700:"#6D28D9" },
        success: { 50:"#ECFDF3",100:"#D1FADF",500:"#12B76A",600:"#16A34A",700:"#027A48" },
        warning: { 50:"#FFFAEB",100:"#FEF0C7",500:"#F59E0B",600:"#D97706" },
        danger: "#DC2626"
      },
      boxShadow: { card:"0 1px 3px rgba(16,24,40,0.06), 0 1px 2px rgba(16,24,40,0.04)", "card-hover":"0 8px 24px rgba(16,24,40,0.08)", glow:"0 8px 24px rgba(37,99,235,0.25)" },
      keyframes: {
        shimmer: { "0%":{backgroundPosition:"-400px 0"}, "100%":{backgroundPosition:"400px 0"} },
        "fade-in": { from:{opacity:"0"}, to:{opacity:"1"} },
        "fade-in-up": { from:{opacity:"0",transform:"translateY(12px)"}, to:{opacity:"1",transform:"translateY(0)"} }
      },
      animation: { shimmer:"shimmer 1.8s linear infinite", "fade-in":"fade-in .35s ease-out both", "fade-in-up":"fade-in-up .45s ease-out both" }
    }
  },
  plugins: []
};
