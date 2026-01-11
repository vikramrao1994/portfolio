import ExportedImage, { ExportedImageProps } from "next-image-export-optimizer";

const Image = (props: ExportedImageProps) => {
  return <ExportedImage loading="lazy" {...props} />;
};

export default Image;
