import Media from "../model/media.model.js";
import { deleteMediaFromCloudinary } from "../utils/cloudinary.js";
import logger from "../utils/logger.js"

export const handlePostDelete = async(event)=>{
    console.log(event ,  "EVENTPOSTEVENTPOST")
    try {
        const { postId, mediaIds  } = event;

        const mediaToDelete = await Media.find({_id: {$in: mediaIds}})

        for( let media of mediaToDelete){
            await deleteMediaFromCloudinary(media.publicId)
            await Media.findByIdAndDelete(media._id)

            logger.info("Media deleted successFully form cloudinary & db ", media.publicId, media._id);
        }

        logger.info("process deletion completed of", postId)

    } catch (error) {
        logger.error("Error deleting media ", error);
    }
}