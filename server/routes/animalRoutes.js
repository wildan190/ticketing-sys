import express from 'express';
import { 
  getAnimals, 
  getAnimalById, 
  createAnimal, 
  updateAnimal, 
  deleteAnimal 
} from '../controllers/animalController.js';

const router = express.Router();

router.route('/')
  .get(getAnimals)
  .post(createAnimal);

router.route('/:id')
  .get(getAnimalById)
  .put(updateAnimal)
  .delete(deleteAnimal);

export default router;
