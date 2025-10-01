const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const order = require('./order');

const userSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  cart: {
    items: [
      {
        productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true }
      }
    ]
  }
});

// Add method to the user schema to add a product to the cart
userSchema.methods.addToCart = function(product) {
  const cartProductIndex = this.cart.items.findIndex(cp => {
    return cp.productId.toString() === product._id.toString();
  });
  let newQuantity = 1;
  const updatedCartItems = [...this.cart.items];

  if (cartProductIndex >= 0) {
    newQuantity = this.cart.items[cartProductIndex].quantity + 1;
    updatedCartItems[cartProductIndex].quantity = newQuantity;    
  } else {
    updatedCartItems.push({ productId: product._id, quantity: newQuantity });
  }

  this.cart = { items: updatedCartItems };
  return this.save();
}

// Add method to get cart items with product details populated
userSchema.methods.getCart = function() {
  return this.model('Product').find({ _id: { $in: this.cart.items.map(i => i.productId) } })
    .then(products => {
      return products.map(p => {
        return {
          ...p._doc,
          quantity: this.cart.items.find(i => i.productId.toString() === p._id.toString()).quantity
        };
      });
    });
}

// Add method to remove an item from the cart
userSchema.methods.deleteItemFromCart = function(productId) {
  const updatedCartItems = this.cart.items.filter(item => {
    return item.productId.toString() !== productId.toString();
  });
  this.cart.items = updatedCartItems;
  return this.save();
}

// Add method to add an order
userSchema.methods.addOrder = function() {
  const Order = this.model('Order');

  return this.getCart().then(products => {
    const orderItems = products.map(p => {
      return {
        product: {
          title: p.title,
          price: p.price,
          imageUrl: p.imageUrl,
          description: p.description
        },
        quantity: p.quantity
      };
    });

    const order = new Order({
      items: orderItems,
      user: {
        userId: this._id,
        name: this.name
      }
    });

    return order.save().then(() => {
      this.cart = { items: [] };
      return this.save();
    });
  });
};




// Add method to get user orders
userSchema.methods.getOrders = function() {
  const Order = this.model('Order');
  return Order.find({ 'user.userId': this._id });
}



module.exports = mongoose.model('User', userSchema);





/*
// const mongodb = require('mongodb');
// const getDb = require('../util/database').getDb;

// const ObjectId = mongodb.ObjectId; // To create ObjectId instances from string IDs

class User {
  constructor(name, email,cart,id) {
    this.name = name;
    this.email = email;
    this.cart = cart; // { items: [ { productId: , quantity: } ] }
    this._id = id;
  }
  save() {
    // const db = getDb();
    return db.collection('users').insertOne(this)
      .then(result => console.log('USER INSERTED:', result))
      .catch(err => console.log(err));
  }

  addToCart(product) {
    const cartProductIndex = this.cart.items.findIndex(cp => {
      return cp.productId.toString() === product._id.toString();
    });
    let newQuantity = 1;
    const updatedCartItems = [...this.cart.items];


    if (cartProductIndex >= 0) {
      newQuantity = this.cart.items[cartProductIndex].quantity + 1;
      updatedCartItems[cartProductIndex].quantity = newQuantity;
    }else{
      updatedCartItems.push({productId: new ObjectId(product._id), quantity: newQuantity });
    }
    
    const updatedCart = {
        items: updatedCartItems
    };
    // const db = getDb();
    return db.collection('users').updateOne({ _id: new ObjectId(this._id) }, { $set: { cart: updatedCart } })
  } 

  getCart(){
    // const db = getDb();
    const productIds = this.cart.items.map(i => {
      return i.productId;
    });
    return db.collection('products')
    .find({ _id: { $in: productIds } }) // Find products with matching IDs
    .toArray()
    .then(products =>{
      // Map the products to include quantity from the cart items
      return products.map(p => {
        return {
          // Spread the product details into the new object 
          ...p,
          quantity: this.cart.items.find(i => { // Find the cart item that matches the product ID
            return i.productId.toString() === p._id.toString(); // Compare as strings
          }).quantity // Add the quantity to the product object
        };
      });
    })
    .catch(err => console.log(err));

  }

  // Method to remove an item from the cart based on productId
  deleteItemFromCart(productId){
    const updatedCartItems = this.cart.items.filter(item => {
      return item.productId.toString() !== productId.toString();
    });
    const updatedCart = {
      items: updatedCartItems
    };
    // const db = getDb();
    return db.collection('users').updateOne({ _id: new ObjectId(this._id) }, { $set: { cart: updatedCart } })
  }

  addOrder(){
    // const db = getDb();
    return this.getCart()
    .then(products =>{
      const order = {
        items: products,
        user: {
            _id: new ObjectId(this._id),  
            name: this.name
        }
      };
      return db.collection('orders').insertOne(order);
      
    }).then(result =>{
        this.cart = {items:[]};
        return db.collection('users')
        .updateOne({ _id: new ObjectId(this._id) }, { $set: { cart: {items:[]} } })
    }).catch(err => console.log(err));
  }

  getOrders(){
    // const db = getDb();
    return db.collection('orders')
    .find({'user._id': new ObjectId(this._id)}) // Find orders for this user
    .toArray();
    
  }

  static findById(userId){
      // const db = getDb();
      return db.collection('users')
      .find({ _id: new ObjectId(userId) })
      .next()
      .then(user => {
        console.log("Single User Found!");
        console.log(user);
        return user;
      })
      .catch(err => console.log(err));
    }
  
}  
module.exports = User;
*/