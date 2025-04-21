import Post from "../models/post.model.js";
import { inlvalidateAllPostCache } from "../utils/invalidateCahe.js";
import logger from "../utils/logger.js";
import { publishEvent } from "../utils/rabbitMq.js";

export const createPost = async (req, res) => {
  try {
    const { content, mediaIds } = req.body;
    const userId = req.user.userId;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: "content is required",
      });
    }
    const newlyCreatedPost = new Post({
      user: userId,
      content: content,
      mediaIds: mediaIds || [],
    });

    await newlyCreatedPost.save();
    await inlvalidateAllPostCache(req.redisClient);

    return res.status(200).json({
      success: true,
      message: "post created SuccessFully",
      data: newlyCreatedPost,
    });
  } catch (error) {
    logger.error(error.message);
    return res.status(400).json({
      success: false,
      message: `Error creating post : ${error.message}`,
    });
  }
};

export const getAllPosts = async (req, res) => {
  try {
    //  get the page, limit and start index
    //  check if there is cache exist in memory
    // if cache dosn't exists and req the db
    // save the cache in memory
    // return the data

    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    // start index of post
    const index = (page - 1) * limit;

    // cashed key to store cache
    const chashedKey = `posts:page:${page}`;

    const cashedData = await req.redisClient.get(chashedKey);
    if (cashedData) {
      return res.status(201).json({
        success: true,
        data: JSON.parse(cashedData),
      });
    }

    const result = await Post.find({})
      .sort({ createdAt: -1 })
      .skip(index)
      .limit(limit);

    // store data in to the redis cashe
    await req.redisClient.set(
      chashedKey,
      JSON.stringify(result),
      "EX",
      60 * 10
    );

    res.status(200).json({
      success: true,
      posts: result,
    });
  } catch (error) {
    logger.error(error);
    return res.status(200).josn({
      message: `Failed to get Posts: ${error.message}`,
    });
  }
};

export const getData = async (req, res) => {
  return res.status(200).json({
    success: true,
    data: {},
  });
};

export const getPost = async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Please provide an  id ",
      });
    }

    const cachedKey = `post:${id}`;
    const cachedPost = await req.redisClient.get(cachedKey);

    if (cachedPost) {
      return res.status(200).json({
        success: true,
        data: JSON.parse(cachedPost),
      });
    }
    const post = await Post.findById(id);

    if (!post) {
      return res.status(400).json({
        success: false,
        message: "Invalid id ",
      });
    }

    const formattedData = JSON.stringify({
      _id: post._id,
      user: post.user,
      content: post.content,
      mediaIds: post.mediaIds,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    });
    await req.redisClient.set(cachedKey, formattedData, "EX", 60 * 10);
    return res.status(200).json({
      success: true,
      post: post,
    });
  } catch (error) {
    logger.error("Error in get post", error);
    return res.status(400).json({
      success: false,
      message: `"Failed to get Post", ${error.message}`,
    });
  }
};

// Todo : Complte these remaining methods

export const updatePost = async (req, res) => {
  try {
  } catch (error) {}
};

export const deletePost = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Please provide an id",
      });
    }
    const post =  await Post.findOneAndDelete({
      _id: id,
      user: req.user.userId,
    });

    if(!post){
      return res.status(400).json({
        success: false,
        message: "invalid id ",
      });
    }

    await publishEvent("post.deleted", {
      postId: id,
      userId: req.user.userId,
      mediaIds: post.mediaIds,
    });

    await inlvalidateAllPostCache(req.redisClient);
    return res.status(200).json({
      success: true,
      message: "Post deleted successfully",
      postid: id,
    });
  } catch (error) {
    logger.error("Errror in deleting post", error);
    return res.status(400).json({
      success: false,
      message: `Failed to delete post ${error.message}`,
    });
  }
};
