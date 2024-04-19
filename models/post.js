const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, '貼文姓名未填寫']
        },
        // 新增欄位
        location: {
            type: String,
            required: [true, '發文所在地未填寫'],
            select: false
        },
        type: {
            type: String,
            enum: ['group', 'person'],
            required: [true, '貼文類型未填寫']
        },
        tags: {
            type: String,
            required: [true, '貼文標籤未填寫'],
        },
        content: {
            type: String,
            required: [true, 'Content 未填寫']
        },
        image: {
            type: String,
            default: ""
        },
        createdAt: {
            type: Date,
            default: Date.now,
            // select: false
        },
        likes: {
            type: Number,
            default: 0
        }
    },
    {
        versionKey: false,
    }
);

// 建立 model
const Post = mongoose.model('post', postSchema);

module.exports = Post;
