const mongoose = require('mongoose');
const { DATE, DATETIME, FLOAT } = require('mysql/lib/protocol/constants/types');
const { createTrue } = require('typescript');


var userSchema = new mongoose.Schema({

    first_name: { 
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true  
    },
    email: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    role: {
        type: Number,
        default: 1
    }

});

module.exports = mongoose.model("user", userSchema);



var categorySchema = new mongoose.Schema({

    _id: { type: mongoose.Schema.Types.ObjectId },
    name: {
            type: String,
            required: true
    },
    status: {
            type: Number,
            min: 0,
            max: 1,
            required: true
    }

});

module.exports = mongoose.model("category", categorySchema);
    
var petSchema = new mongoose.Schema({
    
    name: {
            type: String,
            required: true
    },
    status: {
            type: Number,
            min: 0,
            max: 1,
            required: true
    },
    category_id: 
           { type: mongoose.Schema.Types.ObjectId, 
            ref: 'category'
    },
    breed: {
            type: String,
            required: true
    },
    age: {
            type: Number,
            required: true
           
    },
    create_date: {
            type: Date,
            default: Date.now
    },
    update_date: {
            type: Date,
            default: Date.now
    }

});


module.exports = mongoose.model('pet', petSchema);
    
var sampleSchema = new mongoose.Schema({
    
    name: {
            type: String,
            required: true
    },
    status: {
            type: Number,
            min: 0,
            max: 1,
            required: true
    }
});