const Product = require('../models/product');
const colorLog = require('../util/custom_log');

exports.getAddProduct = (req, res, next) => {
 
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
    isAuthenticated: req.session.isLoggedIn
  });
};


exports.postAddProduct = async(req, res, next) => {
  try{
    const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;

  colorLog(req.user)
  await req.user.createProduct
   ({
    title: title,
    price: price,
    imageUrl: imageUrl,
    description: description
  });
 res.redirect('/');
  }
    catch(err){
      console.error(err);
      res.status(500).send('Internal Server Error'); // Handle error appropriately
    }
};


exports.getEditProduct = async(req, res, next) => {
  const editMode = req.query.edit;
  
  if (!editMode) {
    return res.redirect('/');
  }
  const prodId = req.params.productId;

  Product.findByPk(prodId)
    .then(product => {
      if (!product) {
        console.log("redirecting to products");

        return res.redirect('/');
      }
      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: editMode,
        product: product,
        isAuthenticated: req.session.isLoggedIn
      });
    })
    .catch(err => console.log(err));
};



exports.postEditProduct = async(req, res, next) => {
  console.log("get edit products");


try{
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedImageUrl = req.body.imageUrl;
  const updatedDesc = req.body.description;
 const product =await  Product.findByPk(prodId);
  product.title = updatedTitle;
  product.price = updatedPrice;
  product.imageUrl = updatedImageUrl;
  product.description = updatedDesc;
  await product.save();
  console.log("redirecting to products");

  res.redirect('/admin/products');
}catch(err){
  console.error(err);
  res.status(500).send('Internal Server Error');
}
};



exports.getProducts = async(req, res, next) => {
try{
  console.log("trying to get products");
  const products = await  Product.findAll();
  res.render('admin/products', {
    prods: products || [], 
    pageTitle: 'Admin Products',
    path: '/admin/products',
    isAuthenticated: req.session.isLoggedIn
    
  });
}catch(err){
  console.error(err);
  res.status(500).send('Internal Server Error');
}
};

exports.postDeleteProduct = async(req, res, next) => {
  const prodId = req.body.productId;
  await Product.destroy({where: {id: prodId}});
  res.redirect('/admin/products');
};
