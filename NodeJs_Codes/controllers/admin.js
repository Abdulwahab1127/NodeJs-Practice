const Product = require('../models/product');
const path = require('path');
const fs = require('fs');


exports.getAddProduct = (req, res, next) => {
  const errorMessage = req.flash('error');
  const oldInputFlash = req.flash('oldInput');
  const fieldErrorsFlash = req.flash('fieldErrors');
  const oldInput = oldInputFlash.length > 0 ? JSON.parse(oldInputFlash[0]) : {};
  const fieldErrors = fieldErrorsFlash.length > 0 ? JSON.parse(fieldErrorsFlash[0]) : {};

  // Clear success messages when opening add form (don't show old success messages)
  req.flash('success');

  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
    errorMessage: errorMessage.length > 0 ? errorMessage[0] : null,
    successMessage: null, // Don't show success messages on add form load
    oldInput: oldInput,
    fieldErrors: fieldErrors
  });
};

exports.postAddProduct = (req, res, next) => {
  const { title, price, description } = req.body;
  const file = req.file;

  let fieldErrors = {};
  let oldInput = { title: title || '', price: price || '', description: description || '' };

  // Validation
  if (!title || title.trim() === '' || title.trim().length < 3) fieldErrors.title = true;
  if (!file) fieldErrors.image = true;
  if (!price || isNaN(price) || price <= 0) fieldErrors.price = true;
  if (!description || description.trim() === '') fieldErrors.description = true;

  if (Object.keys(fieldErrors).length > 0) {
    req.flash('error', 'Please enter a valid input.');
    req.flash('oldInput', JSON.stringify(oldInput));
    req.flash('fieldErrors', JSON.stringify(fieldErrors));
    return res.redirect('/admin/add-product');
  }

  const imageUrl = file.path.replace(/\\/g, '/').replace(/^.*\/public\//, ''); // store relative path

  const product = new Product({
    title,
    price,
    description,
    imageUrl, // now "images/filename.jpg"
    userId: req.session.user._id
  });

  product
    .save()
    .then(() => {
      req.flash('success', 'Product added successfully!');
      res.redirect('/admin/products');
    })
    .catch(err => {
      console.error(err);
      req.flash('error', 'Failed to add product. Please try again.');
      req.flash('oldInput', JSON.stringify(oldInput));
      res.redirect('/admin/add-product');
    });
};


// /admin/products => GET Shows all products in admin page
exports.getProducts = (req, res, next) => {
  Product.find({ userId: req.session.user._id }) // Fetch only products created by the logged-in user
 
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
  const errorMessage = req.flash('error');
  const oldInputFlash = req.flash('oldInput');
  const fieldErrorsFlash = req.flash('fieldErrors');
  const oldInput = oldInputFlash.length > 0 ? JSON.parse(oldInputFlash[0]) : {};
  const fieldErrors = fieldErrorsFlash.length > 0 ? JSON.parse(fieldErrorsFlash[0]) : {};

  // Clear success messages when opening edit form (don't show old success messages)
  req.flash('success');

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
      product: product,
      errorMessage: errorMessage.length > 0 ? errorMessage[0] : null,
      successMessage: null, // Don't show success messages on edit form load
      oldInput: oldInput,
      fieldErrors: fieldErrors
    });
  })
  .catch(err => console.log(err));
};

exports.postEditProduct = (req, res, next) => {
  const { productId, title, price, description } = req.body;
  const newFile = req.file; // optional new image

  let fieldErrors = {};
  let oldInput = { title: title || '', price: price || '', description: description || '' };

  // Validation
  if (!title || title.trim() === '' || title.trim().length < 3) fieldErrors.title = true;
  if (!price || isNaN(price) || price <= 0) fieldErrors.price = true;
  if (!description || description.trim() === '') fieldErrors.description = true;

  if (Object.keys(fieldErrors).length > 0) {
    req.flash('error', 'Please enter a valid input.');
    req.flash('oldInput', JSON.stringify(oldInput));
    req.flash('fieldErrors', JSON.stringify(fieldErrors));
    return res.redirect(`/admin/edit-product/${productId}?edit=true`);
  }

  Product.findById(productId)
    .then(product => {
      if (!product) return res.redirect('/admin/products');
      if (product.userId.toString() !== req.session.user._id.toString()) {
        req.flash('error', 'Not authorized');
        return res.redirect('/admin/products');
      }

      product.title = title;
      product.price = price;
      product.description = description;

      // ✅ If new image uploaded, delete old image
      if (newFile) {
        if (product.imageUrl) {
          const oldImagePath = path.join(__dirname, '..', 'public', product.imageUrl); // absolute path
          fs.unlink(oldImagePath, err => {
            if (err) console.log('Failed to delete old image:', err);
          });
        }
        product.imageUrl = newFile.path.replace(/\\/g, '/').replace(/^.*\/public\//, '');
      }

      return product.save();
    })
    .then(() => {
      req.flash('success', 'Product updated successfully!');
      res.redirect('/admin/products');
    })
    .catch(err => {
      console.log(err);
      req.flash('error', 'Failed to update product. Please try again.');
      res.redirect(`/admin/edit-product/${productId}?edit=true`);
    });
};




exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;

  Product.deleteOne({ _id: prodId, userId: req.session.user._id }) // Ensure only the owner can delete
    .then(() => {
      console.log('DESTROYED PRODUCT');
      res.redirect('/admin/products');
    }) 
    .catch(err => console.log(err));
};

