const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storecontroller');
const userController = require('../controllers/userController')
const authController = require('../controllers/authController')
const reviewController = require('../controllers/reviewController')


const {catchErrors} = require('../handlers/errorHandlers');

// Do work here
router.get('/', catchErrors(storeController.getStores));
router.get('/stores', catchErrors(storeController.getStores));
router.get('/stores/page/:page', catchErrors(storeController.getStores));


router.get('/store/:id', catchErrors(storeController.getOneStore))

router.get('/stores/:id/edit', catchErrors(storeController.editStore))

router.get('/add', storeController.addStore);
router.post('/add', 
  storeController.upload,
  catchErrors(storeController.resize),
  catchErrors(storeController.createStore
));
router.post('/add/:id', catchErrors(storeController.updateStore));

router.get('/tags', catchErrors(storeController.getStoresByTag))
router.get('/tags/:tag', catchErrors(storeController.getStoresByTag))

router.get('/login', userController.loginForm);
router.get('/register', userController.registerForm);
router.post('/register', userController.registerUser, authController.login);
router.get('/account', userController.accounts)
router.post('/account', userController.updateAccount)

router.get('/top', catchErrors(storeController.getTopStores))


/* 
API
*/

router.get('/api/v1/search', catchErrors(storeController.searchStores))
router.post('/api/stores/:id/heart', catchErrors(storeController.heartStore))
router.post('/reviews/:id', catchErrors(reviewController.addReview))

module.exports = router;
