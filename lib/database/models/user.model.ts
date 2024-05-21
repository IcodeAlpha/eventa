import { Schema, model, models } from "mongoose";

const UserSchema = new Schema({
    clerkId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    username: { type: String},
    firstname: { type: String},
    lastname: { type: String},
    photo: { type: String, required: true },
})

const User = models.User || model('User', UserSchema);

export default User;