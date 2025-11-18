const express = require("express");
const tokenGenerator = require("../Security/tokenGenerator");

class Router {
  constructor() {
    this.router = express.Router(); // Créer un instance du routeur Express
  }

  // Méthode pour ajouter une route
  addRoute(method, path, controllerMethod, isProtected) {
    const supportedMethods = ["get", "post", "put", "delete", "patch"];

    if (!supportedMethods.includes(method)) {
      throw new Error(`Méthode HTTP non supportée : ${method}`);
    }

    this.router[method](path, (req, res) => {
      // ajout d'une condition pour véirifer si la route est protégé ou pas
      if (isProtected) {
        const tokenGen = new tokenGenerator();
        tokenGen.verifyToken(req, res, () => {
          const [controllerName, methodName] = controllerMethod.split(".");
          const Controller = require(`../Controller/${controllerName}`);
          const controllerInstance = new Controller();

          if (typeof controllerInstance[methodName] === "function") {
            controllerInstance[methodName](req, res);
          } else {
            res
              .status(500)
              .send(`La méthode ${methodName} n'existe pas dans le contrôleur ${controllerName}.`);
          }
        });
        // partie présente avant ajout du token
      } else {
        const [controllerName, methodName] = controllerMethod.split(".");
        const Controller = require(`../Controller/${controllerName}`);
        const controllerInstance = new Controller();

        if (typeof controllerInstance[methodName] === "function") {
          controllerInstance[methodName](req, res);
        } else {
          res
            .status(500)
            .send(`La méthode ${methodName} n'existe pas dans le contrôleur ${controllerName}.`);
        }
      }
    });
  }

  // Charger les routes à partir des contrôleurs
  loadRoutes() {
    const controllers = [
      require("../Controller/MealController"),
      require("../Controller/CategoryController"),
      require("../Controller/IngredientController"),
    ];

    controllers.forEach((ControllerClass) => {
      const controllerInstance = new ControllerClass();
      const routes = controllerInstance.loadRoutes();

      for (const [path, routeConfig] of Object.entries(routes)) {
        const { method, handler, protected: isProtected } = routeConfig;
        this.addRoute(method, path, `${ControllerClass.name}.${handler}`, isProtected);
      }
    });
  }

  getRouter() {
    return this.router;
  }
}

module.exports = Router;
