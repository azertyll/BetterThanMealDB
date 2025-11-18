const { executeQuery } = require('../Security/authDatabase');

class CategoryController {

    async getCategory(req, res){
        try{
            const query = `SELECT * FROM category WHERE id = ?`;
            const values = [req.params.id];
           
            const categorie = await executeQuery(query, values)

            res.status(200).json({message: "La catégorie a été récupérée avec succès!", data: categorie})
        }catch(error){
            res.status(500).json({message: "Erreur lors de la récupération du contenu!", erreur: error.message || error})
        }
    }
    
    async getCategories(req, res){
        try{
            const query = `SELECT * FROM category`;
           
            const categories = await executeQuery(query)

            res.status(200).json({message: "Les catégories ont été récupérées avec succès!", data: categories})
        }catch(error){
            res.status(500).json({message: "Erreur lors de la récupération du contenu!", erreur: error.message || error})
        }
    }

    loadRoutes() {
        return {
            '/categories/:id': { method: 'get', handler: 'getCategory' },
            '/categories': { method: 'get', handler: 'getCategories' },
        }
    }
}

module.exports = CategoryController