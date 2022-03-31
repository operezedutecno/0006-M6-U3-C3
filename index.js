const express = require('express');
const app = express();
const { v4: uuidV4} = require('uuid');
const moment = require('moment');
const fs = require('fs');
const _ = require('lodash');

app.listen(8080, () => console.log("Servidor activo http://localhost:8080"));
//app.listen(3000, () => console.log("Servidor activo http://localhost:3000"));

//Middleware para recibir parámetros por el body (Método POST y PUT)...
app.use(express.json());

//Ruta para listar los productos
app.get("/productos", (req, res) => {
    res.setHeader('content-type', 'application/json');
    res.sendFile(`${__dirname}/data/productos.json`);
});

//Ruta para mostrar detalles de un producto en específico
app.get("/productos/:id", (req, res) => {
    res.setHeader('content-type', 'application/json');
    let id = req.params.id;
    let contenido = JSON.parse(fs.readFileSync(`${__dirname}/data/productos.json`,"utf8"));
    let producto = contenido.productos.find(item => item.id == id);
    producto ? res.send(producto) : res.status(404).send({ error: "Producto solicitado no existe"});
})

//Ruta para agregar productos.
app.post("/productos", (req, res) => {
    res.setHeader('content-type', 'application/json');
    let { nombre, precio } = req.body;
    nombre = _.trim(nombre);
    let id = uuidV4().slice(0,8);
    let producto = { id, nombre, precio };
    let contenido = JSON.parse(fs.readFileSync(`${__dirname}/data/productos.json`,"utf8"));
    if(!nombre || !precio){
        res.status(400).json({ error: "Enviar nombre y precio"});
    }else if(contenido.productos.find(item => _.toUpper(item.nombre) == _.toUpper(nombre))){
        res.status(400).json({ error: "Producto ya existe"});
    }else{
        contenido.productos.push(producto);
        contenido.ultima_actualizacion = moment().format("YYYY-MM-DD HH:mm:ss");
        contenido = JSON.stringify(contenido, null, 4);
        fs.writeFileSync(`${__dirname}/data/productos.json`,contenido,"utf8");
        res.status(201).json({ message: "Producto registrado exitosamente"});
    }
})

//Ruta para Editar productos
app.put("/productos", (req, res) => {
    //res.setHeader('content-type', 'application/json');
    let { id ,nombre, precio } = req.body;
    let contenido = JSON.parse(fs.readFileSync(`${__dirname}/data/productos.json`,"utf8"));
    contenido.productos.map(producto => {
        if(producto.id == id){
            producto.nombre = nombre;
            producto.precio = precio;
        }
        return producto;
    });
    contenido.ultima_actualizacion = moment().format("YYYY-MM-DD HH:mm:ss");
    contenido = JSON.stringify(contenido, null, 4);
    fs.writeFileSync(`${__dirname}/data/productos.json`,contenido,"utf8");
    res.json({ message: "Producto modificado exitosamente"});
})


//Ruta para eliminar productos
app.delete("/productos/:id", (req, res) => {
    let id = req.params.id;
    let contenido = JSON.parse(fs.readFileSync(`${__dirname}/data/productos.json`,"utf8"));
    let productosActualizados = contenido.productos.filter(producto => producto.id != id);
    contenido.productos = productosActualizados;
    contenido.ultima_actualizacion = moment().format("YYYY-MM-DD HH:mm:ss");
    contenido = JSON.stringify(contenido, null, 4);
    fs.writeFileSync(`${__dirname}/data/productos.json`,contenido,"utf8");
    res.json({ message: "Producto eliminado exitosamente"});
})


