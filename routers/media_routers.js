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

let logoStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.resolve(__dirname,"../static/tmp"))
    },
    filename: function (req, file, cb) {
        cb(null, (((req.company || {})._id || new Date().getTime()) + uuid()).split("-").join("") + path.extname(file.originalname));
    }
});
let logoUploading = multer({
    storage: logoStorage,
    fileFilter: function (req, file, cb) {
        let type = '|' + path.extname(file.originalname) + '|';
        let fileTypeValid = '|.jpg|.png|.jpeg|.jfif|'.indexOf(type.toLowerCase()) !== -1;
        cb(null, fileTypeValid);
    },
    limits: {fileSize: mbToByte(0.5), files:1}, // 500KB
});

let coverStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.resolve(__dirname,"../static/tmp"))
    },
    filename: function (req, file, cb) {
        cb(null, 'cover' + (((req.company || {})._id || new Date().getTime()) + uuid()).split("-").join("") + path.extname(file.originalname));
    }
});
let coverUploading = multer({
    storage: coverStorage,
    fileFilter: function (req, file, cb) {
        let type = '|' + path.extname(file.originalname) + '|';
        let fileTypeValid = '|.jpg|.png|.jpeg|.jfif|'.indexOf(type.toLowerCase()) !== -1;
        cb(null, fileTypeValid);
    },
    limits: {fileSize: mbToByte(3.5), files:1}, // 3.5MB
});

let sliderStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.resolve(__dirname,"../static/tmp"))
    },
    filename: function (req, file, cb) {
        cb(null, 'cover' + (((req.company || {})._id || new Date().getTime()) + uuid()).split("-").join("") + path.extname(file.originalname));
    }
});
let sliderUploading = multer({
    storage: sliderStorage,
    fileFilter: function (req, file, cb) {
        let type = '|' + path.extname(file.originalname) + '|';
        let fileTypeValid = '|.jpg|.png|.jpeg|.jfif|'.indexOf(type.toLowerCase()) !== -1;
        cb(null, fileTypeValid);
    },
    limits: {fileSize: mbToByte(3.5), files:1}, // 3.5MB
});

let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.resolve(__dirname,"../static/tmp"));
    },
    filename: function (req, file, cb) {
        cb(null, ((req.company || {})._id || new Date().getTime()) + '-' + Math.ceil(Math.random() * 10) + path.extname(file.originalname));
    }
});
let uploading = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        let type = '|' + path.extname(file.originalname) + '|';
        let fileTypeValid = '|.jpg|.png|.jpeg|.jfif|.JPG|.PNG|.JPEG|'.indexOf(type) !== -1;
        cb(null, fileTypeValid);
    },
    limits: {fileSize: 52428890, files:1},
});

let videoStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        let dir = moment().format('YYYY-MM-DD');
        let paaath = "../videos/";
        if(config.partition === 'part2') {
            if(process.env.NODE_ENV === 'development') {
                paaath = "../cdn2/videos/";
            } else {
                paaath = "../../../cdn2/hrx/videos/";
            }
        }
        var aa = path.resolve(__dirname, paaath + dir);
        fs.mkdir(aa, function (e) {
            if (!e || (e && e.code === 'EEXIST')) {
                cb(null, aa)
            } else {
                cb(null, path.resolve(__dirname, paaath))
            }
        });
    },
    filename: function (req, file, cb) {
        cb(null, new Date().getTime() + '-' + Math.ceil(Math.random() * 10) + path.extname(file.originalname));
    }
});
let videoUpload = multer({
    storage: videoStorage,
    limits: {fileSize: 524288001, files: 1},
    fileFilter: function (req, file, cb) {
        let type = '|' + path.extname(file.originalname) + '|';
        let fileTypeValid = '|.mp4|.MP4|'.indexOf(type) !== -1;
        cb(null, fileTypeValid);
    }
});


let audioStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        let dir = moment().format('YYYY-MM-DD');
        let paaath = "../audios/";
        if(config.partition === 'part2') {
            if(process.env.NODE_ENV === 'development') {
                paaath = "../cdn2/audios/";
            } else {
                paaath = "../../../cdn2/bagsh/audios/";
            }
        }
        var aa = path.resolve(__dirname, paaath + dir);
        fs.mkdir(aa, function (e) {
            if (!e || (e && e.code === 'EEXIST')) {
                cb(null, aa)
            } else {
                cb(null, path.resolve(__dirname, paaath))
            }
        });
    },
    filename: function (req, file, cb) {
        cb(null, new Date().getTime() + '-' + Math.ceil(Math.random() * 10) + path.extname(file.originalname));
    }
});
let audioUpload = multer({
    storage: audioStorage,
    limits: {fileSize: 262144001, files: 1},
    fileFilter: function (req, file, cb) {
        let type = '|' + path.extname(file.originalname) + '|';
        let fileTypeValid = '|.mp3|.aac|.m4a|.ogg|.wav|.webm|.amr|.MP3|.AAC|.M4A|.OGG|.WAV|.WEBM|.AMR|'.indexOf(type) !== -1;
        cb(null, fileTypeValid);
    }
});

let downloadStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        let dir = moment().format('YYYY-MM-DD');
        let paaath = "../downloads/";
        if(config.partition === 'part2') {
            if(process.env.NODE_ENV === 'development') {
                paaath = "../cdn2/downloads/";
            } else {
                paaath = "../../../cdn2/bagsh/downloads/";
            }
        }
        var aa = path.resolve(__dirname, paaath + dir);
        fs.mkdir(aa, function (e) {
            if (!e || (e && e.code === 'EEXIST')) {
                cb(null, aa)
            } else {
                cb(null, path.resolve(__dirname, paaath))
            }
        });
    },
    filename: function (req, file, cb) {
        cb(null, new Date().getTime() + '-' + Math.ceil(Math.random() * 10) + path.extname(file.originalname));
    }
});
let downloadUpload = multer({
    storage: downloadStorage,
    limits: {fileSize: 262144001, files: 1},
    fileFilter: function (req, file, cb) {
        let type = '|' + path.extname(file.originalname) + '|';
        let fileTypeValid = '|.doc|.docx|.ppt|.pptx|.pdf|.xls|.xlsx|.DOC|.DOCX|.PPT|.PPTX|.PDF|.XLS|.XLSX|.zip|.rar|.psd|.ZIP|.RAR|.PSD|'.indexOf(type) !== -1;
        cb(null, fileTypeValid);
    }
});


let pdfStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        let dir = moment().format('YYYY-MM-DD');
        let paaath = "../pdfs/";
        if(config.partition === 'part2') {
            if(process.env.NODE_ENV === 'development') {
                paaath = "../cdn2/pdfs/";
            } else {
                paaath = "../../../cdn2/bagsh/pdfs/";
            }
        }
        var aa = path.resolve(__dirname, paaath + dir);
        fs.mkdir(aa, function (e) {
            if (!e || (e && e.code === 'EEXIST')) {
                cb(null, aa)
            } else {
                cb(null, path.resolve(__dirname, paaath))
            }
        });
    },
    filename: function (req, file, cb) {
        cb(null, new Date().getTime() + '-' + Math.ceil(Math.random() * 10) + path.extname(file.originalname));
    }
});
let pdfUpload = multer({
    storage: pdfStorage,
    limits: {fileSize: 262144000, files: 1},
    fileFilter: function (req, file, cb) {
        let type = '|' + path.extname(file.originalname) + '|';
        let fileTypeValid = '|.pdf|.PDF|'.indexOf(type) !== -1;
        cb(null, fileTypeValid);
    }
});

let logo = logoUploading.single('image');
let cover = coverUploading.single('image');
let slider = sliderUploading.single('image');
let image = uploading.single('image');
let upload = videoUpload.single('image');
let audio = audioUpload.single('image');
let download = downloadUpload.single('image');
let pdf = pdfUpload.single('image');

