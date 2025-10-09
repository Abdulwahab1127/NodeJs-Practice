const Product = require('../models/product');
const User = require('../models/user');
const Order = require('../models/order');
const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');

const ITEMS_PER_PAGE = 4; // Number of products per page


// Get all products on Products Page
exports.getProducts = (req, res, next) => {
// const cartSuccess = req.flash('cart-success'); // get user-specific flash
// const userError = req.flash('error');          // get user-specific flash

 const page = req.query.page ? parseInt(req.query.page) : 1;
  
  let totalItems;

  Product.find()
    .countDocuments()
    .then(numProducts => {
      totalItems = numProducts;      
        return Product.find()     
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
      })
      .then(products => {
        res.render('shop/product-list', {
        
          prods: products,
          pageTitle: 'All Products',
          path: '/products',
          currentPage: page,
          hasNextPage: ITEMS_PER_PAGE * page < totalItems,
          hasPreviousPage: page > 1,
          nextPage: page + 1,
          previousPage: page - 1,
          lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
          errorMessage: req.flash('error'),
          successMessage: req.flash('success')

        });
      })
      .catch(err => {
        console.log(err);
  });
};


// Get single product details 
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
  const page = req.query.page ? parseInt(req.query.page) : 1;

  let totalItems;

  Product.find()
    .countDocuments()
    .then(numProducts => {
      totalItems = numProducts;      
        return Product.find()     
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
      })
      .then(products => {
        res.render('shop/index', {
        
          prods: products,
          pageTitle: 'Shop',
          path: '/',
          currentPage: page,
          hasNextPage: ITEMS_PER_PAGE * page < totalItems,
          hasPreviousPage: page > 1,
          nextPage: page + 1,
          previousPage: page - 1,
          lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
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

exports.getInvoice = (req, res, next) => {

  const orderId = req.params.orderId;

  Order.findById(orderId)
  .then(order => {
    if (!order) {
      return next(new Error('No order found.'));
    }
    if (order.user.userId.toString() !== req.user._id.toString()) {
      return next(new Error('Unauthorized access to invoice.'));
    }
      const invoiceName = 'invoice-' + orderId + '.pdf';
  const invoicePath = path.join('data', 'invoices', invoiceName); // Path to the invoice file



  const pdfDoc = new PDFDocument();
  res.setHeader('Content-Type', 'application/pdf'); // Set the content type to PDF 
  res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"'); // Display inline in browser 
  pdfDoc.pipe(fs.createWriteStream(invoicePath));
  pdfDoc.pipe(res);

  pdfDoc.text('Invoice', { align: 'center', underline: true });
  pdfDoc.moveDown();
  pdfDoc.text('---------------------------------------------------------------------------------------------------------------------');
  pdfDoc.moveDown();
  pdfDoc.text('Your Order No is: ' + orderId, { align: 'left' , fontSize: 20});

  pdfDoc.moveDown();
  pdfDoc.text('Items: ', {fontSize: 16 });
  pdfDoc.moveDown();
  pdfDoc.end();

  // fs.readFile(invoicePath, (err, data) => {
  //   if (err) {
  //     console.log(err);
  //     return res.status(404).send('Invoice not found.');
  //   }
  //   res.setHeader('Content-Type', 'application/pdf'); // Set the content type to PDF 
  //   res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"'); // Display inline in browser 
  //   res.send(data);
  // });
    
  // const file = fs.createReadStream(invoicePath);

  // file.pipe(res); // Stream the file to the response
    
  })
  .catch(err => next(err));

  
};  