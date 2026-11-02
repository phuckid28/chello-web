// Một vài biểu thức chính quy - Regular Expression và custom message.
export const FIELD_REQUIRED_MESSAGE = 'This field is required.'
export const EMAIL_RULE = /^\S+@\S+\.\S+$/
export const EMAIL_RULE_MESSAGE = 'Email is invalid. (abc@domain.com)'
// Password policy (contract v7 §1): 8–128 chars, at least 1 letter (any script) and 1 digit.
// Kept in sync with PASSWORD_POLICY in ~/utils/passwordStrength.
export const PASSWORD_MIN_LENGTH = 8
export const PASSWORD_MAX_LENGTH = 128
export const PASSWORD_RULE = /^(?=.*\p{L})(?=.*\d)[\s\S]{8,128}$/u
export const PASSWORD_RULE_MESSAGE = 'Password must be 8–128 characters and include at least 1 letter and 1 number.'
export const PASSWORD_CONFIRMATION_MESSAGE = 'Password Confirmation does not match!'

// 2FA codes (contract v7 §1): TOTP = 6 digits; backup codes are short alphanumeric strings (dashes allowed)
export const TOTP_RULE = /^\d{6}$/
export const BACKUP_CODE_RULE = /^[A-Za-z0-9-]{6,32}$/

// Liên quan đến Validate File
export const LIMIT_COMMON_FILE_SIZE = 10485760 // byte = 10 MB
export const ALLOW_COMMON_FILE_TYPES = ['image/jpg', 'image/jpeg', 'image/png']
export const singleFileValidator = (file) => {
  if (!file || !file.name || !file.size || !file.type) {
    return 'File cannot be blank.'
  }
  if (file.size > LIMIT_COMMON_FILE_SIZE) {
    return 'Maximum file size exceeded. (10MB)'
  }
  if (!ALLOW_COMMON_FILE_TYPES.includes(file.type)) {
    return 'File type is invalid. Only accept jpg, jpeg and png'
  }
  return null
}
