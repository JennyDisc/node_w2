const headers = require("./headers");
function successHandle(res, newPost) {
    res.writeHead(200, headers);
    res.write(JSON.stringify({
        "status": "success",
        "data": newPost
    }));
    res.end();
};

module.exports = successHandle;