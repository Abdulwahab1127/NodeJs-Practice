const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
  user: {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true }
  },
  items: [
    {
      product: { // store snapshot of product
        title: { type: String, required: true },
        price: { type: Number, required: true },
        imageUrl: { type: String, required: true },
        description: { type: String }
      },
      quantity: { type: Number, required: true }
    }
  ],
  shippingAddress: {
    fullName: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true }
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['credit_card', 'debit_card', 'cash_on_delivery'],
    default: 'cash_on_delivery'
  },
  totalAmount: { type: Number, required: true },
  orderDate: { type: Date, default: Date.now },
  status: { 
    type: String, 
    default: 'pending', 
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']
  }
});

module.exports = mongoose.model('Order', orderSchema);





















