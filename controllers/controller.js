const dbModel = require("../models/model");
const petModels = dbModel.models;
const mongoose = require("mongoose");
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const validator = require('validatorjs');
const secret = require('../auth.config');
const { ReadPreference } = require("mongodb");

const modelUser = mongoose.model('user');
const modelCat = mongoose.model('category');
const modelPet = mongoose.model('pet');



// Signup
exports.signup = async(req, res) => {

    if (Object.keys(req.body).length === 0) {
        res.status(400).send({ message: "Content can not be empty!" });
        return;
    }

    const email_exist = await modelUser.findOne( {email: req.body.email} );
    if (email_exist) {
        res.status(400).send({ message: "Email is taken!" });
        return;
    }
   
    let data = {
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email,
        password: req.body.password,
        age: req.body.age,
        country: req.body.country,
        role: req.body.role
    }
    let rules = {
        first_name: 'required|alpha',
        last_name: 'required|alpha',
        email: 'required|email',
        password: 'required',
        age: 'required|integer|min:18|max:99',
        country: 'required|string',
        role: 'required|integer|min:1|max:2'
    };

    if(req.body.password.length<6)
    {
        res.status(400).send({ message: "Password should be atleast 6 characters!" });
        return;
    }

    let validation = new validator(data, rules);
    try{
    if (validation.passes()) {
        const { first_name, last_name, password, email, age, country, role } = req.body; 
        bcrypt.hash(password, 10, function(err, hash) {
            if(err) {
                res.status(400).json({ 
                    message: "User not created",
                    error: error.message,
                })
                return;
            }
            modelUser.collection.insertOne({
                first_name,
                last_name,
                password: hash,
                email,
                age,
                country,
                role
            }).then((modelUser) => res.status(200).json({
                message: "User successfully created",
                modelUser,
            }))
        });   
    } else {
        res.status(400).json(validation.errors);
        return;
    }  
}catch(error) {
    res.status(400).json({
        error: error.message,
    })
    return;
}
}


//Login
exports.login = async(req, res, next) => {

    if (Object.keys(req.body).length === 0) {
        res.status(400).send({ message: "Content can not be empty!" });
        return;
    }
    if (!req.body.password) {
        res.status(400).send({ message: "password is required" });
        return;
    }
    try{
        const user = await modelUser.findOne({ email:req.body.email });
        if (!user) {
            res.status(401).json({
            message: "Invalid Credentials",
            error: "User not found", });
        } else {
            bcrypt.compare(req.body.password, user.password).then(function (result) {
                if (result) {
                    jwt.sign({user}, "secret", { expiresIn: '1h' },(err, token) => {
                        if(err) { console.log(err) }    
                        res.send(token);
                        return res;
                    });
                } else {
                    res.status(401).json({
                        message: "Login not successful",
                        error: "User not found",
                    });
                } 
            })
        }
    }catch (err) { console.log(err);}
}



//POST - Category
exports.category = async(req, res) => {
    try {
        let token = req.headers["authorization"];
        if(token)
        {
            token = token.replace(/^Bearer\s+/, "");
            jwt.verify(token, 'secret', async(err, decoded) => {
                if(err) {
                    console.log('ERROR: Could not connect to the protected route');
                    res.status(403).json("Forbidden");
                    return;
                } 
                if(decoded === undefined) {
                    console.log("Invalid token");
                    res.status(403).json('Forbidden');
                    return;
                }
                if(Object.keys(req.body).length === 0) {
                    res.status(400).send({ message: "Content can not be empty!" });
                    return;
                }
                const category = await modelCat.findOne({ name: req.body.name });
                if (category) {
                    res.status(400).json("Category already added!");
                    return;
                }
                let data = {
                    name: req.body.name,
                    status: req.body.status
                }
                let rules = {
                    name: 'required|alpha',
                    status: 'required|numeric|min:0|max:1'
                }
                let validation = new validator(data, rules);
        
                if (validation.passes()) {
                    const category = new modelCat({
                        name: req.body.name,
                        status: req.body.status
                    })
                    const data =  modelCat.collection.insertOne(category);
                    if (data) {
                        res.status(200).json(category);
                        return;
                    }
                    else {
                        res.status(400).json("Not inserted");
                        return;
                    }
                } else {
                    res.status(400).json(validation.errors);
                    return;
                }
            });
        } else {
            console.log("No Token Set in Headers!");
            res.status(400).json("Authentication Failed!");
            return;
        }
    } catch(error) {
        console.log({ message: error.message });
        return;
    }
};


