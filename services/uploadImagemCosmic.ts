import { createBucketClient } from "@cosmicjs/sdk";
import multer from "multer";

const { BUCKET_SLUG, READ_KEY, WRITE_KEY } = process.env;
if (BUCKET_SLUG && READ_KEY) {
  const bucketDevagram = createBucketClient({
    bucketSlug: BUCKET_SLUG,
    readKey: READ_KEY,
    writeKey: WRITE_KEY,
  });

  const storage = multer.memoryStorage();

  var upload = multer({ storage: storage });

  var uploadImagemCosmic = async (req: any) => {
    if (req?.file?.originalname) {
      if (
        !req.file.originalname.includes(".png") &&
        !req.file.originalname.includes(".jpg") &&
        !req.file.originalname.includes(".jpeg")
      ) {
        throw new Error("Extensão da imagem inválida");
      }
      const media_object = {
        originalname: req.file.originalname,
        buffer: req.file.buffer,
      };

      if (req.url && req.url.includes("publicacao")) {
        return await bucketDevagram.media.insertOne({
          media: media_object,
          folder: "publicacao",
        });
      } else {
        return await bucketDevagram.media.insertOne({
          media: media_object,
          folder: "avatar",
        });
      }
    }
  };
}

export { upload, uploadImagemCosmic };
