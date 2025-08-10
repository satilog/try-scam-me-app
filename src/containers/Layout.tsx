import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { ReactNode, useEffect } from "react";

import { useAppContext } from "@/context/AppContext";

export default function Layout({
  children,
  isScreenHeight = true,
  isFullWidth = false,
  isHeaderFullWidth = false,
}: {
  children: ReactNode | ReactNode[];
  isScreenHeight?: boolean;
  isFullWidth?: boolean;
  isHeaderFullWidth?: boolean;
}) {
  return (
    // add min-h-0 and h-full on the container wrapper
    <div
      className={`flex flex-col w-screen font-main text-dark bg-background ${
        isScreenHeight ? "h-[calc(100vh-4rem)]" : "min-h-[calc(100vh-4rem)]"
      }`}
    >
      <Header isFullWidth={isHeaderFullWidth} />
      <div
        className={`flex-1 w-full min-h-0 ${
          isScreenHeight && !isFullWidth
            ? "flex items-center justify-center"
            : ""
        }`}
      >
        {isFullWidth ? (
          children
        ) : (
          <div className="container mx-auto px-5 py-8 pt-2 h-full">
            {children}
          </div>
        )}
      </div>
      {/* <Footer /> */}
    </div>
  );
}
