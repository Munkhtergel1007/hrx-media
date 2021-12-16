import path from "path";
import mongoose from 'mongoose';
import winston from 'winston';
const env = process.env.NODE_ENV;
import useragent from "express-useragent";
import cookieParser from "cookie-parser";
import bodyparser from "body-parser";
import cors from "cors";
import User from "./models/User";
import express from "express";
import config from "./config";
import jwt from "jsonwebtoken";
import session from "express-session";
import psl from "psl";
import async from "async";
import Company from "./models/Company";
import Employee from "./models/Employee";
import {winsErr} from "./config";
import Admin from "./models/Admin";
import CompTrans from "./models/Company_Transaction";
import Roles from "./models/Roles";
import Media from "./models/Media";
require('./models/Timeline');

const app = express();

var configServer = {
    mongoUrl:'mongodb://103.143.40.220:27017/hrx',
    option: {
        "auth": { "authSource": "admin" },
        "user": "amjilt",
        "pass": "shijircom",
        "useMongoClient": true
    },
    logPath:path.resolve(__dirname,"logs")
};
app.use(session({
    resave: false,
    saveUninitialized: true,
    secret: 'hrx',
    cookie: { httpOnly: false, domain: process.env.NODE_ENV === 'development' ? `.hrx.com` : `.tatatunga.mn`}
}));
app.use(useragent.express());
app.use(cookieParser());
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());
app.set('view engine', 'pug');
app.set('views', path.resolve(__dirname,'../views'));
app.use('/', express.static(path.join(__dirname, './', 'static')));

winston.add(winston.transports.File, { filename: configServer.logPath+'/info.log', name: 'info-file',
    level: 'info'});
winston.add(winston.transports.File, { filename: configServer.logPath+'/error.log', name: 'error-file',
    level: 'error'});


app.use(cors());
app.set('view options', { charset: 'UTF-8' });


/*
* Check user and token
* */
app.use('/*', function(req, res, next){
    let token = req.body.token || req.query.token || req.headers['token'] || req.cookies.token;
    if (token) {
        jwt.verify(token, 'KDrL5JEaHklA3e9TjJSNaZXQGapZTRZh', function (err, decoded) {
            if (err) {
                next();
            } else {
                User.findOne({_id: decoded.id}, {password: 0}).lean().exec(function (err, user) {
                    if(user){
                        req.user = user;
                        next();
                        // Employee.findOne({_id: user._id}, {staticRole: 1, company: 1,}).lean().exec(function(err, emp){
                        //     if(emp){
                        //         console.log(emp);
                        //         req.employee = emp;
                        //         next();
                        //     }else{
                        //         next();
                        //     }
                        // })
                        // let token = jwt.sign({
                        //     id: user._id,
                        // }, 'KDrL5JEaHklA3e9TjJSNaZXQGapZTRZh', {
                        //     expiresIn: req.headers['isapp'] === 'yes' ? 86400000 : 60*60*24
                        // });
                        // let tokenConf = { hostOnly:false,domain:`.${req.domain}` };
                        // tokenConf.maxAge = 86400000;
                        // res.cookie('token',token, tokenConf);
                    } else {
                        next();
                    }
                });
            }
        });
    } else {
        next();
    }
});


/*
* Check company, employee and filesize
* */
app.use(['/:company/api/*', '/:company/api', '/'], function(req, res, next){
    let protocol = process.env.NODE_ENV === 'development' ? 'http://' : 'https://';
    let hostname = req.hostname;
    let parsed = psl.parse(hostname);
    let subdomain = req.params.company || null;
    req.domain = parsed.domain || 'hrx.com';
    req.subdomain = String(subdomain || null);
    if(
        req.subdomain
    ){
        Company.findOne({domain: req.subdomain, status: 'active'}).lean().exec(function(err, company){
            if(company){
                req.company = company;
                Employee.findOne({
                    company: company._id,
                    user: (req.user || {})._id,
                    $or: [
                        {status: {$eq: 'active'}},
                    ]
                }).sort({created: -1}).deepPopulate('role').lean().exec(function(err, emp){
                    if(err){winsErr(req, err, 'Employee.findOne()');}
                    if(emp){
                        req.employee = emp;
                        next();
                    } else {
                        return res.status(403).end();
                    }
                });
            } else {
                return res.status(401).end();
            }
        });
    } else {
        return res.status(401).end();
    }
});


const webRouter = express.Router();
require('./routers')(webRouter);
app.use(webRouter);

if(env === 'development') {
    mongoose.connect("mongodb://localhost:27017/hrx");
} else {
    mongoose.connect(configServer.mongoUrl, configServer.option);
}
mongoose.connection.on('open', function (ref) {
    winston.info('db connected');
    app.listen('8093',function (err) {
        if(err){
            winston.error('app start error');
            winston.error(err);
            process.exit(1)
        }else{
            winston.info('app started port: %s', '8093')
        }
    });
});
mongoose.connection.on('error',function (error) {
    winston.error(error);
});