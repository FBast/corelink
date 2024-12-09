import archiver from "archiver";
import {Readable} from "stream";

export const createZip = async (files) => {
    return new Promise((resolve, reject) => {
        const archive = archiver('zip', { zlib: { level: 9 } });
        const buffers = [];

        archive.on('data', (data) => buffers.push(data));
        archive.on('end', () => resolve(Buffer.concat(buffers)));
        archive.on('error', (err) => reject(err));

        files.forEach((file) => {
            const stream = Readable.from(file.data);
            archive.append(stream, { name: file.originalName });
        });

        archive.finalize();
    });
}