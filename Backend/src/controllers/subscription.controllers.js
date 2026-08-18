import mongoose, { isValidObjectId } from "mongoose"
import { User } from "../models/users.models.js"
import { Subscription } from "../models/subscription.models.js"
import { APIError } from "../utils/APIError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    //1. get the id
    const { channelId } = req.params;

    //check if the channel id exits
    if (!isValidObjectId(channelId)) {
        throw new APIError(400, "Invalid channel id")
    }

    //check it is yourself
    if (channelId === req.user?._id.toString()) {
        throw new APIError(400, "You cannot subscribe to yourself")
    }

    //find subscription
    const subscription = await Subscription.findOne({
        channel: channelId,
        subscriber: req.user._id
    });

    if (subscription) {
        //if subscription exists, delete it
        await subscription.deleteOne();
    } else {
        //if subscription does not exist, create it
        await Subscription.create({
            channel: channelId,
            subscriber: req.user._id
        })
    }

    //send response 
    return res.status(200)
        .json(
            new ApiResponse(200, {}, "Subscription toggled successfully")
        )
})


const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    //1. get the channel id
    const { channelId } = req.params

    //2. validate the channel id
    if (!isValidObjectId(channelId)) {
        throw new APIError(400, "Invalid channel id")
    }

    //3. check channel exists
    const channel = await User.findById(channelId);

    if (!channel) {
        throw new APIError(404, "Channel not found")
    }

    //find all subscriber use populate to get the subscriber details
    const subscribers = await Subscription.find({
        channel: channelId
    }).populate({
        path: "subscriber",
        select: "avatar fullName username"
})


    //return response
    return res.status(200).json(
        new ApiResponse(200, subscribers, "Subscribers fetched successfully")
    )

})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    //1. get the subscriber id
    const { subscriberId } = req.params

    //2. valid id
    if (!isValidObjectId(subscriberId)) {
        throw new APIError(400, "channel id is invalid")
    }

    //3. check user exists
    const user = await User.findById(subscriberId);

    if (!user) {
        throw new APIError(404, "user does not exists")
    }

    //find their subscription through populate
    const channels = await Subscription.find(
        {
            subscriber: subscriberId
        }
    ).populate("channel");

    //return response
    return res.status(200)
        .json(
            new ApiResponse(200, channels, "subscribed channel fetched successfully")
        )
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}