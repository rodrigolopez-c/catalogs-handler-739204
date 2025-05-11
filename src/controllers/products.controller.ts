import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import dynamoDB from "../utils/db";
import { HTTP_STATUS_CODES } from "../types/http-status-codes";
import { config } from 'dotenv';

config();

const db_table = process.env.PRODUCTS_TABLE_NAME;

export const createProduct = async (req: Request, res: Response) => {
    const { nombre, unidad_medida, precio_base } = req.body;
    const newProducto = {
        id: uuidv4(),
        nombre,
        unidad_medida,
        precio_base
    };

    const params = {
        TableName: db_table || '',
        Item: newProducto
    };

    try {
        await dynamoDB.put(params).promise();
        res.status(HTTP_STATUS_CODES.CREATED).json(newProducto);
    } catch (error) {
        res.status(HTTP_STATUS_CODES.SERVER_ERROR).json({ error: "Error creating product" });
    }
};

export const getProducts = async (_req: Request, res: Response) => {
    const params = {
        TableName: db_table || ''
    };

    try {
        const data = await dynamoDB.scan(params).promise();
        res.json(data.Items);
    } catch (error) {
        res.status(HTTP_STATUS_CODES.SERVER_ERROR).json({ error: "Error obtaining products" });
    }
};

export const getProductById = async (req: Request, res: Response) => {
    const params = {
        TableName: db_table || '',
        Key: {
            id: req.params.id
        }
    };

    try {
        const data = await dynamoDB.get(params).promise();
        if (!data.Item) {
            res.status(HTTP_STATUS_CODES.NOT_FOUND).json({ error: "Product not found" });
        }

        res.json(data.Item);
    } catch (error) {
        res.status(HTTP_STATUS_CODES.SERVER_ERROR).json({ error: "Error obtaining product" });
    }
};

export const updateProduct = async (req: Request, res: Response) => {
    const { nombre, unidad_medida, precio_base } = req.body;
    const params = {
        TableName: db_table || '',
        Key: { id: req.params.id },
        UpdateExpression: "set nombre = :n, unidad_medida = :um, precio_base = :pb",
        ExpressionAttributeValues: {
            ":n": nombre,
            ":um": unidad_medida,
            ":pb": precio_base
        },
        ReturnValues: "ALL_NEW"
    };

    try {
        const data = await dynamoDB.update(params).promise();
        res.json(data.Attributes);
    } catch (error) {
        res.status(HTTP_STATUS_CODES.SERVER_ERROR).json({ error: "Error updating product" });
    }
};

export const deleteProduct = async (req: Request, res: Response) => {
    const params = {
        TableName: db_table || '',
        Key: { id: req.params.id }
    };

    try {
        await dynamoDB.delete(params).promise();
        res.json({ message: "Product deleted successfully" });
    } catch (error) {
        res.status(HTTP_STATUS_CODES.SERVER_ERROR).json({ error: "Error deleting product" });
    }
};