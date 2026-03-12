const multer = require("multer");
const GridFsStorage = require("multer-gridfs-storage").GridFsStorage;

const storage = new GridFsStorage({
    url: process.env.ATLAS_URI,
    options: { useNewUrlParser: true, useUnifiedTopology: true },
    file: (req, file) => {
        const matchAudio = ["audio/mpeg"];
        const matchPhoto = ["image/jpeg", "image/png"];

        if (matchAudio.includes(file.mimetype)) {
            return {
                bucketName: "audios", // Bucket cho file MP3
                filename: `${Date.now()}-audio-${file.originalname}`,
            };
        } else if (matchPhoto.includes(file.mimetype)) {
            return {
                bucketName: "photos", // Bucket cho file ảnh
                filename: `${Date.now()}-photo-${file.originalname}`,
            };
        } else {
            return null;
        }
    },
});

module.exports = multer({ storage });
