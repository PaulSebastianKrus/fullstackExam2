import mongoose from '../utils/db.js';
import { hashPassword, comparePassword } from '../utils/hashPassword.js';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 20,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /.+\@.+\..+/,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  isFirstLogin: {
    type: Boolean,
    default: true,
  },
});

userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await hashPassword(this.password);
  }
  next();
});

userSchema.methods.comparePassword = function (candidatePassword) {
  return comparePassword(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;