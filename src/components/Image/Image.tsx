import ExportedImage, { type ExportedImageProps } from "next-image-export-optimizer";

const Image = ({ src, ...props }: ExportedImageProps) => {
  return <ExportedImage loading="lazy" src={`images/${src}`} {...props} />;
};

export default Image;
