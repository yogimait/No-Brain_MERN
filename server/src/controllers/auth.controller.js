import  asyncHandler  from "../utils/asyncHandler.js";
import ApiError  from  "../utils/ApiError.js";
import ApiResponse  from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { cryptoService } from "../utils/crypto.service.js";

// Generate tokens and set cookies
const generateTokensAndSetCookies = async (userId, res) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(404, "User not found");
        }

        console.log('Generating tokens for user:', user._id);
        console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
        console.log('JWT_REFRESH_SECRET exists:', !!process.env.JWT_REFRESH_SECRET);

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        // Save refresh token to database
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        // Set cookies
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict"
        };

        res.cookie("accessToken", accessToken, {
            ...cookieOptions,
            maxAge: 15 * 60 * 1000 // 15 minutes
        });

        res.cookie("refreshToken", refreshToken, {
            ...cookieOptions,
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        });

        return { accessToken, refreshToken };
    } catch (error) {
        console.error('Token generation error:', error.message);
        throw new ApiError(500, `Token generation failed: ${error.message}`);
    }
};

// Register user
const registerUser = asyncHandler(async (req, res) => {
    const { email, name, password } = req.body;

    if (!email || !name || !password) {
        throw new ApiError(400, "All fields are required");
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new ApiError(409, "User with this email already exists");
    }

    // Create user
    const user = await User.create({
        email: email.toLowerCase(),
        name,
        password
    });

    // Generate tokens
    await generateTokensAndSetCookies(user._id, res);

    // Return response without password
    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    res.status(201).json(
        new ApiResponse(201, createdUser, "User registered successfully")
    );
});

// Login user
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(400, "Email and password are required");
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
        throw new ApiError(401, "Invalid credentials");
    }

    // Check password
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid credentials");
    }

    // Generate tokens
    await generateTokensAndSetCookies(user._id, res);

    // Return response without password
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    res.status(200).json(
        new ApiResponse(200, loggedInUser, "User logged in successfully")
    );
});

// Logout user
const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    );

    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict"
    };

    res.clearCookie("accessToken", cookieOptions);
    res.clearCookie("refreshToken", cookieOptions);

    res.status(200).json(
        new ApiResponse(200, {}, "User logged out successfully")
    );
});

// Refresh token
const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.JWT_REFRESH_SECRET
        );

        const user = await User.findById(decodedToken?._id);
        if (!user || user.refreshToken !== incomingRefreshToken) {
            throw new ApiError(401, "Invalid refresh token");
        }

        await generateTokensAndSetCookies(user._id, res);

        res.status(200).json(
            new ApiResponse(200, {}, "Access token refreshed")
        );
    } catch (error) {
        throw new ApiError(401, "Invalid refresh token");
    }
});

// Add API key
const addAPIKey = asyncHandler(async (req, res) => {
    const { service, apiKey } = req.body;

    if (!service || !apiKey) {
        throw new ApiError(400, "Service name and API key are required");
    }

    // Encrypt the API key
    const encryptedKey = cryptoService.encryptAPIKey(apiKey);

    // Update user's apiKeysEncrypted map
    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                [`apiKeysEncrypted.${service}`]: encryptedKey
            }
        },
        { new: true }
    ).select("-password -refreshToken");

    res.status(200).json(
        new ApiResponse(200, user, `${service} API key added successfully`)
    );
});

// Get API key (decrypted for use)
const getAPIKey = asyncHandler(async (req, res) => {
    const { service } = req.params;

    const user = await User.findById(req.user._id);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const encryptedKey = user.apiKeysEncrypted.get(service);
    if (!encryptedKey) {
        throw new ApiError(404, `No API key found for ${service}`);
    }

    // Decrypt the API key
    const decryptedKey = cryptoService.decryptAPIKey(encryptedKey);

    res.status(200).json(
        new ApiResponse(200, { service, apiKey: decryptedKey }, `${service} API key retrieved`)
    );
});

// Get user profile
const getCurrentUser = asyncHandler(async (req, res) => {
    res.status(200).json(
        new ApiResponse(200, req.user, "User fetched successfully")
    );
});

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    addAPIKey,
    getAPIKey,
    getCurrentUser
};