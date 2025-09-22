import express from "express";
import Jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { ContentModel, LinkModel, TagsModel, UserModel } from "./db.js";
import { JWT_PASSWORD } from "./config.js";
import { UserMiddleware } from "./middleware.js";
import { random } from "./utils.js";
import cors from "cors";
const app = express();
app.use(express.json());
app.use(cors());
dotenv.config();
app.post("/api/v1/signup", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    try {
        await UserModel.create({
            username: username,
            password: password
        });
        res.json({
            msg: "user is signed up"
        });
    }
    catch (e) {
        res.status(411).json({
            msg: "User already exists"
        });
    }
});
app.post("/api/v1/signin", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const existinguser = await UserModel.findOne({
        username,
        password
    });
    if (existinguser) {
        const token = Jwt.sign({
            id: existinguser._id,
        }, JWT_PASSWORD);
        res.json({
            token
        });
    }
    else {
        res.status(403).json({
            msg: "Incorrect Credentials"
        });
    }
});
app.post("/api/v1/content", UserMiddleware, async (req, res) => {
    const link = req.body.link;
    const type = req.body.type;
    const title = req.body.title;
    const tags = req.body.tags;
    if (!["youtube", "twitter", "document", "link"].includes(type)) {
        return res.status(400).json({ msg: "Invalid content type" });
    }
    let tagIds = [];
    if (tags && Array.isArray(tags)) {
        for (const tagTitle of tags) {
            let tag = await TagsModel.findOne({ title: tagTitle });
            if (!tag) {
                tag = await TagsModel.create({ title: tagTitle });
            }
            tagIds.push(tag._id);
        }
    }
    await ContentModel.create({
        link,
        type,
        title,
        tags: tagIds,
        //@ts-ignore
        userId: req.userId
    });
    res.json({
        msg: "Content is added",
    });
});
app.get("/api/v1/content", UserMiddleware, async (req, res) => {
    //@ts-ignore
    const userId = req.userId;
    const content = await ContentModel.find({
        userId: userId
    }).populate("userId", "username").populate("tags", "title");
    res.json({
        content
    });
});
app.get("/api/v1/tags", async (req, res) => {
    const tags = await TagsModel.find({});
    res.json({ tags });
});
app.delete("/api/v1/content", UserMiddleware, async (req, res) => {
    const ContentId = req.body.ContentId;
    const result = await ContentModel.deleteOne({
        _id: ContentId,
        //@ts-ignore
        userId: req.userId
    });
    if (result.deletedCount === 0) {
        return res.status(404).json({
            msg: "The content was not or not owned by the user"
        });
    }
    res.json({
        msg: "Content Was Deleted"
    });
});
app.post("/api/v1/brain/share", UserMiddleware, async (req, res) => {
    const share = req.body.share;
    if (share) {
        const existingLink = await LinkModel.findOne({
            //@ts-ignore
            userId: req.userId
        });
        if (existingLink) {
            res.json({
                hash: existingLink.hash
            });
            return;
        }
        const hash = random(10);
        await LinkModel.create({
            //@ts-ignore
            userId: req.userId,
            hash: hash
        });
    }
    else {
        await LinkModel.deleteOne({
            //@ts-ignore
            userId: req.userId
        });
        res.json({
            msg: "Remove Link"
        });
    }
});
app.get("/api/v1/brain/:shareLink", async (req, res) => {
    const hash = req.params.shareLink;
    const link = await LinkModel.findOne({
        hash
    });
    if (!link) {
        res.status(411).json({
            msg: "Sorry incorrect input"
        });
        return;
    }
    const content = await ContentModel.find({
        userId: link.userId
    });
    const user = await UserModel.findOne({
        _id: link.userId
    });
    if (!user) {
        res.status(411).json({
            msg: "user not found this error should idialy not happen"
        });
        return;
    }
    res.json({
        username: user.username,
        content: content
    });
});
app.listen(3000);
//# sourceMappingURL=index.js.map