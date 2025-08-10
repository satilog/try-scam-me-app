// import { graphqlPayloadClient } from "@/shared/api/payload.client";

import React, { useState, useEffect } from "react";
import { FiSearch, FiX } from "react-icons/fi";

const SearchBar = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]); // State for search results

  useEffect(() => {
    // ... existing useEffect logic
  }, [isPopupOpen]);

  const handleSearch = async (e: any) => {
    e.preventDefault();

    try {
      // const res = await graphqlPayloadClient.query({
      //   query: SEARCH_QUERY,
      //   variables: { query },
      //   fetchPolicy: "network-only",
      // });

      // setSearchResults(res.data.search);
    } catch (error) {
      console.error("There was an error executing the search!", error);
    }
  };

  
  // const [isPopupOpen, setIsPopupOpen] = useState(false);
  // const [query, setQuery] = useState("");

  // useEffect(() => {
  //   const handleEsc = (event: any) => {
  //     if (event.keyCode === 27) setIsPopupOpen(false);
  //   };
  //   window.addEventListener("keydown", handleEsc);

  //   if (isPopupOpen) {
  //     document.body.style.overflow = "hidden"; // Lock scrolling of the background
  //   } else {
  //     document.body.style.overflow = "unset"; // Unlock scrolling when popup is closed
  //   }

  //   return () => {
  //     window.removeEventListener("keydown", handleEsc);
  //     document.body.style.overflow = "unset"; // Ensure body overflow is reset when component unmounts
  //   };
  // }, [isPopupOpen]);

  // const handleSearch = (e: any) => {
  //   e.preventDefault();
  //   console.log("Searching for:", query); // Implement your search logic here
  // };

  return (
    <div className="h-full">
      <style>
        {`
          .custom-container::-webkit-scrollbar {
            display: none;
          }

          .custom-container {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}
      </style>
      <div className="relative h-full">
        <input
          type="text"
          placeholder="Search"
          onFocus={() => setIsPopupOpen(true)}
          className="pl-8 pr-4 py-1 bg-accent text-white border border-white rounded hover:bg-lighter-green transition-colors"
        />
        <FiSearch
          className="absolute top-1/2 left-2 transform -translate-y-1/2 text-white"
          size={15}
        />
      </div>

      {isPopupOpen && (
        <div className="fixed top-0 left-0 w-full h-full bg-accent bg-opacity-90 z-10 flex items-center justify-center">
          <FiX
            className="absolute top-5 right-5 text-white cursor-pointer"
            size={30}
            onClick={() => setIsPopupOpen(false)}
          />
          <div className="custom-container relative flex flex-col w-full h-full max-h-screen py-20 px-10 bg-accent overflow-y-auto">
            <form onSubmit={handleSearch} className="relative mb-10">
              <input
                type="text"
                placeholder="Search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-8 pr-4 py-2 w-full bg-accent text-white border-2 border-white rounded hover:bg-lighter-green transition-colors"
              />
              <FiSearch
                className="absolute top-1/2 left-2 transform -translate-y-1/2 text-white"
                size={15}
              />
            </form>

            {/* Search results */}
            <div className="flex flex-col gap-4">
              {[...Array(20)].map((item, index) => (
                <div className="bg-surface text-dark p-5 rounded hover:bg-elevation transition-colors" key={index}>
                  <h1>Result Title</h1>
                  <h3>Result Heading {item}</h3>
                  <p>Document snippet...</p>
                </div>
              ))}
            </div>

            {/* Assuming Pagination component exists */}
            <div className="mt-8">
              <p>Pagination goes here</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
