// utils.js
const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');
const crypto = require('crypto');

const tf = require('@tensorflow/tfjs');
tf.enableProdMode();

const tfn = require('@tensorflow/tfjs-node');

const NSFWJS = require('nsfwjs');

// --

function makeid(length) {
    let result = '';
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const charsLength = chars.length;
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * charsLength));
    }
    return result;
}

const downloadImage = (url, filePath) => {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filePath);
        (url.startsWith('https') ? https : http)
            .get(url, (response) => {
                response.pipe(file);
                file.on('finish', () => {
                    file.close(resolve);
                });
            })
            .on('error', (err) => {
                fs.unlinkSync(filePath);
                reject(err);
            });
    });
};

async function getImageType(filePath) {
    const buffer = Buffer.alloc(4);
    const fd = fs.openSync(filePath, 'r');
    fs.readSync(fd, buffer, 0, 4, 0);
    fs.closeSync(fd);

    if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
        return 'image/jpeg';
    } else if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
        return 'image/png';
    } else if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38) {
        return 'image/gif';
    } else if (buffer[0] === 0x42 && buffer[1] === 0x4D) {
        return 'image/bmp';
    } else {
        return 'unknown';
    }
}

async function sanitizeImage(imageUrl) {

    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp'];

    const directory = '/tmp';
    const fileName = path.basename(imageUrl);
    const ext = path.extname(fileName);
    const hash = crypto.createHash('md5').update(fileName).digest('hex');
    const filePath = path.join(directory, `${hash}${ext}`);

    await downloadImage(imageUrl, filePath);

    const imageType = await getImageType(filePath);

    if (!validImageTypes.includes(imageType)) {
        fs.unlinkSync(filePath);
        return `Unsuported image type: ${imageType}`;
    }

    return new Promise(async (resolve, reject) => {
        try {

            const buffer = await fs.promises.readFile(filePath);
            const img = tfn.node.decodeImage(buffer);
            const predictions = await(await NSFWJS.load()).classify(img);

            const isNSFW = predictions.some(
                prediction => (
                    prediction.className === 'Porn' ||
                    prediction.className === 'Sexy' ||
                    prediction.className === 'Hentai') &&
                    prediction.probability > 0.15
            );

            if (isNSFW) {
                resolve('<U>BLOCKED, SEXUAL CONTENT</U>');
            } else {
                resolve(`data:${imageType};base64,${buffer.toString('base64')}`);
            }

            fs.unlinkSync(filePath);
        } catch (err) {
            fs.unlinkSync(filePath);
            reject(err);
        }

    });
}

module.exports = { makeid, getImageType, sanitizeImage };
