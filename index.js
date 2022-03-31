const express = require('express');
const app = express();
const { v4: uuidV4} = require('uuid');
const moment = require('moment');
const fs = require('fs');

//app.listen(8080, () => console.log("Servidor activo http://localhost:8080"));
app.listen(3000, () => console.log("Servidor activo http://localhost:3000"));

app.use(express.json());

app.get("/productos", (req, res) => {
    res.setHeader('content-type', 'application/json');
    res.sendFile(`${__dirname}/data/productos.json`);
});

app.get("/productos/:id", (req, res) => {
    res.setHeader('content-type', 'application/json');
    let id = req.params.id;
    let contenido = JSON.parse(fs.readFileSync(`${__dirname}/data/productos.json`,"utf8"));
    let producto = contenido.productos.find(item => item.id == id);
    producto ? res.send(producto) : res.status(404).send({ error: "Producto solicitado no existe"});
})

app.post("/productos", (req, res) => {
    res.setHeader('content-type', 'application/json');
    let { nombre, precio } = req.body;
    let id = uuidV4().slice(0,8);
    let producto = { id, nombre, precio };
    let contenido = JSON.parse(fs.readFileSync(`${__dirname}/data/productos.json`,"utf8"));
    contenido.productos.push(producto);
    contenido.ultima_actualizacion = moment().format("YYYY-MM-DD HH:mm:ss");
    contenido = JSON.stringify(contenido, null, 4);
    fs.writeFileSync(`${__dirname}/data/productos.json`,contenido,"utf8");
    res.json({ message: "Producto registrado exitosamente"});
})

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