//POST - Pet
exports.pet = (req, res) => {
    try {
        let token = req.headers["authorization"];
        if(token) {
            token = token.replace(/^Bearer\s+/, "");
            jwt.verify(token, 'secret', async(err, decoded) => {
                if(err) {
                    console.log('ERROR: Could not connect to the protected route');
                    res.status(403).json("Forbidden");
                    return;
                } 
                if(decoded === undefined) {
                    console.log("Invalid token");
                    res.status(403).json('Forbidden');
                    return;
                }

                if(Object.keys(req.body).length === 0) {
                    res.status(400).send({ message: "Content can not be empty!" });
                    return;
                }
                
                const id = req.params.id;
                if( mongoose.isObjectIdOrHexString(id) ) {
                    category_id = id;
                }
    
                
                let pet_data = {
                    name: req.body.name,
                    breed: req.body.breed,
                    age: req.body.age,
                    status: req.body.status,
                    create_date: req.body.create_date,
                    update_date: req.body.update_date
                }
                let rules = {
                    name: 'required|string',
                    breed: 'required|string',
                    age: 'required|numeric',
                    status: 'required|numeric|min:0|max:1',
                    create_date: 'date',
                    update_date: 'date'
                };
                let validation = new validator(pet_data, rules);
    
                if (validation.passes()) {
                    const data = new modelPet({
                        name: req.body.name,
                        status: req.body.status,
                        breed: req.body.breed,
                        age: req.body.age,
                        category_id: category_id,
                        create_date: req.body.create_date,
                        update_date: req.body.update_date
                    })
                    const result = modelPet.collection.insertOne(data);
                    if (result) {
                        res.status(200).json(data);
                        return;
                    }
                    else {
                        res.status(400).json("Not Added");
                        return;
                    }
                } else{
                    res.status(400).json(validation.errors);
                    return;
                }
            });
        } else {
            console.log("No Token Set in Headers!");
            res.status(400).json("Authentication Failed!");
            return;
        }
    } catch(error) {
        console.log({ message: error.message });
        return;
    }
};


//GET - Categories
exports.getCategoryAll = async(req, res) => {
    try {
        
        let token = req.headers["authorization"];
        if(token) {
            token = token.replace(/^Bearer\s+/, "");
            jwt.verify(token, 'secret', async(err, decoded) => {
                if(err) {
                    console.log('ERROR: Could not connect to the protected route');
                    res.status(403).json("Forbidden");
                    return;
                } 
                if(decoded === undefined) {
                    console.log("Invalid token");
                    res.status(403).json('Forbidden');
                    return;
                }
        
                const data = await modelCat.find();
                if(data) {
                    res.status(200).json(data);
                    return data;
                }
                else {
                    res.status(400).json("No Categories Available !");
                    return;
                }
                
            });
        } else {
            console.log("No Token Set in Headers!");
            res.status(400).json("Authentication Failed!");
            return;
        }
    }catch(error) {
        res.status(400).json({ message: error.message });
    }
};


// GET - Category By ID
exports.getCategoryOne = async(req, res) => {
    try {
        let token = req.headers["authorization"];
        if(token) {
            token = token.replace(/^Bearer\s+/, "");
            jwt.verify(token, 'secret', async(err, decoded) => {
                if(err) {
                    console.log('ERROR: Could not connect to the protected route');
                    res.status(403).json("Forbidden");
                    return;
                } 
                if(decoded === undefined) {
                    console.log("Invalid token");
                    res.status(403).json('Forbidden');
                    return;
                }
                id = mongoose.Types.ObjectId(req.params.id) ;
                const data = await modelCat.findById(id);
                if(!data){
                    res.json("Invalid Category ID!");
                }
                else{
                    res.json(data);
                    return data;
                }
            });
        } else {
            console.log("No Token Set in Headers!");
            res.status(400).json("Authentication Failed!");
            return;
        }
    }catch(error) {
        res.status(400).json({ message: error.message });
    }
};


//GET - Pet By ID
exports.getPetOne = async(req, res) => {
    try{
        let token = req.headers["authorization"];
        if(token) {
            token = token.replace(/^Bearer\s+/, "");
            jwt.verify(token, 'secret', async(err, decoded) => {
                if(err) {
                    console.log('ERROR: Could not connect to the protected route');
                    res.status(403).json("Forbidden");
                    return;
                } 
                if(decoded === undefined) {
                    console.log("Invalid token");
                    res.status(403).json('Forbidden');
                    return;
                }
                id = mongoose.Types.ObjectId(req.params.id) ;
                const data =  await modelPet.findById(id);
                if(data) {
                    res.json(data);
                    return data;
                }
                else {
                    res.json("No pets of this ID");
                }
            });
        } else {
            console.log("No Token Set in Headers!");
            res.status(400).json("Authentication Failed!");
            return;
        }
    }catch(error) {
        res.status(400).json({ message: error.message });
    }
};


