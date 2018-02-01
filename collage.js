const request = require('request');
const fs = require('fs');

let downloadImages = imagesObjects => {
    let count = 0;
    let images = imagesObjects.map(imageObject => {
        request(imageObject.url).pipe(fs.createWriteStream('./images/' + count++ + '.jpg'));
    });
};

/**
 * Receives an object of objects containing Spotify tracks and filter the album covers from each one of them
 * returning as an array of objects containing the height, width and url to the image
 * @param {*} tracks 
 */
let getAlbumCovers = (tracks) => {
    let images = [];
    if(tracks.length !== 36) {
        console.error('Size of images array is different from 36. It needs a perfect root size to build the collage.');
    } else {
        for(track of tracks) {
            let image = track.album.images.filter(image => {
                return image.height == 640;
            });
            images = images.concat(image);
        }        
    }
    return images;
};

exports.mount = tracks => downloadImages(getAlbumCovers(tracks));