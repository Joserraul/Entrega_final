import { Schema, model } from "mongoose";

const ProductSchema = new Schema({
    title: {
        type: String,
        required: true,
        max: 50
    },
    description: {
        type: String,
        required: true,
        minLength: [3, 'Minimum 3 characters'],
        maxLength: [50, 'Maximum 50 characters']
    },
    price: {
        type: Number,
        required: true,
        min: [0, 'Price must be positive']
    },
    stock: {
        type: Number,
        required: true,
        min: [0, 'Stock must be positive']
    }
})

export const ProductModel = model('products', ProductSchema);