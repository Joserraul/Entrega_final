import { Schema, model } from "mongoose";

const CartSchema = new Schema({
  products: [{
    product: {
      type: Schema.Types.ObjectId,
      ref: 'products', // ✅ Referencia al modelo de productos
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1
    }
  }]
}, {
  timestamps: true // ✅ Agrega createdAt y updatedAt
});

export const cartModel = model('carts', CartSchema);