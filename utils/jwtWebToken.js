import jwt from 'jsonwebtoken';

function jwtCreateToken(obj) {
  return jwt.sign(obj, process.env.JWT_TOKEN_API_ACCESS_TOKEN_SECRET, {
    expiresIn: '1d',
    algorithm: 'HS256'
  });
}

function jwtGetData(jwtToken) {
  const decoded = jwt.verify(
  	jwtToken,
  	process.env.JWT_TOKEN_API_ACCESS_TOKEN_SECRET,
  );
  return decoded;
}

export { jwtCreateToken, jwtGetData };