//GET - Pet BY Category ID
exports.getPetCategoryId = async(req, res) => {
    try {
        let token = req.headers["authorization"];
        if(token) {
            token = token.replace(/^Bearer\s+/, "");
            jwt.verify(token, 'secret', async(err, decoded) => {
                if(err) {
                    console.log('ERROR: Could not connect to the protected route');
                    res.status(403).json("Forbidden");
                    return;
                } 
                if(decoded === undefined) {
                    console.log("Invalid token");
                    res.status(403).json('Forbidden');
                    return;
                }
                id = mongoose.Types.ObjectId(req.params.id);
                const data = await modelPet.find({}).where('category_id').equals(id);
                if(data) {
                    res.json(data);
                    return data;
                }
                else {
                    res.json("No pets of this ID");
                
                }
            });
        } else {
            console.log("No Token Set in Headers!");
            res.status(400).json("Authentication Failed!");
            return;
        }   
    }catch(error) {
        res.status(400).json({ message: error.message });
    }
};


//PUT - Category
exports.updateCategory = async(req, res) => {
    try {
        let token = req.headers["authorization"];
        if(token) {
            token = token.replace(/^Bearer\s+/, "");
            jwt.verify(token, 'secret', async(err, decoded) => {
                if(err) {
                    console.log('ERROR: Could not connect to the protected route');
                    res.status(403).json("Forbidden");
                    return;
                } 
                if(decoded === undefined) {
                    console.log("Invalid token");
                    res.status(403).json('Forbidden');
                    return;
                }
                if (Object.keys(req.body).length === 0) {
                    res.status(400).send({ message: "Content can not be empty!" });
                    return;
                }
                id = mongoose.Types.ObjectId(req.params.id) ;
                const updatedData = req.body;
                const options = { new: true };
                const data = await modelCat.findByIdAndUpdate(id, updatedData, options);
                if(data) {
                    res.json(data);
                }
                else {
                    res.json("Invalid Category ID");
                }
            });
        } else {
            console.log("No Token Set in Headers!");
            res.status(400).json("Authentication Failed!");
            return;
        }   
    }catch(error) {
        res.status(400).json({ message: error.message });
    }
};


//PUT - Pet
exports.updatePet = async (req, res) => {
    try {
        let token = req.headers["authorization"];
        if(token) {
            token = token.replace(/^Bearer\s+/, "");
            jwt.verify(token, 'secret', async(err, decoded) => {
                if(err) {
                    console.log('ERROR: Could not connect to the protected route');
                    res.status(403).json("Forbidden");
                    return;
                } 
                if(decoded === undefined) {
                    console.log("Invalid token");
                    res.status(403).json('Forbidden');
                    return;
                }
                if (Object.keys(req.body).length === 0) {
                    res.status(400).send({ message: "Content can not be empty!" });
                    return;
                }

                id = mongoose.Types.ObjectId(req.params.id) ;
                const updatedData = req.body;
                const options = { new: true };
                const data = await modelPet.findByIdAndUpdate(id, updatedData, options);
                if(data) {
                    res.json(data);
                }
                else{
                    res.json("Invalid Pet ID!");
                }
            });
        } else {
            console.log("No Token Set in Headers!");
            res.status(400).json("Authentication Failed!");
            return;
        }   
    }catch(error) {
        res.status(400).json({ message: error.message });
    }
};


//DELETE - Category
exports.deleteCategory = async (req, res) => {
    try{
        let token = req.headers["authorization"];
        if(token) {
            token = token.replace(/^Bearer\s+/, "");
            jwt.verify(token, 'secret', async(err, decoded) => {
                if(err) {
                    console.log('ERROR: Could not connect to the protected route');
                    res.status(403).json("Forbidden");
                    return;
                } 
                if(decoded === undefined) {
                    console.log("Invalid token");
                    res.status(403).json('Forbidden');
                    return;
                }
                const id = mongoose.Types.ObjectId(req.params.id) ;
                const cat_id = id;
                const data = await modelCat.findByIdAndDelete(id);
                const result = await modelPet.deleteMany({category_id:id});
                if(data){
                    res.json(`Deleted category and Pets of Category id ${cat_id}`);
                }
                else{
                    res.json("Invalid Category ID!");
                }
            });
        } else {
            console.log("No Token Set in Headers!");
            res.status(400).json("Authentication Failed!");
            return;
        }   
    }catch(error) {
        res.status(400).json({ message: error.message });
    }
};


//DELETE - Pet
exports.deletePet = async (req, res) => {
    try{
        let token = req.headers["authorization"];
        if(token) {
            token = token.replace(/^Bearer\s+/, "");
            jwt.verify(token, 'secret', async(err, decoded) => {
                if(err) {
                    console.log('ERROR: Could not connect to the protected route');
                    res.status(403).json("Forbidden");
                    return;
                } 
                if(decoded === undefined) {
                    console.log("Invalid token");
                    res.status(403).json('Forbidden');
                    return;
                }
                id = mongoose.Types.ObjectId(req.params.id) ;
                const data = await modelPet.findByIdAndDelete(id);
                if(data){
                    res.json(`Deleted Pet of id ${id}`);
                }
                else{
                    res.json("Invalid Pet ID!");
                }
            });
        } else {
            console.log("No Token Set in Headers!");
            res.status(400).json("Authentication Failed!");
            return;
        }   
    }catch(error) {
        res.status(400).json({ message: error.message });
    }
};