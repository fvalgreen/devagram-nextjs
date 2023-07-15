import mongoose, { Schema } from "mongoose";

const NotificacaoSchema = new Schema({
  usuarioAcao: { type: String, required: true },
  usuarioNotificado: { type: String, required: true },
  publicacao: { type: String },
  tipo: { type: String, required: true },
  dataNotificacao: { type: Date, required: true },
  visualizada: { type: Boolean, required: true },
});

export const NotificacaoModel =
  mongoose.models.notificacoes ||
  mongoose.model("notificacoes", NotificacaoSchema);
