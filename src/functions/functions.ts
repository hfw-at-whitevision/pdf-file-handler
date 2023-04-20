import { Page } from "react-pdf";

export const generateThumbnails = ({totalPages, index, template}) => {
  let thumbnails = [];
  const newThumbnail: any = () => {
    return template({
      pageNumber: index,
    });
  }
  for(let i = 0; i < totalPages[index]; i++) {
    thumbnails = thumbnails.concat(template);
  }
}