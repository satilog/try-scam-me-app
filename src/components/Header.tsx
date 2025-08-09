import { useRouter } from "next/router";
import { useTheme } from "next-themes";
import { useState } from "react";

export default function Header(props: any) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const tabs = [
    { name: "Home", href: "/" },
  ];

  return (
    <div className="flex w-full items-center justify-around bg-white h-16 border-b-[1.5px] border-border">
      <div
        className={`container flex justify-between items-center`}
      >
        <div
          className="text-dark text-2xl font-bold cursor-pointer hover:text-accent transition-colors px-4"
          onClick={() => router.push("/")}
        >
          Try<span className="text-red-500">Scam</span>Me
        </div>

        {/* Tabs and Sign Up Button Group */}
        <div className="flex items-center gap-4">
          {/* Mobile Dropdown Button */}
          <div className="sm:hidden">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="text-md text-dark hover:text-accent transition-colors focus:outline-none"
            >
              Menu
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-border rounded-md shadow-lg">
                {tabs.map((tab, index) => (
                  <div
                    key={index}
                    className="text-dark text-md cursor-pointer hover:bg-elevation hover:text-accent transition-colors px-0 py-2"
                    onClick={() => {
                      router.push(tab.href);
                      setIsDropdownOpen(false);
                    }}
                  >
                    {tab.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Navigation Tabs for Larger Screens */}
          <div className="hidden sm:flex flex-row mr-6 gap-8">
            {tabs.map((tab, index) => (
              <div
                key={index}
                className="text-dark text-md cursor-pointer hover:text-accent transition-colors"
                onClick={() => router.push(tab.href)}
              >
                {tab.name}
              </div>
            ))}
          </div>

          {/* Sign Up Button */}
          <button
            className="hidden py-2 px-4 border border-transparent rounded-md shadow-sm text-md font-medium text-white bg-accent hover:bg-lighter-green focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition-colors"
            onClick={() => router.push("/signup")}
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}