import jwt from 'jsonwebtoken';

export const isAuth = req => {
  const authorization = req.headers['authorization'];
  if (!authorization) throw new Error('Unauthorized');
  const token = authorization.split(' ')[1];
  const { userId } = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  return userId;
};
