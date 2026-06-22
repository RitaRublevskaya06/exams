const User = require('../models/userModel');

class UserController{
    
    getAllUsers(req, res){
        res.json(User.getAll());
    }

    createUser(req, res){
        console.log("req.body:", req.body);
        const { name, surname, address } = req.body; 
        if (!name || !surname) {
            return res.status(400).json({ message: "Name и surname обязательны" });
        }
        const newUser = User.create({ name, surname, address });
        res.status(201).json(newUser);
    }

    getUserById(req, res) {
        const user = User.getById(req.params.id);
        if (user) res.json(user);
        else res.status(404).json({ message: 'User not found' });
    }

    updateUser(req, res) {
        const updatedUser = User.update(req.params.id, req.body);
        if (updatedUser) {
            res.json(updatedUser);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    }

    deleteUser(req, res) {
        const success = User.delete(req.params.id);
        if (success) {
            res.json({ message: 'User deleted successfully' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    }
}

module.exports = UserController;
