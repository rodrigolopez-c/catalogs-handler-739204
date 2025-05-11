import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import dynamoDB from "../utils/db";
import { HTTP_STATUS_CODES } from "../types/http-status-codes";
import { config } from 'dotenv';

config();

const addresses_table = process.env.ADDRESSES_TABLE_NAME;
const clients_table = process.env.CLIENTS_TABLE_NAME;

export const createAddress = async (req: Request, res: Response) => {
    const { cliente_id, domicilio, colonia, municipio, estado, tipo_direccion } = req.body;

    if (!cliente_id) {
        res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({ error: "Missing cliente_id" });
    }

    const clientCheckParams = {
        TableName: clients_table || '',
        Key: { id: cliente_id }
    };

    const clientData = await dynamoDB.get(clientCheckParams).promise();
    if (!clientData.Item) {
        res.status(HTTP_STATUS_CODES.NOT_FOUND).json({ error: "Client does not exist" });
    }

    try {

        const newDomicilio = {
            id: uuidv4(),
            cliente_id,
            domicilio,
            colonia,
            municipio,
            estado,
            tipo_direccion
        };

        const params = {
            TableName: addresses_table || '',
            Item: newDomicilio
        };

        await dynamoDB.put(params).promise();
        res.status(HTTP_STATUS_CODES.CREATED).json(newDomicilio);
    } catch (error) {
        console.error(error);
        res.status(HTTP_STATUS_CODES.SERVER_ERROR).json({ error: "Error creating address" });
    }
};

export const getAddresses = async (_req: Request, res: Response) => {
    const params = {
        TableName: addresses_table || ''
    };

    try {
        const data = await dynamoDB.scan(params).promise();
        res.json(data.Items);
    } catch (error) {
        res.status(HTTP_STATUS_CODES.SERVER_ERROR).json({ error: "Error obtaining addresses" });
    }
};

export const getAddressById = async (req: Request, res: Response) => {
    const params = {
        TableName: addresses_table || '',
        Key: {
            id: req.params.id
        }
    };

    try {
        const data = await dynamoDB.get(params).promise();
        if (!data.Item) {
            res.status(HTTP_STATUS_CODES.NOT_FOUND).json({ error: "Address not found" });
        }

        res.json(data.Item);
    } catch (error) {
        console.error("DynamoDB error:", error);
        res.status(HTTP_STATUS_CODES.SERVER_ERROR).json({ error: "Internal Server Error", details: error });
    }    
};

export const updateAddress = async (req: Request, res: Response) => {
    const { domicilio, colonia, municipio, estado, tipo_direccion } = req.body;
    const params = {
        TableName: addresses_table || '',
        Key: { id: req.params.id },
        UpdateExpression: "set domicilio = :d, colonia = :c, municipio = :m, estado = :e, tipo_direccion = :td",
        ExpressionAttributeValues: {
            ":d": domicilio,
            ":c": colonia,
            ":m": municipio,
            ":e": estado,
            ":td": tipo_direccion
        },
        ReturnValues: "ALL_NEW"
    };

    try {
        const data = await dynamoDB.update(params).promise();
        res.json(data.Attributes);
    } catch (error) {
        res.status(HTTP_STATUS_CODES.SERVER_ERROR).json({ error: "Error updating address" });
    }
};

export const deleteAddress = async (req: Request, res: Response) => {
    const params = {
        TableName: addresses_table || '',
        Key: { id: req.params.id }
    };

    try {
        await dynamoDB.delete(params).promise();
        res.json({ message: "Address deleted successfully" });
    } catch (error) {
        res.status(HTTP_STATUS_CODES.SERVER_ERROR).json({ error: "Error deleting address" });
    }
};