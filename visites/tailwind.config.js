/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        navy: "#1F3864",
        gold: "#C98A2E",
        cream: "#FAF9F5",
        line: "#E4E1D8",
        ink: "#2B2E33",
        muted: "#767b85",
      },
      boxShadow: {
        card: "0 1px 2px rgba(31, 56, 100, 0.06)",
      },
    },
  },
  plugins: [],
};
