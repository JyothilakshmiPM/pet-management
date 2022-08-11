module.exports = (app) => {
    const pets = require("../controllers/controller.js");
    var router = require("express").Router();

    router.post("/signup", pets.signup);
  
    router.post("/login", pets.login);
    
    router.post("/category", pets.category);
    
    router.post("/category/:id/pet", pets.pet);

    router.get("/category", pets.getCategoryAll);
  
    router.get("/category/:id", pets.getCategoryOne);
    
    router.get("/pet/:id", pets.getPetOne);
    
    router.get("/category/:id/pet", pets.getPetCategoryId);
   
    router.put("/category/:id", pets.updateCategory);

    router.put("/pet/:id", pets.updatePet);
   
    router.delete("/category/:id", pets.deleteCategory);
   
    router.delete("/pet/:id", pets.deletePet);

    router.get("/categoryAll", pets.getCategoryOne);

    app.use('/api', router);
  };