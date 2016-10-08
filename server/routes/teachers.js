import { Router } from 'express';
import db from '../db/db.js';
import { ObjectID } from 'mongodb';
import Teacher from '../db/models/Teacher.js';

export default function(){
  const router = Router();
  const teachersCollection = db.get().model('teacher',Teacher);

  // get all teachers
  router.get('/', (req, res) => {
    teachersCollection.find((err, teachers) => {
      if (err) {
        console.error.bind(console, `Error finding teachers in db: ${err}`);
        res.json({success: false, error: err, teachers: null});
      } else if (teachers === null) {
        res.json({success: true, error: 'no teachers in db', teachers: null})
      } else {
        res.json({ success: true, error: null, teachers });
      }
    });
  });

  //get teacher by id
  router.get('/:_id', (req, res) => {
    teachersCollection.findOne({"_id": ObjectID(req.params._id)},(err, teacher) => {
      if (err) {
        console.error.bind(console, `error finding teacher w/ that id in db: ${err}`);
        res.json({success: false, error: err, teacher: null});
      } else if (teacher === null) {
        res.json({success: false, error: 'no teacher with that id', teacher});
      } else {
        res.json({success: true, error: null, teacher});
      }
    });
  });

  //get teacher by username
  router.get('/name/:name', (req, res) => {
    teachersCollection.findOne({'username': req.params.name}, (err, teacher) => {
      if (err) {
        console.log(`error finding teacher by that username in db: ${err}`);
        res.json({success: false, error: err, teacher: null});
      } else if (teacher === null) {
        res.json({success: false, error: 'no teacher by that name', teacher});
      } else {
        res.json({success: true, error: null, teacher});
      }
    });
  });
  return router;
};
