const Product = require('../models/product');


exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  const product = new Product({title: title, price: price, description: description, imageUrl: imageUrl, userId: req.user._id}); // Create a new product instance and associate it with the logged-in user
  
  product
  .save() 
  .then(result => {
    // console.log(result);
    console.log('Created Product');
    res.redirect('/admin/products');
  })
  .catch(err => {
    console.log(err);
  });
};

// /admin/products => GET Shows all products in admin page
exports.getProducts = (req, res, next) => {
  Product.find()
  // .select('title price imageUrl') // Select only specific fields to optimize data retrieval
  // .populate('userId', 'name') // Populate userId with user details, selecting only the name field
    // Product.fetchAll() --- IGNORE ---
    .then(products => {
      console.log('Fetched Products:', products);
      res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: '/admin/products'
      });
    })
    .catch(err => console.log(err));
};


// getEditProduct - To render the edit-product page with existing product details
exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const prodId = req.params.productId;
  Product.findById(prodId)
  .then(product => {
    if (!product) {
      console.log('Product not found!');
      return res.redirect('/admin/products');
    }
    res.render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing: editMode,
      product: product
    });
  })
  .catch(err => console.log(err));
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const title =  req.body.title
  const price =  req.body.price
  const description =  req.body.description
  const imageUrl =  req.body.imageUrl
  
  Product.findById(prodId)
  .then(
    product => {
      // If no product is found, redirect to admin products page
      if (!product) {
        console.log('Product not found!');
        return res.redirect('/admin/products');
      }
      // Update product details with new values from the form
      product.title = title;
      product.price = price;
      product.description = description;
      product.imageUrl = imageUrl;
      return product.save(); // Return the updated product to the next then() block
    }
  )   
  .then(() => res.redirect('/admin/products'))
  .catch(err => console.log(err));
};




exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;

  Product.findByIdAndDelete(prodId)
    .then(() => {
      console.log('DESTROYED PRODUCT');
      res.redirect('/admin/products');
    })
    .catch(err => console.log(err));
};