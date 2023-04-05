const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username cannot be blank']
    }, 
    password: {
        type: String,
        required: [true, 'Password cannot be blank']
    }, 
})

userSchema.statics.findAndValidate = async function(username, password) {
    foundUser = await this.findOne({ username });
    const isValid = await bcrypt.compare(password, foundUser.password);
     return isValid ? foundUser : false;       //this mean if is valid is true return foundUser , otherwise retuen false
}

userSchema.pre('save', async function(next){  //we made this ti make the password be hashed by our model and using pre middleware to save the password hashed
    if(!this.isModified('password')) return next(); //this made because if we want to change the username without changing the password so by this code we prevent rehashing the password again
    this.password = await bcrypt.hash(this.password, 12);
    next(); 
})

module.exports = mongoose.model('User', userSchema);