export const inlvalidateSinglePostCache = async (redisClient, id) => {
  try {
    const key = `post:${id}`;
    const cachePost = await redisClient.get(key)
    await redisClient.del(key);
    return true;
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const inlvalidateAllPostCache = async (redisClient) => {
  try {
    const keys = await redisClient.keys("posts:*");
    if (keys.length > 0) {
      await redisClient.del(keys);
      return true;
    }
  } catch (error) {
    console.log(error);
    return error;
  }
};
