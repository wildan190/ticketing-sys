import mongoose from 'mongoose';

const animalSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    species: {
      type: String,
    },
    description: {
      type: String,
    },
    image_url: {
      type: String,
    },
    feeding_times: [
      {
        day: String,
        time: String,
      },
    ],
    location: {
      latitude: Number,
      longitude: Number,
    },
  },
  {
    timestamps: true,
  }
);

const Animal = mongoose.model('Animal', animalSchema);

export default Animal;
