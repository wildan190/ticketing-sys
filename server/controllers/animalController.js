import Animal from '../models/Animal.js';

// @desc    Get all animals
// @route   GET /api/animals
// @access  Public
export const getAnimals = async (req, res) => {
  try {
    const animals = await Animal.find();
    res.json(animals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get animal by ID
// @route   GET /api/animals/:id
// @access  Public
export const getAnimalById = async (req, res) => {
  try {
    const animal = await Animal.findById(req.params.id);
    if (animal) {
      res.json(animal);
    } else {
      res.status(404).json({ message: 'Animal not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create animal
// @route   POST /api/animals
// @access  Private/Admin
export const createAnimal = async (req, res) => {
  try {
    const { name, species, description, image_url, feeding_times, location } = req.body;
    const animal = await Animal.create({
      name,
      species,
      description,
      image_url,
      feeding_times,
      location,
    });
    res.status(201).json(animal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update animal
// @route   PUT /api/animals/:id
// @access  Private/Admin
export const updateAnimal = async (req, res) => {
  try {
    const { name, species, description, image_url, feeding_times, location } = req.body;
    const animal = await Animal.findById(req.params.id);
    if (animal) {
      animal.name = name || animal.name;
      animal.species = species || animal.species;
      animal.description = description || animal.description;
      animal.image_url = image_url || animal.image_url;
      animal.feeding_times = feeding_times || animal.feeding_times;
      animal.location = location || animal.location;

      const updatedAnimal = await animal.save();
      res.json(updatedAnimal);
    } else {
      res.status(404).json({ message: 'Animal not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete animal
// @route   DELETE /api/animals/:id
// @access  Private/Admin
export const deleteAnimal = async (req, res) => {
  try {
    const animal = await Animal.findById(req.params.id);
    if (animal) {
      await animal.deleteOne();
      res.json({ message: 'Animal removed' });
    } else {
      res.status(404).json({ message: 'Animal not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
