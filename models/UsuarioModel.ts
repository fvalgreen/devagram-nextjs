import mongoose, { Schema } from "mongoose";

const UsuarioSchema = new Schema({
  // Cria o Schema do usuário
  nome: { type: String, required: true }, // Guarda uma String com o nome do usuário e é obrigatório
  email: { type: String, required: true }, // Guarda uma String com o email do usuário e é obrigatório
  senha: { type: String, required: true }, // Guarda uma String com a senha do usuário e é obrigatório
  avatar: { type: String, required: false }, // Guarda a url da foto de avatar do usuário e não é obrigatório para a criação do usuário
  seguidores: { type: Number, default: 0 }, // Guarda o número de seguidores do usuário e é criado por padrão com o valor 0
  seguindo: { type: Number, default: 0 }, // Guarda o número de seguindo do usuário e é criado por padrão com o valor 0
  publicacoes: { type: Number, default: 0 }, // Guarda a quantidade de publicações que o usuário fez
});

export const UsuarioModel =
  mongoose.models.usuarios || mongoose.model("usuarios", UsuarioSchema); // Adiciona pelo mongoose os dados na coleção usuarios, caso a coleção não exista ela será criada
