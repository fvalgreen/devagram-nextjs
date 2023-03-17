import type { NextApiRequest, NextApiResponse } from "next";

export default (
    req : NextApiRequest,
    res : NextApiResponse
 ) => {
    if(req.method === 'POST'){
        const {login, senha} = req.body;

        if(login === 'admin@admin.com' && senha === 'Admin@123'){
            res.status(200).json({msg : 'Usuário autenticado com sucesso'})
        }
        return res.status(405).json({erro : 'Usuário ou senha não encontrado'})
    }
    return res.status(405).json({erro : 'Metodo informado não é válido'})
}