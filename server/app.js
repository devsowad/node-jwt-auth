import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import fakeDB from './fakeDB.js';
import {
  createAccessToken,
  createRefreshToken,
  sendRefreshToken,
} from './token.js';
import { isAuth } from './isAuth.js';
import jwt from 'jsonwebtoken';

const app = express();

app.use(cookieParser());

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/register', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = fakeDB.find(user => user.email === email);
    if (user) throw new Error('User already exist');

    const hashedPassword = await bcrypt.hash(password, 10);

    fakeDB.push({
      id: fakeDB.length,
      email,
      password: hashedPassword,
    });
    res.send({ message: 'User Created' });
  } catch (err) {
    res.send({
      error: `${err.message}`,
    });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = fakeDB.find(user => user.email === email);
    if (!user) throw new Error('Enter valid credentials');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error('Enter valid credentials');

    const accessToken = createAccessToken(user.id);
    const refreshToken = createRefreshToken(user.id);

    user.refreshToken = refreshToken;
    console.log(user);
    sendRefreshToken(res, refreshToken);
    res.send({ accessToken, email: user.email });
  } catch (error) {
    console.log(error);
    res.send({ error: error.message });
  }
});

app.post('/logout', (req, res) => {
  res.clearCookie('refreshToken');
  res.send({ message: 'Logged out' });
});

app.use('/protected', (req, res) => {
  try {
    const userId = isAuth(req);
    if (!userId) res.send({ message: 'Authorized' });
  } catch (error) {
    res.send({ error: error.message });
  }
});

app.post('/refresh-token', (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) res.send({ error: 'Token is required' });

  try {
    const { userId } = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    const user = fakeDB.find(({ id }) => id === userId);
    console.log({ token, ref: user?.refreshToken });
    if (!user || user?.refreshToken !== token)
      return res.send({ error: 'Invalid token' });

    const accessToken = createAccessToken(user.id);
    const refreshToken = createRefreshToken(user.id);
    user.refreshToken = refreshToken;
    sendRefreshToken(res, refreshToken);
    res.send({ accessToken });
  } catch (error) {
    res.send({ error: error.message });
  }
});

app.listen(process.env.PORT, () =>
  console.log(`Server listening on port ${process.env.PORT}!`)
);
