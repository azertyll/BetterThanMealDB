const { executeQuery } = require('../Security/authDatabase');

const ALLOWED_FILTER_FIELDS = ['id', 'name'];

class IngredientController {

    async getIngredientsByMeal(req, res){
        try{
            const mealId = req.params.mealId;

            if (!mealId) {
                return res.status(400).json({ message: "L'identifiant du plat est requis." });
            }

            const query = `
                SELECT i.*
                FROM recipe r
                INNER JOIN ingredient i ON i.id = r.ingredient_id
                WHERE r.meal_id = ?
                ORDER BY i.name ASC
            `;

            const ingredients = await executeQuery(query, [mealId]);

            res.status(200).json({
                message: "Les ingrédients de la recette ont été récupérés avec succès!",
                data: ingredients
            });
        }catch(error){
            res.status(500).json({
                message: "Erreur lors de la récupération des ingrédients de la recette!",
                erreur: error.message || error
            });
        }
    }

    async getIngredient(req, res){
        try{
            const query = `SELECT * FROM ingredient WHERE id = ?`;
            const values = [req.params.id];
           
            const ingredient = await executeQuery(query, values)

            res.status(200).json({message: "L'ingrédient a été récupéré avec succès!", data: ingredient})
        }catch(error){
            res.status(500).json({message: "Erreur lors de la récupération de l'ingrédient!", erreur: error.message || error})
        }
    }

    async getIngredients(req, res){
        try{
            const ingredients = await executeQuery(`SELECT * FROM ingredient ORDER BY name ASC`)

            res.status(200).json({message: "Les ingrédients ont été récupérés avec succès!", data: ingredients})
        }catch(error){
            res.status(500).json({message: "Erreur lors de la récupération des ingrédients!", erreur: error.message || error})
        }
    }

    async getIngredientsBy(req, res){
        try{
            const field = req.body.field;
            const value = req.body.value;

            if (!field || !ALLOWED_FILTER_FIELDS.includes(field)) {
                return res.status(400).json({ message: "Champ de filtrage invalide." });
            }

            const query = `SELECT * FROM ingredient WHERE ${field} = ?`
            const values = [value]

            const ingredients = await executeQuery(query, values)

            res.status(200).json({message: "Les ingrédients ont été récupérés avec succès!", data: ingredients})
        }catch(error){
            res.status(500).json({message: "Erreur lors de la récupération des ingrédients!", erreur: error.message || error})
        }
    }

    loadRoutes() {
        return {
            '/meals/:mealId/ingredients': { method: 'get', handler: 'getIngredientsByMeal' },
            '/ingredients/:id': { method: 'get', handler: 'getIngredient' },
            '/ingredients': { method: 'get', handler: 'getIngredients' },
            '/ingredients/search': { method: 'post', handler: 'getIngredientsBy' },
        }
    }
}

module.exports = IngredientController