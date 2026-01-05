/**
 * @desc Getnerate 6-Digit OTP
 * @returns { string } 6-Digit Numeric OTP
*/
export const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};