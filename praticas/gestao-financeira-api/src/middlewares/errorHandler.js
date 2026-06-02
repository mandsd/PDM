/**
 * Middleware central de erro do Express.
 * Captura tudo que cair em next(error) e devolve JSON consistente.
 *
 * @param {Error} err - Erro capturado por algum handler.
 * @param {import("express").Request} req - Requisição HTTP.
 * @param {import("express").Response} res - Resposta HTTP.
 * @param {import("express").NextFunction} next - Próximo middleware (não usado, mas exigido pela assinatura).
 * @returns {void}
 */
export function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.name === "ZodError") {
    return res.status(400).json({ error: "Dados inválidos", details: err.issues });
  }
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "JSON inválido no corpo da requisição" });
  }
  if (err.code === "P2025") {
    return res.status(404).json({ error: "Recurso não encontrado" });
  }
  if (err.code === "P2002") {
    return res.status(409).json({ error: "Registro duplicado" });
  }
  if (err.code === "P2003") {
    return res.status(400).json({ error: "Referência inválida (FK não existe)" });
  }

  res.status(500).json({ error: "Erro interno do servidor" });
}