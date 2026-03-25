const User = require("../models/User");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const { checkDocumentById } = require("../services/checkDocumentMiddleware");
const { generateAccessToken } = require("../services/jwt");
const { sendMail } = require("../utils/sendMail");

class UserController {
  // [GET] /user/:id
  getById = catchAsync(async (req, res) => {
    const user = await User.findOne({ _id: req.params.id });
    if (!user) {
      throw new AppError("User not found", 404);
    }
    res.status(200).json({ success: true, user });
  });

  // [GET] /user/name/:fullname
  getUserByName = catchAsync(async (req, res) => {
    const regex = new RegExp(req.params.fullname, "i");
    const users = await User.find({ fullname: regex, isBlocked: false });
    if (users.length === 0) {
      throw new AppError("No users found with this name", 404);
    }
    res.status(200).json({ success: true, users });
  });

  // [GET] /user/
  getAll = catchAsync(async (req, res) => {
    const queries = { ...req.query };
    const excludeFields = ["limit", "sort", "page", "fields"];
    excludeFields.forEach((el) => delete queries[el]);

    let queryString = JSON.stringify(queries);
    queryString = queryString.replace(/\b(gte|gt|lt|lte)\b/g, (matchedEl) => `$${matchedEl}`);
    const formatedQueries = JSON.parse(queryString);

    if (queries?.name) {
      formatedQueries.name = { $regex: queries.name, $options: "i" };
    }

    let queryCommand = User.find(formatedQueries);

    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      queryCommand = queryCommand.sort(sortBy);
    }

    if (req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");
      queryCommand = queryCommand.select(fields);
    }

    const page = +req.query.page || 1;
    const limit = +req.query.limit || 10;
    const skip = (page - 1) * limit;
    queryCommand = queryCommand.skip(skip).limit(limit).select("-password -role");

    const [users, counts] = await Promise.all([
      queryCommand.exec(),
      User.find(formatedQueries).countDocuments()
    ]);

    if (users.length === 0) {
      throw new AppError("No users found", 404);
    }

    res.status(200).json({
      success: true,
      counts,
      users,
      page,
      limit
    });
  });

  // [GET] /user/getUserToken
  getUserFromToken = catchAsync(async (req, res) => {
    const { _id } = req.user;
    const user = await User.findById(_id).select("-password");
    if (!user) {
      throw new AppError("User not found", 404);
    }
    res.status(200).json({ success: true, user });
  });

  // [POST] /user/register
  register = catchAsync(async (req, res) => {
    const { username, password, fullname, email, phone, gender, birthday, desc } = req.body;

    if (!username || !password || !fullname || !email || !phone || !gender || !birthday || !desc) {
      throw new AppError("Missing inputs", 400);
    }

    const existingUser = await User.findOne({
      $or: [{ username }, { email }]
    });

    if (existingUser) {
      throw new AppError("Username or email already exists", 400);
    }

    const user = new User(req.body);
    const savedUser = await user.save();

    res.status(200).json({
      success: true,
      message: "Create User successful",
      data: savedUser,
    });
  });

  // [PUT] /user/
  update = catchAsync(async (req, res) => {
    const { _id } = req.user;
    if (!_id || Object.keys(req.body).length === 0) {
      throw new AppError("Missing inputs", 400);
    }

    const updatedUser = await User.findByIdAndUpdate(_id, req.body, {
      new: true,
      runValidators: true
    }).select("-password -role");

    if (!updatedUser) {
      throw new AppError("User not found", 404);
    }

    res.status(200).json({
      success: true,
      message: "User update successful",
      updatedUser,
    });
  });

  // [PUT] /user/:uid
  updateByAdmin = catchAsync(async (req, res) => {
    const { uid } = req.params;
    if (Object.keys(req.body).length === 0) {
      throw new AppError("Missing inputs", 400);
    }

    const updatedUser = await User.findByIdAndUpdate(uid, req.body, {
      new: true,
      runValidators: true
    }).select("-password -role");

    if (!updatedUser) {
      throw new AppError("User not found", 404);
    }

    res.status(200).json({
      success: true,
      message: "User update successful",
      updatedUser,
    });
  });

  // [DELETE] /user/:id
  delete = catchAsync(async (req, res) => {
    const { id } = req.params;
    const check = await checkDocumentById(User, id);
    if (!check.exists) {
      throw new AppError(check.message, 400);
    }

    await User.delete({ _id: id });
    res.status(200).json({
      success: true,
      message: "Delete successful",
    });
  });

  // [DELETE] /user/:id/force
  forceDelete = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await User.deleteOne({ _id: id });
    if (result.deletedCount === 0) {
      throw new AppError("User not found", 404);
    }
    res.status(200).json({
      success: true,
      message: "Delete Force successful",
    });
  });

  // [PATCH] /user/:id/restore
  restore = catchAsync(async (req, res) => {
    const { id } = req.params;
    await User.restore({ _id: id });
    if (global.Cart) {
      await global.Cart.restore({ _id: id });
    }
    const restoredUser = await User.findById(id);
    if (!restoredUser) {
      throw new AppError("User not found", 404);
    }
    res.status(200).json({
      status: true,
      message: "Restored User",
      restoredUser,
    });
  });

  // [POST] /sendOTP/
  sendOTP = catchAsync(async (req, res) => {
    const { email, action } = req.query;
    const { username, phone } = req.body;

    if (!email) {
      throw new AppError("Missing inputs", 400);
    }

    const user = await User.findOne({ email });
    const name = await User.findOne({ username });

    if (action === "CreateAccount") {
      if (!phone || phone.length !== 10 || isNaN(phone)) {
        throw new AppError("Valid phone number is required", 400);
      }
      if (user) throw new AppError("User existed", 400);
      if (name) throw new AppError("Username existed", 400);
    }

    const otp_code = Math.floor(100000 + Math.random() * 900000).toString();
    const html = this.generateOTPEmail(otp_code);

    const data = { email, html };
    const result = await sendMail(action, data);

    res.status(200).json({ success: true, result, otp_code, action });
  });

  // [GET] /editProfileSendOTP/
  editProfileSendOTP = catchAsync(async (req, res) => {
    const { email, action } = req.query;
    if (!email) {
      throw new AppError("Missing inputs", 400);
    }

    const user = await User.findOne({ email });
    if (!user) throw new AppError("User not existed", 404);

    const otp_code = Math.floor(100000 + Math.random() * 900000).toString();
    const html = this.generateEditProfileOTPEmail(otp_code);

    const data = { email, html };
    const result = await sendMail(action, data);

    res.status(200).json({ success: true, result, otp_code, action });
  });

  // [GET] /resetPassword/:resetToken
  getResetToken = catchAsync(async (req, res) => {
    const resetToken = req.params.resetToken;
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      throw new AppError("Token is invalid or has expired", 400);
    }

    res.status(200).json({
      success: true,
      message: "Token is valid",
      resetToken,
    });
  });

  // [POST] /user/login
  login = catchAsync(async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      throw new AppError("Missing inputs", 400);
    }

    const user = await User.findOne({ username });
    if (!user) {
      throw new AppError("Invalid credentials", 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new AppError("Invalid credentials", 401);
    }

    const { password: _, ...userData } = user.toObject();
    const accessToken = generateAccessToken(user._id, user.role);

    res.status(200).json({
      success: true,
      accessToken,
      userData: { ...userData, role: user.role },
    });
  });

  // [POST] /user/current
  current = catchAsync(async (req, res) => {
    const { _id } = req.user;
    const user = await User.findById(_id).select("-password -role");
    if (!user) {
      throw new AppError("User not found", 404);
    }
    res.status(200).json({
      success: true,
      userData: user,
    });
  });

  // [PUT] /user/refreshAccessToken
  refreshAccessToken = catchAsync(async (req, res) => {
    const cert = fs.readFileSync("../key/publickey.crt");
    const cookie = req.cookies;

    return new Promise((resolve, reject) => {
      jwt.verify(
        cookie?.refreshToken,
        cert,
        { algorithms: ["RS256"] },
        async (err, data) => {
          if (err) {
            return reject(new AppError(err.message, 401));
          }
          const user = await User.findOne({
            _id: data._id,
            refreshToken: cookie.refreshToken,
          });
          if (!user) {
            return reject(new AppError("Refresh token not matched", 401));
          }
          res.status(200).json({
            success: true,
            newAccessToken: generateAccessToken(user._id, user.role),
          });
          resolve();
        }
      );
    });
  });

  // [GET] /forgotPassword
  forgotPassword = catchAsync(async (req, res) => {
    const { email } = req.query;
    if (!email) {
      throw new AppError("Missing inputs", 400);
    }

    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError("User not found with this email", 404);
    }

    const resetToken = user.createPasswordChangeToken();
    await user.save();

    const resetUrl = `${process.env.URL_SERVER}/user/resetPassword/${resetToken}`;
    const html = this.generateResetPasswordEmail(user.username, resetUrl);

    const data = { email, html };
    const result = await sendMail("Forgot password", data);

    res.status(200).json({ success: true, result });
  });

  // [PUT] /resetPassword
  resetPassword = catchAsync(async (req, res) => {
    const { userId, currentPassword, newPassword } = req.body;

    if (!userId || !currentPassword || !newPassword) {
      throw new AppError("Missing inputs", 400);
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const isMatch = await user.isCorrectPassword(currentPassword);
    if (!isMatch) {
      throw new AppError("Current password is incorrect", 401);
    }

    user.password = newPassword;
    user.passwordChangedAt = new Date().toISOString();
    await user.save();

    res.status(200).json({ success: true, message: "Password updated successfully" });
  });

  // [POST] /user/heartbeat
  heartbeat = catchAsync(async (req, res) => {
    if (!req.user || !req.user._id) {
      throw new AppError("Unauthorized", 401);
    }

    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const today = new Date().toDateString();
    const lastDate = user.streak?.lastListenDate
      ? new Date(user.streak.lastListenDate).toDateString()
      : null;

    let newActiveTime = user.activeTimeToday || 0;

    if (lastDate && lastDate !== today) {
      newActiveTime = 0;
    }

    newActiveTime += 10;

    const update = { activeTimeToday: newActiveTime };

    if (newActiveTime >= 20 && lastDate !== today) {
      const newStreak = (user.streak?.current || 0) + 1;
      update["streak.current"] = newStreak;
      update["streak.longest"] = Math.max(user.streak?.longest || 0, newStreak);
      update["streak.lastListenDate"] = new Date();

      if (newStreak >= 7) update.rank = "Vang";
      else if (newStreak >= 3) update.rank = "Bac";
      else update.rank = "Dong";
    }

    const updatedUser = await User.findByIdAndUpdate(userId, { $set: update }, { new: true });

    res.json({
      activeTimeToday: updatedUser.activeTimeToday,
      streak: updatedUser.streak,
      rank: updatedUser.rank,
    });
  });

  // Helper methods
  generateOTPEmail(otpCode) {
    return `<!DOCTYPE html>
      <html lang="vi">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Xác nhận OTP</title>
          <style>
              body { font-family: Arial, sans-serif; font-size: 14px; color: #333333; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 0 auto; border: 5px solid #39c6b9; border-radius: 10px; }
              .content { padding: 20px; }
              h1 { color: #39c6b9; }
              p { line-height: 1.5; }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="content">
                  <h1>Speaking English</h1>
                  <p>Xin chào,</p>
                  <p>Đây là mã OTP của bạn.</p>
                  <strong style="color: #da4f25; font-size: 24px;">OTP : ${otpCode}</strong>
                  <p>Cảm ơn bạn đã tin tưởng sử dụng web của chúng tôi!</p>
                  <p>Trân trọng,<br/>D&H</p>
              </div>
          </div>
      </body>
      </html>`;
  }

  generateEditProfileOTPEmail(otpCode) {
    return `<!DOCTYPE html>
      <html lang="vi">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Xác nhận OTP</title>
          <style>
              body { font-family: Arial, sans-serif; font-size: 14px; color: #333333; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 0 auto; border: 5px solid #39c6b9; border-radius: 10px; }
              .content { padding: 20px; }
              h1 { color: #39c6b9; }
              p { line-height: 1.5; }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="content">
                  <h1>Speaking English</h1>
                  <p>Xin chào,</p>
                  <p>Đây là OTP để chỉnh sửa tài khoản của bạn.</p>
                  <strong style="color: #da4f25; font-size: 24px;">OTP : ${otpCode}</strong>
                  <p>Cảm ơn bạn đã tin tưởng sử dụng web của chúng tôi!</p>
                  <p>Trân trọng,<br/>D&H</p>
              </div>
          </div>
      </body>
      </html>`;
  }

  generateResetPasswordEmail(username, resetUrl) {
    return `<!DOCTYPE html>
      <html lang="vi">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Đặt lại mật khẩu</title>
          <style>
              body { font-family: Arial, sans-serif; font-size: 14px; color: #333333; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 0 auto; border: 5px solid #39c6b9; border-radius: 10px; }
              .content { padding: 20px; }
              h1 { color: #39c6b9; }
              p { line-height: 1.5; }
              a { color: #da4f25; text-decoration: none; font-weight: bold; }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="content">
                  <h1>Speaking English</h1>
                  <p>Xin chào, <strong>${username}</strong>!</p>
                  <p>Vui lòng click vào link dưới đây để đặt lại mật khẩu:</p>
                  <p><a href="${resetUrl}">Click here to reset password</a></p>
                  <p>Link này sẽ hết hạn sau 15 phút.</p>
                  <p>Trân trọng,<br/>D&H</p>
              </div>
          </div>
      </body>
      </html>`;
  }
}

module.exports = new UserController();