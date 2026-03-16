import Cart from "../models/Cart.js";
import Product from "../models/Products.js";
const populateCartProducts = "items.product";
const populateCartFields = "name images price stock";
const getUserId = (req) => req.user?._id;
const getParamValue = (value) => (Array.isArray(value) ? value[0] : value);
const isSameCartItem = (item, productId, size) => item.product.toString() === productId && (item.size ?? "") === (size ?? "");
// get user cart
// get /api/cart
export const getCart = async (req, res) => {
    try {
        const userId = getUserId(req);
        let cart = await Cart.findOne({ user: userId }).populate(populateCartProducts, populateCartFields);
        if (!cart) {
            cart = await Cart.create({ user: userId, items: [] });
        }
        res.json({ success: true, data: cart });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// add item to cart
// post /api/cart/add
export const addToCart = async (req, res) => {
    try {
        const userId = getUserId(req);
        const { productId, quantity = 1, size } = req.body;
        const parsedQuantity = Number(quantity);
        if (!productId || Number.isNaN(parsedQuantity) || parsedQuantity <= 0) {
            return res.status(400).json({ success: false, message: "Valid productId and quantity are required" });
        }
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }
        if (product.stock < parsedQuantity) {
            return res.status(400).json({ success: false, message: "Insufficient stock" });
        }
        const normalizedSize = typeof size === "string" ? size : undefined;
        let cart = await Cart.findOne({ user: userId });
        if (!cart) {
            cart = new Cart({ user: userId, items: [] });
        }
        const existingItem = cart.items.find((item) => isSameCartItem(item, productId, normalizedSize));
        if (existingItem) {
            const nextQuantity = existingItem.quantity + parsedQuantity;
            if (product.stock < nextQuantity) {
                return res.status(400).json({ success: false, message: "Insufficient stock" });
            }
            existingItem.quantity = nextQuantity;
            existingItem.price = product.price;
        }
        else {
            cart.items.push({
                product: product._id,
                quantity: parsedQuantity,
                price: product.price,
                size: normalizedSize,
            });
        }
        cart.calculateTotal();
        await cart.save();
        await cart.populate(populateCartProducts, populateCartFields);
        res.json({ success: true, data: cart });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// update cart item quantity
// put /api/cart/item/:productId
export const updateCartItems = async (req, res) => {
    try {
        const userId = getUserId(req);
        const { quantity, size } = req.body;
        const productId = getParamValue(req.params.productId);
        const parsedQuantity = Number(quantity);
        if (!productId || Number.isNaN(parsedQuantity)) {
            return res.status(400).json({ success: false, message: "Valid productId and quantity are required" });
        }
        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({ success: false, message: "Cart not found" });
        }
        const normalizedSize = typeof size === "string" ? size : undefined;
        const item = cart.items.find((cartItem) => isSameCartItem(cartItem, productId, normalizedSize));
        if (!item) {
            return res.status(404).json({ success: false, message: "Item not in cart" });
        }
        if (parsedQuantity <= 0) {
            cart.items = cart.items.filter((cartItem) => !isSameCartItem(cartItem, productId, normalizedSize));
        }
        else {
            const product = await Product.findById(productId);
            if (!product) {
                return res.status(404).json({ success: false, message: "Product not found" });
            }
            if (product.stock < parsedQuantity) {
                return res.status(400).json({ success: false, message: "Insufficient stock" });
            }
            item.quantity = parsedQuantity;
            item.price = product.price;
        }
        cart.calculateTotal();
        await cart.save();
        await cart.populate(populateCartProducts, populateCartFields);
        res.json({ success: true, data: cart });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// remove item from cart
// delete /api/cart/item/:productId
export const removeCartItem = async (req, res) => {
    try {
        const userId = getUserId(req);
        const productId = getParamValue(req.params.productId);
        if (!productId) {
            return res.status(400).json({ success: false, message: "Valid productId is required" });
        }
        const { size } = req.body;
        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({ success: false, message: "Cart not found" });
        }
        const normalizedSize = typeof size === "string" ? size : undefined;
        const initialLength = cart.items.length;
        cart.items = cart.items.filter((item) => !isSameCartItem(item, productId, normalizedSize));
        if (cart.items.length === initialLength) {
            return res.status(404).json({ success: false, message: "Item not in cart" });
        }
        cart.calculateTotal();
        await cart.save();
        await cart.populate(populateCartProducts, populateCartFields);
        res.json({ success: true, data: cart });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// clear cart
// delete /api/cart
export const clearCart = async (req, res) => {
    try {
        const userId = getUserId(req);
        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({ success: false, message: "Cart not found" });
        }
        cart.items = [];
        cart.totalAmount = 0;
        await cart.save();
        res.json({ success: true, data: cart });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
