let mobj = {
    auth: function(req, res, next) {
        if(req.user){
            next();
        }else{
            return res.status(400).json({message: 'Хандах эрхгүй байна'});
        }
    },
    company: function(req, res, next, checkIn = false) {
        if(req.user && req.employee && req.company){
            if(checkIn){
                return true;
            } else {
                next();
            }
        }else{
            if(checkIn){
                return false;
            } else {
                return res.status(400).json({message: 'Хандах эрхгүй байна'});
            }
        }
    },
    admin: function(req, res, next) {
        if(req.admin){
            next();
        }else{
            return res.status(400).json({message: 'Хандах эрхгүй байна'});
        }
    },
    checkSize: function(req, res, next) {
        if(mobj.company(req, res, next, true)){
            let freeSize = Number(req.freeSize || 0);
            let usedSize = Number(req.usedSize || 0);
            let fileSize = Number(req.fileSize || 0);
            let size = Number(req.params.size);
            console.log({freeSize, usedSize, fileSize, size});
            if((usedSize + size) <= fileSize){
                next();
            } else {
                return res.json({success: false, msg: `Уучлаарай таны FileSize хүрэлцэхгүй байна. Үлдэгдэл FileSize / ${parseFloat((freeSize / 1024) / 1024).toFixed(3)}GB /`});
            }
        } else {
            return res.status(400).json({message: 'Хандах эрхгүй байна'});
        }
    },
};
module.exports = mobj;