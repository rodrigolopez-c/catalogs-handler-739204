import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import dynamoDB from "../utils/db";
import { HTTP_STATUS_CODES } from "../types/http-status-codes";
import { config } from 'dotenv';

config();

const db_table = process.env.CLIENTS_TABLE_NAME;

export const createClient = async (req: Request, res: Response) => {
    const { nombre, correo_electronico } = req.body;
    console.log(req.body);

    const newClient = {
        id: uuidv4(),
        nombre,
        correo_electronico
    };

    const params = {
        TableName: db_table || '',
        Item: newClient
    };

    try {
        await dynamoDB.put(params).promise();
        res.status(HTTP_STATUS_CODES.CREATED).json(newClient);
    } catch (error) {
        console.error(error)
        res.status(HTTP_STATUS_CODES.SERVER_ERROR).json({ error: "Error creating client"});
    }
};

export const getClients = async (_req: Request, res: Response) => {
    const params = {
        TableName: db_table || ''
    };

    try {
        const data = await dynamoDB.scan(params).promise();
        res.json(data.Items);
    } catch (error) {
        res.status(HTTP_STATUS_CODES.SERVER_ERROR).json({ error: "Error obtaining clients"});
    }
};

export const getClientById = async (req: Request, res: Response) => {
    const params = {
        TableName: db_table || '',
        Key: {
            id: req.params.id
        }
    };

    try {
        const data = await dynamoDB.get(params).promise();
        if (!data.Item) {
            res.status(HTTP_STATUS_CODES.NOT_FOUND).json({ error: "Client not found" });
        }

        res.json(data.Item);
    } catch (error) {
        res.status(HTTP_STATUS_CODES.SERVER_ERROR).json({ error: "Error obtaining client" });
    }
};

export const updateClient = async (req: Request, res: Response) => {
    const { nombre, correo_electronico } = req.body;
    const params = {
        TableName: db_table || '',
        Key: { id: req.params.id },
        UpdateExpression: "set nombre = :n, correo_electronico = :ce",
        ExpressionAttributeValues: {
            ":n": nombre,
            ":ce": correo_electronico
        },
        ReturnValues: "ALL_NEW"
    };

    try { 
        const data = await dynamoDB.update(params).promise();
        res.json(data.Attributes);
    } catch (error) {
        res.status(HTTP_STATUS_CODES.SERVER_ERROR).json({ error: "Error updating client" })
    }
};

export const deleteClient = async(req: Request, res: Response) => {
    const params = {
        TableName: db_table || '',
        Key: { id: req.params.id }
    };

    try {
        await dynamoDB.delete(params).promise();
        res.json({ message: "Client deleted succesfully" });
    } catch (error) {
        res.status(HTTP_STATUS_CODES.SERVER_ERROR).json({ error: "Error deleting client"});
    }
};