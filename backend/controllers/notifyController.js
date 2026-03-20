const ETypeNotify = require('../../shared/enums/ETypeNotify');
const Notify = require('../models/Notify');
const Song = require('../models/Song');
const Album = require('../models/Album');
const PlayList = require('../models/Playlist');
const User = require('../models/User');

const createNotify = async (req, res) => {  
    try {
        const { userId, objectId, content, type } = req.body;
        const foundUser = await User.findById({_id: userId});
        if (!foundUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        let foundObject;
        if(type === ETypeNotify.COMMENT || type === ETypeNotify.NEW_SONG || type === ETypeNotify.LIKE) {
            foundObject = await Song.findById({_id: objectId});
            if (!foundObject) {
                return res.status(404).json({ message: 'Song not found' });
            }
        } else if (type === ETypeNotify.NEW_ALBUM){
            foundObject = await Album.findById({_id: objectId});
            if (!foundObject) {
                return res.status(404).json({ message: 'Album not found' });
            }
        } else if (type === ETypeNotify.NEW_PLAYLIST){
            foundObject = await PlayList.findById({_id: objectId});
            if (!foundObject) {
                return res.status(404).json({ message: 'Album not found' });
            }
        } else if (type === ETypeNotify.FOLLOW){
            foundObject = await User.findById({_id: objectId});
            if (!foundObject) {
                return res.status(404).json({ message: 'User Object not found' });
            }
        }

        const newNotify = new Notify({
            user: foundUser,
            type: type,
            object: foundObject,
            content: content,
        });
        
        const savedNotify = await newNotify.save();
        res.status(201).json(savedNotify);
    } catch (error) {
        return res.status(500).json({ msg: error.message });
    }
}

const createNotifies = async (req, res) => {
    try {
        const savedNotifies = [];
        const { users, type, objectId, content } = req.body;

        // Tìm object (Song hoặc Album) trước khi tạo notify
        let foundObject;
        if(type === ETypeNotify.COMMENT || type === ETypeNotify.NEW_SONG || type === ETypeNotify.LIKE) {
            foundObject = await Song.findById({_id: objectId});
            if (!foundObject) {
                return res.status(404).json({ message: 'Song not found' });
            }
        } else if (type === ETypeNotify.NEW_ALBUM) {
            foundObject = await Album.findById({ _id: objectId });
            if (!foundObject) {
                return res.status(404).json({ message: 'Album not found' });
            }
        } else if (type === ETypeNotify.NEW_PLAYLIST){
            foundObject = await PlayList.findById({_id: objectId});
            if (!foundObject) {
                return res.status(404).json({ message: 'Album not found' });
            }
        } else if (type === ETypeNotify.FOLLOW){
            foundObject = await User.findById({_id: objectId});
            if (!foundObject) {
                return res.status(404).json({ message: 'User Object not found' });
            }
        }

        // Tạo notify cho từng user
        for (const userId of users) {
            const foundUser = await User.findById(userId);
            if (!foundUser) {
                return res.status(404).json({ message: `User with ID ${userId} not found` });
            }

            const newNotify = new Notify({
                user: foundUser,
                type: type,
                object: foundObject,
                content: content,
            });

            const savedNotify = await newNotify.save();
            savedNotifies.push(savedNotify);
        }

        res.status(201).json(savedNotifies);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: error.message });
    }
};



const removeNotify = async (req, res) => {
    try {
        await Notify.findByIdAndDelete(req.params._id);
        res.json({ msg: 'Remove notify successfully' });
    } catch (error) {
        return res.status(500).json({ msg: error.message });
    }
}

const getNotifies = async (req, res) => {
    try {
        const notifies = await Notify.find({ user: req.params._id });
        res.json(notifies);
    } catch (error) {
        return res.status(500).json({ msg: error.message });
    }
}

const isReadNotify = async (req, res) => {
    try {
        await Notify.findOneAndUpdate({ _id: req.params._id }, {
            isRead: true
        });
        res.json({ msg: 'Mark as read' });
    }
    catch (error) {
        return res.status(500).json({ msg: error.message });
    }
}

const getNotifyByUserId = async (req, res) => {
    try {
        const { userId } = req.params;  // Lấy userId từ tham số đường dẫn
        const notifies = await Notify.find({ user: userId });  // Truy vấn thông báo của người dùng
        
        if (!notifies || notifies.length === 0) {
            return res.status(404).json({ message: 'No notifications found for this user' });
        }
        
        res.json(notifies);  // Trả về thông báo
    } catch (error) {
        return res.status(500).json({ msg: error.message });
    }
}

module.exports = { getNotifyByUserId };


module.exports = { createNotify, createNotifies, removeNotify, getNotifies, isReadNotify, getNotifyByUserId };
