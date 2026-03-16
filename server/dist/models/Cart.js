import mongoose, { Schema } from "mongoose";
const cartItemSchema = new Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    price: { type: Number, required: true },
    size: { type: String },
});
const cartSchema = new Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items: [cartItemSchema],
    totalAmount: { type: Number, default: 0 },
}, { timestamps: true });
cartSchema.methods.calculateTotal = function () {
    this.totalAmount = this.items.reduce((total, item) => {
        return total + item.price * item.quantity;
    }, 0);
    return this.totalAmount;
};
const Cart = mongoose.model('Cart', cartSchema);
export default Cart;
