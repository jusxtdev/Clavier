import ProductService from "@/services/product.service.js"
import { prisma } from "../db.js"
import {products} from "./transform.js"

ProductService

export async function load() {
    for (const item of products){
        await ProductService.createProduct(item)
    }
}

try {
    await load()
} catch (e){
    console.error(e)
}