module.exports = function (router) {
    router.post('/logo/image/upload/:uid/:size', function(req, res, next){
        let hasAccess = ((req.employee || {}).staticRole === 'chairman' || (req.employee || {}).staticRole === 'hrManager' || (req.employee || {}).staticRole === 'lord')
            || (((req.employee || {}).role || {}).actions || []).indexOf('edit_company_informations') > -1;
        if(hasAccess){
            auth.company(req, res, next);
        } else {
            return res.json({success: false, msg: 'Хандах эрхгүй.', id: req.params.uid});
        }
    }, function(req, res){
        const { uid, size } = req.params || {};
        if(Number(size) > 0 && Number(size) <= mbToByte(0.5)){
            logo(req, res, function(err){
                if(err){winsErr(req, err, 'logo()');}
                if(req.file){
                    Jimp.read(req.file.path, function (err, image) {
                        let width = image.bitmap.width;
                        let height = image.bitmap.height;
                        const {maxWidth, maxHeight, aspectRatio} = logoPX;
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
                            //             uid: uid,
                            //             msg: `Зургийн хэмжээ хамгийн ихдээ ${maxWidth}px(→) ${maxHeight}px(🠕) байнхыг анхаарна уу.`
                            //         })
                            //     });
                            // }
                            else if(Number(parseFloat(width / height).toFixed(2)) !== aspectRatio)
                            {
                                fs.unlink(req.file.path, (err) => {
                                    if (err) {winsErr(req, err, 'fs.unlink');}
                                    return res.json({
                                        success: false,
                                        uid: uid,
                                        msg: `Зургийн харьцаа ${aspectRatio}x1 (→ / 🠕 = ${aspectRatio}) байхыг анхаарна уу.`
                                    })
                                });
                            }
                            else
                            {
                                let dir = req.company._id + '/' + req.company.domain + '/' + moment().format('YYYY-MM-DD');
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
                                            media.employee = req.employee._id;
                                            media.company = req.company._id;
                                            media.path = '/images/' + dir + '/' + filename;
                                            // media.thumbnail = '/images/' + dir + '/thum-' + req.file.filename;
                                            media.type = 'image';
                                            media.forWhat = 'logo';
                                            media.name = filename;
                                            media.original_name = req.file.originalname;
                                            media.url = config.url;
                                            media.imageWidth = width;
                                            media.imageHeight = height;
                                            media.size = req.file.size; // size: media.size
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
                                                        // return res.json({
                                                        //     success: !(err),
                                                        //     sucmod: !(err),
                                                        //     msg: err ? 'Лого зураг солих үед алдаа гарлаа!' : 'Лого амжилттай хуулагдлаа.',
                                                        //     id: uid,
                                                        //     image: sm
                                                        // })
                                                        Company.findOneAndUpdate({_id: req.company._id, status: 'active'}, {$set: {logo: savedMedia._id}}, function(){
                                                            return res.json({
                                                                success: !(err),
                                                                sucmod: !(err),
                                                                msg: err ? 'Лого зураг солих үед алдаа гарлаа!' : 'Лого амжилттай хуулагдлаа.',
                                                                id: uid,
                                                                image: sm
                                                            })
                                                        })
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
            return res.json({success: false, msg: 'Лого 500KB - аас хэтэрсэн байна.', id: uid});
        }
    });
    router.post('/cover/image/upload/:uid/:size', function(req, res, next){
        let hasAccess = ((req.employee || {}).staticRole === 'chairman' || (req.employee || {}).staticRole === 'hrManager' || (req.employee || {}).staticRole === 'lord')
            || (((req.employee || {}).role || {}).actions || []).indexOf('edit_company_informations') > -1;
        if(hasAccess){
            auth.company(req, res, next);
        } else {
            return res.json({success: false, msg: 'Хандах эрхгүй.', uid: req.params.uid});
        }
    }, function(req, res){
        const { uid, size } = req.params || {};
        if(Number(size) > 0 && Number(size) <= mbToByte(3.5)){
            cover(req, res, function(err){
                if(err){winsErr(req, err, 'cover()');}
                if(req.file){
                    Jimp.read(req.file.path, function (err, image) {
                        let width = image.bitmap.width;
                        let height = image.bitmap.height;
                        const {maxWidth, maxHeight, aspectRatio} = coverPX;
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
                            else if(Number(parseFloat(width / height).toFixed(2)) !== aspectRatio)
                            {
                                fs.unlink(req.file.path, (err) => {
                                    if (err) {winsErr(req, err, 'fs.unlink');}
                                    return res.json({
                                        success: false,
                                        id: uid,
                                        msg: `Зургийн харьцаа ${aspectRatio}x1 (→ / 🠕 = ${aspectRatio}) байхыг анхаарна уу.`
                                    })
                                });
                            }
                            else
                            {
                                let dir = req.company._id + '/' + req.company.domain + '/' + moment().format('YYYY-MM-DD');
                                let aa = path.resolve(__dirname, "../static/images/" + dir);

                                fs.mkdir(aa, {recursive: true}, function (e) {
                                    let filename = '__cover__' + path.parse(req.file.originalname).name + '__' + new Date().getTime() + Math.ceil(Math.random() * 9) + '__' + path.extname(req.file.originalname);
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
                                            media.employee = req.employee._id;
                                            media.company = req.company._id;
                                            media.path = '/images/' + dir + '/' + filename;
                                            // media.thumbnail = '/images/' + dir + '/thum-' + req.file.filename;
                                            media.type = 'image';
                                            media.forWhat = 'cover';
                                            media.name = filename;
                                            media.original_name = req.file.originalname;
                                            media.url = config.url;
                                            media.imageWidth = width;
                                            media.imageHeight = height;
                                            media.size = req.file.size; // size: media.size
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
                                                        // Company.findOneAndUpdate({_id: req.company._id, status: 'active'}, {$set: {cover: savedMedia._id}}, function(){
                                                        //     return res.json({
                                                        //         success: !(err),
                                                        //         sucmod: !(err),
                                                        //         msg: err ? 'Ковер зураг солих үед алдаа гарлаа!' : 'Ковер амжилттай солигдлоо.',
                                                        //         id: uid,
                                                        //         image: sm
                                                        //     })
                                                        // })
                                                        return res.json({
                                                            success: !(err),
                                                            sucmod: !(err),
                                                            msg: err ? 'Ковер зураг солих үед алдаа гарлаа!' : 'Ковер амжилттай солигдлоо.',
                                                            id: uid,
                                                            image: sm
                                                        })
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
            return res.json({success: false, msg: 'Ковер 3.5MB - аас хэтэрсэн байна.', id: uid});
        }
    });
    router.post('/slider/upload/:uid/:size', function(req, res, next){
        let hasAccess = ((req.employee || {}).staticRole === 'chairman' || (req.employee || {}).staticRole === 'hrManager' || (req.employee || {}).staticRole === 'lord')
            || (((req.employee || {}).role || {}).actions || []).indexOf('edit_company_informations') > -1;
        if(hasAccess){
            auth.company(req, res, next);
        } else {
            return res.json({success: false, msg: 'Хандах эрхгүй.', uid: req.params.uid});
        }
    }, function(req, res){
        const { uid, size } = req.params || {};
        if(Number(size) > 0 && Number(size) <= mbToByte(3.5)){
            slider(req, res, function(err){
                if(err){winsErr(req, err, 'cover()');}
                if(req.file){
                    Jimp.read(req.file.path, function (err, image) {
                        let width = image.bitmap.width;
                        let height = image.bitmap.height;
                        const {maxWidth, maxHeight, aspectRatio} = sliderPX;
                        if (err) {
                            if(err){winsErr(req, err, 'Jimp.read');}
                            return res.json({
                                success: false,
                                uid: uid,
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
                            //             uid: uid,
                            //             msg: `Зургийн хэмжээ хамгийн ихдээ ${maxWidth}px(→) ${maxHeight}px(🠕) байнхыг анхаарна уу.`
                            //         })
                            //     });
                            // }
                            else if(Number(parseFloat(width / height).toFixed(2)) !== aspectRatio)
                            {
                                fs.unlink(req.file.path, (err) => {
                                    if (err) {winsErr(req, err, 'fs.unlink');}
                                    return res.json({
                                        success: false,
                                        uid: uid,
                                        msg: `Зургийн харьцаа ${aspectRatio}x1 (→ / 🠕 = ${aspectRatio}) байхыг анхаарна уу.`
                                    })
                                });
                            }
                            else
                            {
                                let dir = req.company._id + '/' + req.company.domain + '/' + moment().format('YYYY-MM-DD');
                                let aa = path.resolve(__dirname, "../static/images/" + dir);
                                Company.findOne({_id: (req.company || {})._id}, function(err, comp){
                                    if(err){winsErr(req, err, 'Company.findOne');}
                                    if(comp){
                                        if((comp.slider || []).length >= 10){
                                            fs.unlink(req.file.path, (err) => {
                                                if(err){winsErr(req, err, 'Company.findOne()->fs.unlink');}
                                                return res.json({success: false, msg: 'Зургийн цомог дээд тал нь 10 зураг орох ёстой.'});
                                            })
                                        } else {
                                            fs.mkdir(aa, {recursive: true}, function (e) {
                                                let filename = '__slider__' + path.parse(req.file.originalname).name + '__' + new Date().getTime() + Math.ceil(Math.random() * 9) + '__' + path.extname(req.file.originalname);
                                                let out = aa + '/' + filename;
                                                image.write(out, function (er, img) {
                                                    if (er) {
                                                        winsErr(req, er, 'image.write');
                                                        fs.unlink(req.file.path, (err) => {
                                                            if (err) {winsErr(req, err, 'image.write->fs.unlink');}
                                                            return res.json({success: false, uid: uid, msg: 'Зураг хадгалалт амжилтгүй'})
                                                        });
                                                    } else {
                                                        let media = new Media();
                                                        media.user = req.user._id;
                                                        media.employee = req.employee._id;
                                                        media.company = req.company._id;
                                                        media.path = '/images/' + dir + '/' + filename;
                                                        // media.thumbnail = '/images/' + dir + '/thum-' + req.file.filename;
                                                        media.type = 'image';
                                                        media.forWhat = 'slider';
                                                        media.name = filename;
                                                        media.original_name = req.file.originalname;
                                                        media.url = config.url;
                                                        media.imageWidth = width;
                                                        media.imageHeight = height;
                                                        media.size = req.file.size; // size: media.size
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
                                                                    comp.update({$push: {slider: savedMedia._id}}, function(){
                                                                        return res.json({
                                                                            success: !(err),
                                                                            sucmod: !(err),
                                                                            msg: err ? 'Зураг нэмэх үед алдаа гарлаа!' : 'Зураг амжилттай нэмэгдлээ.',
                                                                            uid: uid,
                                                                            slider: sm
                                                                        })
                                                                    });
                                                                } else {
                                                                    fs.unlink(path.resolve(__dirname, '../static/images/'+ dir + '/' + filename), (err) => {
                                                                        if (err) {winsErr(req, err, 'media.save->fs.unlink');}
                                                                        return res.json({success: false, uid: uid, msg: 'Зураг хадгалалт амжилтгүй'})
                                                                    });
                                                                }
                                                            });
                                                        });
                                                    }
                                                });
                                            });
                                        }
                                    } else {
                                        return res.json({success: false, msg: 'Нэвтрэх шаардлагатай!'});
                                    }
                                });
                            }
                        }
                    });
                } else {
                    return res.json({success: false, msg: 'Файл олдсонгүй.', uid: uid});
                }
            });
        } else {
            return res.json({success: false, msg: 'Зураг 3.5MB - аас хэтэрсэн байна.', uid: uid});
        }
    });
    router.post('/remove/slider', function(req, res, next){
        let hasAccess = ((req.employee || {}).staticRole === 'chairman' || (req.employee || {}).staticRole === 'hrManager' || (req.employee || {}).staticRole === 'lord')
            || (((req.employee || {}).role || {}).actions || []).indexOf('edit_company_informations') > -1;
        if(hasAccess){
            auth.company(req, res, next);
        } else {
            return res.json({success: false, msg: 'Хандах эрхгүй.', uid: req.params.uid});
        }
    }, function(req, res){
        const { _id, uid } = req.body || {};
        Company.findOneAndUpdate({_id: req.company._id, status: 'active'}, {$unset: {slider: _id}}, {}, function(err, comp){
            if(err){winsErr(req, err, 'Company.findOneAndUpdate')}
            return res.json({success: !(err), sucmod: !(err), uid: uid, _id: _id, msg: err ? 'Зураг хасхад алдаа гарлаа.' : 'Зураг устлаа'});
        })
    });
    router.post('/pdf/upload/:uid/:size', function(req,res,next){
        let hasAccess = ((req.employee || {}).staticRole === 'lord' || (req.employee || {}).staticRole === 'hrManager' || (req.employee || {}).staticRole === 'chairman')
            || (((req.employee || {}).role || {}).actions || []).indexOf('edit_violation_employee') > -1;
        if(hasAccess){
            auth.company(req, res, next);
        } else {
            return res.json({success: false, msg: 'Хандах эрхгүй.', uid: req.params.uid});
        }
    }, function (req, res) {
        let dir = req.company._id + '/' + req.company.domain + '/' + moment().format('YYYY-MM-DD');
        pdf(req, res, function (err) {
            if (err) {
                winston.error('/pdf/upload error', err);
                if (err.code == 'LIMIT_FILE_SIZE') {
                    return res.json({
                        success: false,
                        id: req.body.id,
                        msg: 'log.file_size'
                    });
                } else {
                    return res.json({
                        success: false,
                        id: req.body.id,
                        msg: 'log.sys_err'
                    });
                }
            }
            if (req.file) {
                let filename = '__pdf__' + path.parse(req.file.originalname).name + '__' + new Date().getTime() + Math.ceil(Math.random() * 9) + '__' + path.extname(req.file.originalname);
                let media = new Media();
                    media.path = '/files/' + dir + '/' + filename;
                    media.name = filename;
                    media.url = config.url;
                    media.type = "pdf";
                    media.forWhat = 'employee';
                    media.company = req.company._id;
                    media.employee = req.employee._id;
                    media.original_name = req.file.originalname;
                    media.size = req.file.size;
                    media.user = req.user._id;
                    media.save(function (err) {
                        if(err) {
                            return res.json({success:false, id: req.body.id, msg: 'log.sys_err'});
                        } else {
                            return res.json({success: true, id: req.body.id, result: media});
                        }
                    });
            } else {
                return res.json({success: false, id: req.body.id, msg: 'log.file_only'});
            }

        });
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