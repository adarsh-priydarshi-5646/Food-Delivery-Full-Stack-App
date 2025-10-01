import User from "../models/user.model.js";

export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(400).json({ message: "userId is not found" });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: "user is not found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: `get current user error ${error}` });
  }
};

export const updateUserLocation = async (req, res) => {
  try {
    const { lat, lon } = req.body;
    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        location: {
          type: "Point",
          coordinates: [lon, lat],
        },
      },
      { new: true }
    );
    if (!user) {
      return res.status(400).json({ message: "user is not found" });
    }

    return res.status(200).json({ message: "location updated" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `update location user error ${error}` });
  }
};

export const updateBankDetails = async (req, res) => {
  try {
    const { accountHolderName, accountNumber, ifscCode, bankName, upiId } = req.body;
    
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "owner") {
      return res.status(403).json({ message: "Only restaurant owners can add bank details" });
    }

    user.bankDetails = {
      accountHolderName: accountHolderName || user.bankDetails.accountHolderName,
      accountNumber: accountNumber || user.bankDetails.accountNumber,
      ifscCode: ifscCode || user.bankDetails.ifscCode,
      bankName: bankName || user.bankDetails.bankName,
      upiId: upiId || user.bankDetails.upiId,
    };

    await user.save();

    return res.status(200).json({ 
      message: "Bank details updated successfully",
      bankDetails: user.bankDetails 
    });
  } catch (error) {
    return res.status(500).json({ message: `update bank details error ${error}` });
  }
};

export const getBankDetails = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ 
      bankDetails: user.bankDetails,
      totalEarnings: user.totalEarnings 
    });
  } catch (error) {
    return res.status(500).json({ message: `get bank details error ${error}` });
  }
};
