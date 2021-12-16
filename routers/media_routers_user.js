import winston from 'winston';
import Jimp from "jimp";
import path from "path";
import fs from "fs";
import multer from "multer";
import moment from 'moment';
import Thumbler from "thumbler";
import Media from "../models/Media";
import LessonPublish from "../models/LessonPublish";
import Company from "../models/Company";
import User from "../models/User";
import mongoose from "mongoose";
import auth from "../auth";
let ffmpeg = require('fluent-ffmpeg');
const {uuid, winsErr, mbToByte, logoPX, coverPX, sliderPX, avatarPX} = require('../config');
const config = {
    url:process.env.NODE_ENV === 'development' ? 'http://cdn.hrx.com' : 'https://cdn.tatatunga.mn',
    partition: ''
};



let avatarStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.resolve(__dirname,"../static/tmp"))
    },
    filename: function (req, file, cb) {
        cb(null, ( 'avatar-' +(((req.user || {})._id || new Date().getTime())) + uuid()).split("-").join("") + path.extname(file.originalname));
    }
});
let avatarUploading = multer({
    storage: avatarStorage,
    fileFilter: function (req, file, cb) {
        let type = '|' + path.extname(file.originalname) + '|';
        let fileTypeValid = '|.jpg|.png|.jpeg|.jfif|'.indexOf(type.toLowerCase()) !== -1;
        cb(null, fileTypeValid);
    },
    limits: {fileSize: mbToByte(0.5), files:1}, // 500KB
});
let avatar = avatarUploading.single('image');

