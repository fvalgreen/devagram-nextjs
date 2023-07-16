import mongoose, { Schema } from "mongoose";

// Criação do modelo de coleção da Publicação

const StorieSchema = new Schema({
  idUsuario: { type: String, required: true },
  foto: { type: String, required: true },
  data: { type: Date, required: true },
});

export const StoriesModel =
  mongoose.models.stories || mongoose.model("stories", StorieSchema);
