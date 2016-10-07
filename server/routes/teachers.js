import { Router } from 'express';
import db from '../db/db.js';
import { ObjectID } from 'mongodb';
import Teacher from '../db/models/Teacher.js';
export default function(){
  const teachers = Router();
  const teachersCollection = db.get().model('teacher',Teacher);
  console.log('tc:',teachersCollection);
  teachers.get('/', (req, res) => {
    teachersCollection.find().toArray((err, docs) => {
      res.json({ teachers : docs });
    });
    // res.json({ teachers: true });
  });

  teachers.get('/taco', (req, res) => {
    collection.findOne({"_id": ObjectID(req.body._id)},(err, collection) => {
      res.json(collection)
    });
  });

  teachers.post('/taco', (req, res) => {
    // create a new taco
    collection.insert(req.body, (err, result) => {
      res.json(result);
    });
  });

  teachers.put('/taco', (req, res) => {
    // edit a taco
    collection.update({"_id": ObjectID(req.body._id)}, {"name": req.body.name, "toppings": req.body.toppings}, {w:1} , (err, result) => {
      res.json(result);
    });

  });

  teachers.delete('/taco', (req, res) => {
    // delete a whole damn taco
    collection.remove({"_id": ObjectID(req.body._id)},(err, result) => {
      res.json(result);
    });
  });

  return teachers;
};
