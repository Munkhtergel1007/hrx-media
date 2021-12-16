const winston = require('winston');
let actions = require('./hrx_actions.json');

module.exports = {
    domain:'https://cdn.tatatunga.mn',
    local_domain:'http://cdn.hrx.com',
    jwt_secret:'KDrL5JEaHklA3e9TjJSNaZXQGapZTRZh',
    actions: actions,
    isId: function(id){
        let checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");
        return checkForHexRegExp.test(id) ? id : null;
    },
    isValidDate: function(dateObject){
        return new Date(dateObject).toString() !== 'Invalid Date';
    },
    winsErr: function(req = {}, err, func = ''){
        return winston.error(req.originalUrl + `    ---->    ${func}`, err);
    },
    string: function(string){
        return String(string || '').replace(/(<([^>]+)>)/gi, "");
    },
    bool: function(variable){
        return (typeof variable !== 'boolean' ? false : variable);
    },
    actionsArray: function () {
        let keys = Object.keys(actions);
        return keys.map((c) => {
            return {key: c, value: actions[c]};
        });
    },
    actionsKeys: function () {
        let keys = Object.keys(actions);
        return keys.map((c) => c);
    },
    uuid: function(){
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            let r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    },
    mbToByte: function(mb = 0){
        return Number(mb) * 1024 * 1024;
    },
    avatarPX: {
        maxWidth: 400,
        maxHeight: 400,
    },
    logoPX: {
        maxWidth: 200,
        maxHeight: 200,
        aspectRatio: 1, // 1:1
    },
    coverPX: {
        maxWidth: 1466,
        maxHeight: 768,
        aspectRatio: 1.91, // 1.91:1
    },
    sliderPX: {
        maxWidth: 1466,
        maxHeight: 768,
        aspectRatio: 1.91, // 1.91:1
    },
};