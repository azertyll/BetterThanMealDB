const { executeQuery } = require('../Security/authDatabase');

class MealController {

    async getMeal(req, res){
        try{
            const query = `SELECT * FROM meal WHERE id = ?`;
            const values = [req.params.id];
           
            const meal = await executeQuery(query, values)

            res.status(200).json({message: "Le plat a été récupéré avec succès!", data: meal})
        }catch(error){
            res.status(500).json({message: "Erreur lors de la récupération du contenu!", erreur: error.message || error})
        }
    }

    async getMeals(req, res){
        try{
            const { limit } = req.query
            let query = "SELECT * FROM meal"
            const values = [];

            if (!isNaN(limit) && limit > 0) {
                query += " LIMIT ?";
                values.push(limit);
            }

            const meals = await executeQuery(query, values);

            res.status(200).json({message: "Les plats ont été récupérés avec succès!", data: meals})
        }catch(error){
            res.status(500).json({message: "Erreur lors de la récupération du contenu!", erreur: error.message || error})
        }
    }

    async getMealsBy(req, res){
        try{
            const field = req.body.field;
            const value = req.body.value;

            const query = `SELECT * FROM meal WHERE ${field} = ?`
            const values = [value]

            const meals = await executeQuery(query, values)

            res.status(200).json({message: "Les plats ont été récupérés avec succès!", data: meals})
        }catch(error){
            res.status(500).json({message: "Erreur lors de la récupération du contenu!", erreur: error.message || error})
        }
    }

    async getMealByCategory(req, res){
        try{
            
            const query = `SELECT * FROM meal WHERE category_id = ?`
            const values = [req.params.id]

            const meals = await executeQuery(query, values)

            res.status(200).json({message: "Les plats ont été récupérés avec succès!", data: meals})
        }catch (error) {
            res.status(500).json({message: "Erreur lors de la récupération du contenu!", erreur: error.message || error})
        }
    }

    loadRoutes() {
        return {
            '/meals/:id': { method: 'get', handler: 'getMeal' },
            '/meals': { method: 'get', handler: 'getMeals' },
            '/mealsby': { method: 'post', handler: 'getMealsBy' },
            '/meals/category/:id': { method: 'get', handler: 'getMealByCategory' },
        }
    }
}

module.exports = MealController