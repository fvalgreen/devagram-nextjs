import mongoose, { Schema } from "mongoose";

const SeguidorSchema = new Schema({
  // Criação do Schema do seguidor
  usuarioId: { type: String, required: true }, // Guarda a String com o Id do usuário que está seguindo e é obrigatório
  usuarioSeguidoId: { type: String, required: true }, // Guarda a String com o Id do usuário a ser seguido e é obrigatório
});

export const SeguidorModel =
  mongoose.models.seguidores || mongoose.model("seguidores", SeguidorSchema); // Adiciona pelo mongoose os dados na coleção seguidores, caso a coleção não exista ela será criada
