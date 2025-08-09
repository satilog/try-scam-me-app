import { FunctionComponent } from "react";

interface PaginationProps {
  currentPage: number;
  size: number;
  count: number;
  onPageChange: (page: number) => void;
}

const navigationButtonOnlyClasses = ["italic"];
const commonClasses = [
  "font-semibold",
  "px-3",
  "border-2 border-accent",
  "text-center",
  "hover:text-white",
  "hover:bg-accent",
  "transition-colors",
];

const activeNumberOnlyClasses = ["bg-accent", "text-white"];
const ellipsesClasses = ["px-3", "text-center"];  // Customized classes for ellipses

const Pagination: FunctionComponent<PaginationProps> = (props) => {
  const { currentPage = 1, size = 5, count, onPageChange } = props;

  const navigationButtonClasses = [
    ...commonClasses,
    ...navigationButtonOnlyClasses,
  ];
  const numberClasses = [...commonClasses];
  const activeNumberClasses = [...numberClasses, ...activeNumberOnlyClasses];

  const numberOfPages = Math.ceil(count / size);
  const maxPagesToShow = 5;

  const startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  const endPage = Math.min(numberOfPages, startPage + maxPagesToShow - 1);

  return (
    <div className="flex py-2 px-4 items-center">
      {/* Previous Button */}
      <div
        className={
          currentPage === 1
            ? [...navigationButtonClasses, "invisible"].join(" ")
            : navigationButtonClasses.join(" ")
        }
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
      >
        Prev
      </div>

      {/* Page Numbers */}
      <div className="px-3 flex gap-1">
        {startPage > 1 && (
          <>
            <div className={numberClasses.join(" ")} onClick={() => onPageChange(1)}>
              1
            </div>
            <div className={ellipsesClasses.join(" ")}>...</div>  {/* Updated classes here */}
          </>
        )}

        {Array.from({ length: endPage - startPage + 1 }, (_, index) => startPage + index).map(
          (pageNumber) => (
            <div
              key={pageNumber}
              className={
                pageNumber === currentPage
                  ? activeNumberClasses.join(" ")
                  : numberClasses.join(" ")
              }
              onClick={() => onPageChange(pageNumber)}
            >
              {pageNumber}
            </div>
          )
        )}

        {endPage < numberOfPages && (
          <>
            <div className={ellipsesClasses.join(" ")}>...</div>  {/* Updated classes here */}
            <div
              className={numberClasses.join(" ")}
              onClick={() => onPageChange(numberOfPages)}
            >
              {numberOfPages}
            </div>
          </>
        )}
      </div>

      {/* Next Button */}
      <div
        className={
          currentPage === numberOfPages
            ? [...navigationButtonClasses, "invisible"].join(" ")
            : navigationButtonClasses.join(" ")
        }
        onClick={() => currentPage < numberOfPages && onPageChange(currentPage + 1)}
      >
        Next
      </div>
    </div>
  );
};

export default Pagination;
