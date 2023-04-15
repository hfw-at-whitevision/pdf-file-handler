import { BigButton } from "./BigButton";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";

export default function PagingControl({ totalPages, pageNum, setPageNum }) {
  return (
    <div className="flex items-center justify-between w-full border-white/20">
      <BigButton
        title={<BsChevronLeft strokeWidth={2} color="black" />}
        onClick={() => setPageNum(pageNum - 1)}
        disabled={pageNum - 1 === -1}
        className="w-20"
      />
      <div className="p-4 text-white font-medium">
        Pagina: {pageNum + 1}/{totalPages}
      </div>
      <BigButton
        title={<BsChevronRight strokeWidth={2} color="black" />}
        onClick={() => setPageNum(pageNum + 1)}
        disabled={pageNum + 1 > totalPages - 1}
        className="w-20"
      />
    </div>
  );
}
