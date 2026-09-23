import fs from "fs";
import multer from "multer";
import path from "path";

export const uploadFile = (filePath: string) => {

    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            const folder = path.join(process.cwd(), "public", filePath)
            if (!fs.existsSync(folder)) {
                fs.mkdirSync(folder);
            }
            cb(null, path.join(process.cwd(), "public", filePath))
        },
        filename: (rew, file, cb) => {
            cb(null, `${Date.now()}-${file.originalname}`)
        }
    })

    return multer({
        storage
    })
}


