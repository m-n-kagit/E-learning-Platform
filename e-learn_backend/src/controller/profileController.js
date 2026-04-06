import User from "../models/User.js";

const isEqualValue = (a, b) => JSON.stringify(a) === JSON.stringify(b);

const updateDetails = async (req, res, next) => { //to get user 
  //details 
  try {
    const updates = req.body || {};
    const user = await User.findById(req.user._id); // Find the user by ID from the request (assuming req.user is populated by authentication middleware)

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    Object.entries(updates).forEach(([key, incomingValue]) => {
        if (incomingValue === undefined || !(key in user)) return;
        if (!isEqualValue(user[key], incomingValue)) {
          user[key] = incomingValue;
        }
      });

    await user.save();

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        bio: user.bio,
        location: user.location,
        profilePicture: user.profilePicture,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

export { updateDetails };
