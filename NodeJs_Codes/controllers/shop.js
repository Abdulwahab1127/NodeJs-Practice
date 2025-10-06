const Product = require('../models/product');
const User = require('../models/user');
const Order = require('../models/order');

exports.getProducts = (req, res, next) => {
  Product.find()
    .then(products => {
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'All Products',
        path: '/products',
        errorMessage: req.flash('error'),
        successMessage: req.flash('success')
      });
    })
    .catch(err => {
      console.log(err);
    });
};


exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      res.render('shop/product-detail', {
        product: product,
        pageTitle: product.title,
        path: '/products',
        errorMessage: req.flash('error'),
        successMessage: req.flash('success')
      }); 
    })
    .catch(err => console.log(err));
};

exports.getIndex = (req, res, next) => {
  Product.find()
    .then(products => {
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/',
        errorMessage: req.flash('error'),
        successMessage: req.flash('success')
      });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getCart = (req, res, next) => {
  if (!req.session.isLoggedIn) {
    req.flash('error', 'Please log in to view your cart.');
    return res.redirect('/login');
  }
  
  User.findById(req.session.user._id)
    .then(user => {
      return user.getCart();
    })
    .then(products => {
      const errorMessage = req.flash('error');
      const successMessage = req.flash('success');
      
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: products,
        isAuthenticated: req.session.isLoggedIn,
        errorMessage: errorMessage.length > 0 ? errorMessage[0] : null,
        successMessage: successMessage.length > 0 ? successMessage[0] : null
      });
    })
    .catch(err => console.log(err));
};

exports.postCart = (req, res, next) => {
  if (!req.session.isLoggedIn) {
    req.flash('error', 'Please log in to add items to your cart.');
    return res.redirect('/login');
  }
  
  const prodId = req.body.productId;
  let foundProduct;

  Product.findById(prodId)
    .then(product => {
      foundProduct = product;
      return User.findById(req.session.user._id);
    })
    .then(user => {
      return user.addToCart(foundProduct);
    })
    .then(result => {
      console.log('Added to cart:', result);
      req.flash('success', 'Product added to cart successfully!');
      res.redirect('/cart');
    })
    .catch(err => {
      console.log('Add to cart error:', err);
      req.flash('error', 'Failed to add product to cart. Please try again.');
      res.redirect('/products');
    });
};

  //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
  // let fetchedCart;
  // let newQuantity = 1;
  // req.user
  //   .getCart()
  //   .then(cart => {
  //     fetchedCart = cart;
  //     return cart.getProducts({ where: { id: prodId } });
  //   })
  //   .then(products => {
  //     let product;
  //     if (products.length > 0) {
  //       product = products[0];
  //     }

  //     if (product) {
  //       const oldQuantity = product.cartItem.quantity;
  //       newQuantity = oldQuantity + 1;
  //       return product;
  //     }
  //     return Product.findByPk(prodId);
  //   })
  //   .then(product => {
  //     return fetchedCart.addProduct(product, {
  //       through: { quantity: newQuantity }
  //     });
  //   })
  //   .then(() => {
  //     res.redirect('/cart');
  //   })
  //   .catch(err => console.log(err));



//<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<,,

exports.postCartDeleteProduct = (req, res, next) => {
  if (!req.session.isLoggedIn) {
    req.flash('error', 'Please log in to modify your cart.');
    return res.redirect('/login');
  }
  
  const prodId = req.body.productId;

  User.findById(req.session.user._id)
    .then(user => {
      return user.deleteItemFromCart(prodId);
    })
    .then(() => {
      req.flash('success', 'Item removed from cart successfully!');
      res.redirect('/cart');
    })
    .catch(err => {
      console.log('Remove from cart error:', err);
      req.flash('error', 'Failed to remove item from cart. Please try again.');
      res.redirect('/cart');
    });
};


exports.postOrder = (req, res, next) => {
  if (!req.session.isLoggedIn) {
    req.flash('error', 'Please log in to place an order.');
    return res.redirect('/login');
  }
  
  User.findById(req.session.user._id)
    .then(user => {
      return user.addOrder();
    })
    .then(result => {
      req.flash('success', 'Order placed successfully! Thank you for your purchase.');
      res.redirect('/orders');
    })
    .catch(err => {
      console.log('Order creation error:', err);
      req.flash('error', 'Failed to place order. Please try again.');
      res.redirect('/cart');
    });
}

exports.getOrders = (req, res, next) => {
  if (!req.session.isLoggedIn) {
    req.flash('error', 'Please log in to view your orders.');
    return res.redirect('/login');
  }
  
  User.findById(req.session.user._id)
    .then(user => {
      return user.getOrders();
    })
    .then(orders => {
      const errorMessage = req.flash('error');
      const successMessage = req.flash('success');
      
      res.render('shop/orders', {
        path: '/orders', 
        pageTitle: 'Your Orders',
        orders: orders,
        isAuthenticated: req.session.isLoggedIn,
        errorMessage: errorMessage.length > 0 ? errorMessage[0] : null,
        successMessage: successMessage.length > 0 ? successMessage[0] : null
      });
    })
    .catch(err => console.log(err));
};