module.exports = function (router) {
    router.post('/avatar/image/upload/:uid/:size', auth.auth, function(req, res){
        const { uid, size } = req.params || {};
        if(Number(size) > 0 && Number(size) <= mbToByte(0.5)){
            avatar(req, res, function(err){
                if(err){winsErr(req, err, 'avatar()');}
                if(req.file){
                    Jimp.read(req.file.path, function (err, image) {
                        let width = image.bitmap.width;
                        let height = image.bitmap.height;
                        const {maxWidth, maxHeight, aspectRatio} = avatarPX;
                        if (err) {
                            if(err){winsErr(req, err, 'Jimp.read');}
                            return res.json({
                                success: false,
                                id: uid,
                                sucmod: true,
                                msg: 'image_error'
                            })
                        } else {
                            if(req.file.size !== Number(size))
                            {
                                fs.unlink(req.file.path, (err) => {
                                    if (err) {winsErr(req, err, 'fs.unlink');}
                                    return res.status(404).end()
                                });
                            }
                            // else if(maxWidth < width || maxHeight < height)
                            // {
                            //     fs.unlink(req.file.path, (err) => {
                            //         if (err) {winsErr(req, err, 'fs.unlink');}
                            //         return res.json({
                            //             success: false,
                            //             id: uid,
                            //             msg: `Зургийн хэмжээ хамгийн ихдээ ${maxWidth}px(→) ${maxHeight}px(🠕) байнхыг анхаарна уу.`
                            //         })
                            //     });
                            // }
                            // else if(Number(parseFloat(width / height).toFixed(2)) !== aspectRatio)
                            // {
                            //     fs.unlink(req.file.path, (err) => {
                            //         if (err) {winsErr(req, err, 'fs.unlink');}
                            //         return res.json({
                            //             success: false,
                            //             id: uid,
                            //             msg: `Зургийн харьцаа ${aspectRatio}x1 (→ / 🠕 = ${aspectRatio}) байхыг анхаарна уу.`
                            //         })
                            //     });
                            // }
                            else
                            {

                                // if(width/(height/450) >= 1200){
                                //     let newWidth = (width/(height/450));
                                //     let x = (newWidth-1200)/2;
                                //     image.resize(Jimp.AUTO,450)
                                //         .crop(x,0,1200,450)
                                //         .quality(70);
                                // }else{
                                //     let newHeight = (height/(width/1200));
                                //     let y = (newHeight-450)/2;
                                //     image.resize(1200,Jimp.AUTO)
                                //         .crop(0,y,1200,450)
                                //         .quality(70);
                                // }



                                image.resize(Jimp.AUTO,400).quality(70);

                                let dir = 'avatar-user-' + req.user._id;
                                let aa = path.resolve(__dirname, "../static/images/" + dir);
                                fs.mkdir(aa, {recursive: true}, function (e) {
                                    let filename = '__' + path.parse(req.file.originalname).name + '__' + new Date().getTime() + Math.ceil(Math.random() * 9) + '__' + path.extname(req.file.originalname);
                                    let out = aa + '/' + filename;
                                    image.write(out, function (er, img) {
                                        if (er) {
                                            winsErr(req, er, 'image.write');
                                            fs.unlink(req.file.path, (err) => {
                                                if (err) {winsErr(req, err, 'image.write->fs.unlink');}
                                                return res.json({success: false, id: uid, msg: 'Зураг хадгалалт амжилтгүй'})
                                            });
                                        } else {
                                            let media = new Media();
                                            media.user = req.user._id;
                                            // media.employee = req.employee._id;
                                            // media.company = req.company._id;
                                            media.path = '/images/' + dir + '/' + filename;
                                            // media.thumbnail = '/images/' + dir + '/thum-' + req.file.filename;
                                            media.type = 'image';
                                            media.forWhat = 'avatar';
                                            media.name = filename;
                                            media.original_name = req.file.originalname;
                                            media.url = config.url;
                                            media.imageWidth = width;
                                            media.imageHeight = height;
                                            media.size = req.file.size || size || 0; // size: media.size
                                            media.save(function (err, savedMedia) {
                                                if(err){winsErr(req, err, 'media.save');}
                                                fs.unlink(req.file.path, (err) => {
                                                    if (err) {winsErr(req, err, 'media.save->fs.unlink');}
                                                    if(savedMedia){
                                                        let sm = {
                                                            path: savedMedia._doc.path,
                                                            name: savedMedia._doc.name,
                                                            url: savedMedia._doc.url,
                                                            _id: savedMedia._doc._id,
                                                        };
                                                        return res.json({
                                                            success: !(err),
                                                            sucmod: !(err),
                                                            msg: err ? 'Хэрэглэгчийн зураг солих үед алдаа гарлаа!' : 'Зураг амжилттай хуулагдлаа.',
                                                            id: uid,
                                                            image: sm
                                                        });
                                                    } else {
                                                        fs.unlink(path.resolve(__dirname, '../static/images/'+ dir + '/' + filename), (err) => {
                                                            if (err) {winsErr(req, err, 'media.save->fs.unlink');}
                                                            return res.json({success: false, id: uid, msg: 'Зураг хадгалалт амжилтгүй'})
                                                        });
                                                    }
                                                });
                                            });
                                        }
                                    });
                                });
                            }
                        }
                    });
                } else {
                    return res.json({success: false, msg: 'Файл олдсонгүй.', id: uid});
                }
            });
        } else {
            return res.json({success: false, msg: 'Зураг 500KB - аас хэтэрсэн байна.', id: uid});
        }
    });
};

function checkFileSize(req, res, callback){

    try {
        let freeSize = Number(req.freeSize || 0);
        let usedSize = Number(req.usedSize || 0);
        let fileSize = Number(req.fileSize || 0);

        if((usedSize + Number(req.file.size)) <= fileSize)
        {
            callback();
        }
        else
        {
            fs.unlink(req.file.path, (err) => {
                if (err) {winsErr(req, err, 'checkFileSize().fs.unlink');}
                return res.json({success: false, msg: `Уучлаарай таны FileSize хүрэлцэхгүй байна. Үлдэгдэл FileSize / ${parseFloat((freeSize / 1024) / 1024).toFixed(2)}GB /`});
            });
        }
    } catch(e){
        winsErr(req, e, 'checkFileSize');
        return res.json({success: false, msg: 'Системд алдаа гарлаа.'});
    }

}