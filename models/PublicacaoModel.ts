import mongoose, { Schema } from "mongoose";

// Criação do modelo de coleção da Publicação

const PublicacaoSchema = new Schema({
  // Criação do Schema definindo como será o padrão esperado de uma publicação
  idUsuario: { type: String, required: true }, // Guarda uma String com o ID da publicação e é obrigatório para a criação
  descricao: { type: String, required: true }, // Guarda uma String com a descrição da publicação ou o texto e é obrigatória para a criação
  foto: { type: String, required: true }, // Guarda uma String com a url da foto da publicação e é obrigatória para a criação
  data: { type: Date, required: true }, // Guarda a data em que a publicação foi criada e é obrigatória para a criação
  likes: { type: Array, required: true, default: [] }, // Guarda os ID's de quem curtiu a publicação em um Array, é obrigatória e por padrão é criada vazia
  comentarios: { type: Array, required: true, default: [] }, // Guarda os  comentários da publicação em um Array, é obrigatória e por padrão é criada vazia
});

export const PublicacaoModel = // Exportando o modelo
  mongoose.models.publicacoes || // Adiciona pelo mongoose os dados na coleção usuarios 
  mongoose.model("publicacoes", PublicacaoSchema); // Caso a coleção não exista ela será criada
