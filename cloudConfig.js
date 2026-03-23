import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from 'multer-storage-cloudinary';


cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key:process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});

// const storage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: {
//     folder: 'NovaHorizons_DEV',
//      resource_type: "image",
//     allowed_formats: ["png", "jpg", "jpeg"],
//   },
// });
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "NovaHorizons_DEV",
    resource_type: "image",
    format: file.mimetype.split("/")[1],
  }),
});

export { cloudinary, storage };