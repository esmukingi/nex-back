// lib/utils.js
export const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });

  res.cookie('jwt', token, {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: true, // Always true for cross-site cookies
    sameSite: 'none', // Required for cross-site requests
    path: '/',
  });

  return token;
};