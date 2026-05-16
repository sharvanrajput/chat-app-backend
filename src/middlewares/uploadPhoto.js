import multer from "multer"
import path from "path"

function createStorage(imgpath) {
    return multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, path.join(process.cwd(), 'public', imgpath))
        },
        filename: function (req, file, cb) {
            file.extension = path.extname(file.originalname)
            const uniqueSuffix = file.originalname + file.extension
            cb(null, file.fieldname + '-' + uniqueSuffix)
        }
    })
}

export const uploadImage = (imgpath) => {
    return multer({ storage: createStorage(imgpath) })
}



