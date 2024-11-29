import multer from 'multer';

const storage = multer.memoryStorage();
const upload = multer({ storage });

export const singleFileUpload = (fieldName) => upload.single(fieldName);
export const multipleFilesUpload = (fieldNames) => upload.fields(fieldNames.map(name => ({ name })));
