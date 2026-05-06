import User from "../models/User.js";
import ConnectToken from "../models/ConnectToken.js";
import crypto from "crypto";
import Notification from "../models/Notification.js";

export const sendFriendRequest = async (req, res) => {
  try {
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    if (senderId.toString() === receiverId) {
      return res.status(400).json({ message: "You cannot add yourself" });
    }

    const receiver = await User.findById(receiverId);
    const sender = await User.findById(senderId);

    if (!receiver) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if receiver has blocked the sender
    if (receiver.blockedUsers.includes(senderId)) {
      return res.status(400).json({ message: "You cannot add this user" });
    }

    // Check if already friends
    if (sender.friends.includes(receiverId)) {
      return res.status(400).json({ message: "You are already friends" });
    }

    // Check if request already sent
    if (sender.sentRequests.includes(receiverId)) {
      return res.status(400).json({ message: "Request already sent" });
    }

    // Check if already received request from them (if so, just accept?)
    // For now, let's enforce accepting the existing request
    if (sender.friendRequests.includes(receiverId)) {
      return res.status(400).json({ message: "They already sent you a request. Please accept it." });
    }

    // Update arrays
    await User.findByIdAndUpdate(senderId, { $push: { sentRequests: receiverId } });
    await User.findByIdAndUpdate(receiverId, { $push: { friendRequests: senderId } });

    const notification = await Notification.create({
      receiver:receiverId,
      sender:req.user._id,
      type:"friend_request"
    });

    // Emit socket event for new notification
    const receiverSocketIds = globalThis.userSocketMap && globalThis.userSocketMap[receiverId];
    if (receiverSocketIds && globalThis.io) {
      const populatedNotification = await Notification.findById(notification._id).populate("sender","fullName profilePic");
      receiverSocketIds.forEach(socketId => {
        globalThis.io.to(socketId).emit("newNotification", populatedNotification);
      });
    }

    res.status(200).json({ success: true, message: "Friend request sent" });
  } catch (error) {
    console.error("Error in sendFriendRequest:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const acceptFriendRequest = async (req, res) => {
  try {
    const { id: senderId } = req.params;
    const receiverId = req.user._id;

    const receiver = await User.findById(receiverId);
    
    if (!receiver.friendRequests.includes(senderId)) {
      return res.status(400).json({ message: "No request from this user" });
    }

    // Add to friends, remove from requests
    await User.findByIdAndUpdate(receiverId, {
      $push: { friends: senderId },
      $pull: { friendRequests: senderId }
    });

    await User.findByIdAndUpdate(senderId, {
      $push: { friends: receiverId },
      $pull: { sentRequests: receiverId }
    });

    res.status(200).json({ success: true, message: "Friend request accepted" });
  } catch (error) {
    console.error("Error in acceptFriendRequest:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const rejectFriendRequest = async (req, res) => {
  try {
    const { id: senderId } = req.params;
    const receiverId = req.user._id;

    await User.findByIdAndUpdate(receiverId, {
      $pull: { friendRequests: senderId }
    });

    await User.findByIdAndUpdate(senderId, {
      $pull: { sentRequests: receiverId }
    });

    res.status(200).json({ success: true, message: "Friend request rejected" });
  } catch (error) {
    console.error("Error in rejectFriendRequest:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const unfriend = async (req, res) => {
  try {
    const { id: friendId } = req.params;
    const myId = req.user._id;

    await User.findByIdAndUpdate(myId, { $pull: { friends: friendId } });
    await User.findByIdAndUpdate(friendId, { $pull: { friends: myId } });

    res.status(200).json({ success: true, message: "Unfriended successfully" });
  } catch (error) {
    console.error("Error in unfriend:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const blockUser = async (req, res) => {
  try {
    const { id: targetId } = req.params;
    const myId = req.user._id;

    // Add to blocked users
    await User.findByIdAndUpdate(myId, { 
        $addToSet: { blockedUsers: targetId },
        $pull: { friends: targetId, friendRequests: targetId, sentRequests: targetId } 
    });
    
    // Also remove me from their friends/requests (optional, but cleaner)
    await User.findByIdAndUpdate(targetId, {
        $pull: { friends: myId, friendRequests: myId, sentRequests: myId }
    });

    res.status(200).json({ success: true, message: "User blocked" });
  } catch (error) {
    console.error("Error in blockUser:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const unblockUser = async (req, res) => {
  try {
    const { id: targetId } = req.params;
    const myId = req.user._id;

    await User.findByIdAndUpdate(myId, { $pull: { blockedUsers: targetId } });

    res.status(200).json({ success: true, message: "User unblocked" });
  } catch (error) {
    console.error("Error in unblockUser:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const generateQrToken = async (req, res) => {
  try {
    const ownerId = req.user._id;
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await ConnectToken.create({ token, ownerId, expiresAt });
    res.status(200).json({ success: true, token, expiresAt });
  } catch (error) {
    console.error("Error in generateQrToken:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const consumeQrToken = async (req, res) => {
  try {
    const scannerId = req.user._id;
    const token = req.body.token || req.query.token;
    if (!token) {
      return res.status(400).json({ success: false, message: "Missing token" });
    }

    const record = await ConnectToken.findOne({ token });
    if (!record) {
      return res.status(400).json({ success: false, message: "Invalid or expired token" });
    }
    if (record.used) {
      return res.status(400).json({ success: false, message: "Token already used" });
    }
    if (record.expiresAt.getTime() < Date.now()) {
      return res.status(400).json({ success: false, message: "Token expired" });
    }
    if (record.ownerId.toString() === scannerId.toString()) {
      return res.status(400).json({ success: false, message: "Cannot connect to yourself" });
    }

    const owner = await User.findById(record.ownerId);
    const scanner = await User.findById(scannerId);
    if (!owner || !scanner) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    if (owner.blockedUsers.includes(scannerId) || scanner.blockedUsers.includes(owner._id)) {
      return res.status(403).json({ success: false, message: "Connection not allowed" });
    }

    await User.findByIdAndUpdate(scannerId, {
      $addToSet: { friends: owner._id },
      $pull: { friendRequests: owner._id, sentRequests: owner._id },
    });
    await User.findByIdAndUpdate(owner._id, {
      $addToSet: { friends: scannerId },
      $pull: { friendRequests: scannerId, sentRequests: scannerId },
    });

    // Create a notification for the QR owner that someone connected
    const notification = await Notification.create({
      receiver: owner._id,
      sender: scannerId,
      type: "info",
      content: `${scanner.fullName} connected with you via QR!`
    });

    // Emit socket event to owner
    const ownerSocketIds = globalThis.userSocketMap && globalThis.userSocketMap[owner._id];
    if (ownerSocketIds && globalThis.io) {
      const populatedNotification = await Notification.findById(notification._id).populate("sender", "fullName profilePic");
      ownerSocketIds.forEach(socketId => {
        globalThis.io.to(socketId).emit("newNotification", populatedNotification);
      });
    }

    record.used = true;
    record.usedAt = new Date();
    await record.save();

    const friend = await User.findById(owner._id).select("-password");
    res.status(200).json({ success: true, friend, message: "Connected successfully!" });
  } catch (error) {
    console.error("Error in consumeQrToken:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
