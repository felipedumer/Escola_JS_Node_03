const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

let userSchema = new mongoose.Schema({
    name: String,
    email: { type: String,
            required: true, unique: true },
    password: { 
        type: String, 
        required: true },
    created_at: { type: Date, default: Date.now},
    updated_at: { type: Date, default: Date.now},
});

userSchema.pre('save', function (next) {
    if(this.isNew || this.isModified('password')) {
        bcrypt.hash(this.password, 5, (e, hashedPassword) => {
            if (e) {
                next(e);
            }
            else {
                this.password = hashedPassword;
                next();
            }
        });
    }
});

userSchema.methods.isCorrectPassword = function (password, callback) {
    bcrypt.compare(password, this.password, function (e, same) {
        if (e) {
            callback(e);
        } else {
            callback(e, same);
        }
    });
}

module.exports = mongoose.model('userModel', userSchema);