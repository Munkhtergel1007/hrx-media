import express from 'express';
import media_routers from "./media_routers";
import media_routers_user from "./media_routers_user";

module.exports = function(app) {

    const mediaRouter = express.Router();
    media_routers(mediaRouter);
    app.use('/:company/api',mediaRouter);

    const mediaRouterUser = express.Router();
    media_routers_user(mediaRouterUser);
    app.use('/:company/api',mediaRouterUser);

    // app.get(['/:company/*', '/:company', '/'], function (req, res) {
    //     return res.send('tatatunga.mn media streaming...')
    // });

    app.get('/', function (req, res) {
        return res.send('TATATUNGA Media Server')
    });
};