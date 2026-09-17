import type { Config } from "tailwindcss";
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: { extend: { colors: { farm: { 50:"#f4fbf2",100:"#e5f5df",600:"#3f7d35",700:"#32642b",800:"#285123" }}}},
  plugins: []
} satisfies Config;