import User from "../model/userModel.js";  // sesuaikan path model
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { Op } from "sequelize";

dotenv.config();

const generateAccessToken = (user) =>
  jwt.sign(
    { id: user.id, username: user.username },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );

const generateRefreshToken = (user) =>
  jwt.sign(
    { id: user.id, username: user.username },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password)
      return res.status(400).json({ message: "Semua field harus diisi" });

    const userExist = await User.findOne({ where: { username } });
    if (userExist)
      return res.status(409).json({ message: "Username sudah digunakan" });

    const emailExist = await User.findOne({ where: { email } });
    if (emailExist)
      return res.status(409).json({ message: "Email sudah terdaftar" });

    const password_hash = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      email,
      password_hash,
    });

    res.status(201).json({
      message: "Registrasi berhasil",
      userId: newUser.id,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Login
export const login = async (req, res) => {
  try {
    const { usernameOrEmail, password } = req.body;
    if (!usernameOrEmail || !password)
      return res.status(400).json({ message: "Semua field harus diisi" });

    const user = await User.findOne({
      where: {
        [Op.or]: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
      },
    });
    if (!user)
      return res.status(401).json({ message: "Username atau password salah" });

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword)
      return res.status(401).json({ message: "Username atau password salah" });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Simpan refresh token ke DB
    await User.update({ refresh_token: refreshToken }, { where: { id: user.id } });

    // Kirim refresh token via cookie httpOnly
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 hari
      secure: false, // set true jika pakai HTTPS
      sameSite: "strict",
    });

    res.json({
      accessToken,
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
