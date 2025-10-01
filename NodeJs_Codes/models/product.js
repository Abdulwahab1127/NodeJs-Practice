const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the Product schema with a reference to the User model
const productSchema = new Schema({ 
  title: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  userId: { 
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

module.exports = mongoose.model('Product', productSchema);































/*
// const mongodb = require('mongodb');
// const getDb = require('../util/database').getDb;

class Product {
  constructor(title, price, description, imageUrl, id, userId) {
    this.title = title;
    this.price = price;
    this.description = description;
    this.imageUrl = imageUrl;
    this._id = id ? (typeof id === 'string' ? new mongodb.ObjectId(id) : id) : null;
    this.userId = userId ? (typeof userId === 'string' ? new mongodb.ObjectId(userId) : userId) : null;
  }


  save() {
    
    const db = getDb();
    if (this._id) {
      // Update existing product
      return db.collection('products').updateOne(
        { _id: this._id }, // 👈 use the ObjectId stored in this._id
        {
          $set: {
            title: this.title,
            price: this.price,
            description: this.description,
            imageUrl: this.imageUrl
          }
        }
      )
      .then(result => console.log('PRODUCT UPDATED:', result))
      .catch(err => console.log(err));
      } else {
      // Insert new product
      return db.collection('products').insertOne(this)
        .then(result => console.log('PRODUCT INSERTED:', result))
        .catch(err => console.log(err));
      }

  }

  delete() {
  const db = getDb();

  if (!this._id) {
    return Promise.reject(new Error('No product ID provided'));
  }

  return db.collection('products')
    .deleteOne({ _id: this._id })
    .then(result => console.log('PRODUCT DELETED'))
    .catch(err => console.log(err));
}



 
  static fetchAll(){
    const db = getDb();
    return db.collection('products')
    .find() // find() returns a cursor, not the actual dataW
    .toArray() // <--- This will return an array of products
    .then(products =>{
      console.log("Product Fetched!");
      
      return products;
    })
    .catch(err => 
      console.log(err));
  }

  static findById(prodId){
    const db = getDb();
    return db.collection('products')
    .find({ _id: new mongodb.ObjectId(prodId) })
    .next()
    .then(product => {
      console.log("Single Product Found!");
      
      return product;
    })
    .catch(err => console.log(err));
  }

}

module.exports = Product;
*/