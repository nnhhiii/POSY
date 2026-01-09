export const authConfig = {
  throttle: {
    limit: 5, // Number of allowed requests
    ttl: 10000, // Time to live in milliseconds
  },
  pwForgot: {
    resetCode: {
      expire: 15, // Expiry time in minutes for the reset code
      length: 6, // Number of digits in the reset code
    },
    resetToken: {
      expireIn: 15, // Expiry time in minutes for the reset token
    },
  },
  signIn: {
    accessToken: {
      expire: 1, // Expiry time in hours for the access token
    },
    refreshToken: {
      expire: 7, // Expiry time in days for the refresh token
    },
    attempt: {
      max: 5, // Maximum number of sign-in attempts
      lockTime: 15, // Lock time in minutes after reaching max attempts
    },
  },
};
