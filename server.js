const http = require("http");
const mongoose = require("mongoose");
const Post = require("./models/post");

// 模組
const headers = require("./headers");
const errorHandle = require("./errorHandle");
const successHandle = require("./successHandle");

const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
// console.log(process.env.PORT);

const DB = process.env.DATABASE.replace(
    "<password>",
    process.env.DATABASE_PASSWORD
);

// 連接 mongodb 的 DB 這個資料庫
mongoose.connect(DB)
    .then(() => {
        console.log('資料庫連線成功')
    }).catch((error) => {
        console.log(error)
    });

// schema 開始 

// 內容放在根目錄/models/post.js

// schema 結束

// 定義 HTTP 請求的回調函式，處理每一個進入的 HTTP 請求
const requestListener = async (req, res) => {
    let body = '';
    req.on('data', (chunk) => {
        // console.log(data);
        body += chunk;
    });
    if (req.url == '/posts' && req.method == 'GET') {
        const posts = await Post.find();
        res.writeHead(200, headers);
        res.write(JSON.stringify({
            "status": "success",
            posts
        }));
        res.end();
    } else if (req.url == '/posts' && req.method == 'POST') {
        req.on('end', async () => {
            try {
                const data = JSON.parse(body);
                if (data.content !== undefined) {
                    const newPost = await Post.create(
                        {
                            name: data.name,
                            location: data.location,
                            type: data.type,
                            tags: data.tags,
                            content: data.content,
                            image: data.image,
                            likes: data.likes
                        }
                    );
                    successHandle(res, newPost);
                } else {
                    const message = "欄位未填寫正確，或無該筆貼文 id";
                    errorHandle(res, message);
                }
            } catch (error) {
                const message = error;
                errorHandle(res, message);
            };
        })
    } else if (req.url == '/posts' && req.method == 'DELETE') {
        await Post.deleteMany();
        res.writeHead(200, headers);
        res.write(JSON.stringify({
            "status": "success",
            "message": "已刪除全部貼文"
        }));
        res.end();
    } else if (req.url.startsWith('/posts/') && req.method == 'DELETE') {
        const id = req.url.split('/').pop();
        const idResult = await Post.findByIdAndDelete(id);
        // 找到可刪除的會回傳那筆的物件內容。找不到可刪除的則回傳 null
        // console.log(idResult);
        if (idResult !== null) {
            res.writeHead(200, headers);
            res.write(JSON.stringify({
                "status": "success",
                "data": null
            }));
            res.end();
        } else {
            const message = '查無該筆貼文 id';
            errorHandle(res, message);
        };
    } else if (req.url.startsWith('/posts/') && req.method == 'PATCH') {
        req.on('end', async () => {
            try {
                const data = JSON.parse(body);
                console.log(data);
                const id = req.url.split("/").pop();
                const idResult = await Post.findById(id);
                // 找到這筆 id 會回傳那筆的物件內容。找不到則回傳 null
                // console.log(idResult);
                if (data.content !== "" && idResult !== null) {
                    await Post.findByIdAndUpdate(
                        id,
                        {
                            name: data.name,
                            location: data.location,
                            type: data.type,
                            tags: data.tags,
                            content: data.content,
                            image: data.image,
                            likes: data.likes
                        }
                    );
                    successHandle(res, data);
                } else {
                    const message = '查無該筆貼文內容或 id 屬性';
                    errorHandle(res, message);
                };
            } catch (error) {
                const message = '查無該筆貼文 id';
                errorHandle(res, message);
            };
        });
    }
    // 預檢請求
    else if (req.url == '/posts' && req.method == 'OPTIONS') {
        res.writeHead(200, headers);
        res.end();
    } else {
        res.writeHead(404, headers);
        res.write(JSON.stringify({
            "status": "false",
            "message": "not found pages"
        }));
        res.end();
    };
};
// 建立 HTTP 伺服器
const server = http.createServer(requestListener);
// 設定伺服器通訊埠號
server.listen(process.env.PORT);