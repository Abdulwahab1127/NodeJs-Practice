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
  ]
});

module.exports = mongoose.model('Order', orderSchema);
