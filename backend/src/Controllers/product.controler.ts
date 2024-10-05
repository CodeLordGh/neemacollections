import { Request, Response } from "express";
import { Product } from "../Models/product.model";
import { validateProduct } from "../utils/validation";

export const getAllProducts = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        let query = {};
        
        console.log(user)

        // If user is not admin, only show active products
        if (!user?.isAdmin) {
            query = { active: true };
        } else if (user.adminSettings?.showInactiveProducts === false) {
            // If admin has chosen to hide inactive products
            query = { active: true };
        }

        const products = await Product.find(query).lean();
        
        if (products.length === 0) {
            return res.status(404).json({ message: 'No products found' });
        }
        
        res.json(products);
    } catch (error) {
        console.error('Error retrieving products:', error);
        res.status(500).json({ message: 'Error retrieving products' });
    }
};

export const addProduct = async (req: Request, res: Response) => {
    const { title, description, price, category, variants, images } = req.body;

    const validationError = validateProduct(req.body);
    if (validationError) {
        return res.status(400).json({ message: validationError });
    }

    try {
        const existingProduct = await Product.findOne({ title });
        if (existingProduct) {
            return res.status(409).json({ message: `Product with this title already exists. Please use a different title.` });
        }

        const newProduct = new Product({
            title, description, price, category, variants, images
        });

        await newProduct.save();
        res.status(201).json({ message: `Product ${title} added successfully!`, product: newProduct });
    } catch (error) {
        console.error('Error saving product:', error);
        res.status(500).json({ message: `Error saving product ${title}!` });
    }
}

export const updateProduct = async (req: Request, res: Response) => {
    const { productId } = req.params;
    const updateData = req.body;

    try {
        // Check if productId is provided
        if (!productId) {
            return res.status(400).json({ message: 'Product ID is required' });
        }

        // Find the existing product
        const existingProduct = await Product.findById(productId);
        if (!existingProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // If it's just toggling active status
        if (Object.keys(updateData).length === 1 && 'active' in updateData) {
            existingProduct.active = updateData.active;
            const updatedProduct = await existingProduct.save();
            return res.json({
                message: 'Product status updated successfully',
                product: updatedProduct
            });
        }

        // For full updates, validate the entire product data
        const validationError = validateProduct(updateData);
        if (validationError) {
            return res.status(400).json({ message: validationError });
        }

        // Update all fields
        Object.assign(existingProduct, updateData);

        // Save the updated product
        const updatedProduct = await existingProduct.save();

        res.json({
            message: 'Product updated successfully',
            product: updatedProduct
        });
    } catch (error: any) {
        console.error('Error updating product:', error);
        res.status(500).json({
            message: 'Error updating product',
            error: error.message
        });
    }
};

export const deleteProduct = async (req: Request, res: Response) => {
    const { productId } = req.params;

    try {
        const product = await Product.findByIdAndDelete(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json({ message: 'Product deleted successfully', product });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ message: 'Error deleting product' });
    }
}

export const getProductById = async (req: Request, res: Response) => {
    const {productId} = req.params;
    // console.log(productId)
    try {
        const product = await Product.findById(productId);
        if (!product) {
            res.json({message: 'Product not found'});
        } else {
            res.json(product);
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({message: 'Error retrieving product'});
    }
}

export const searchProduct = async (req: Request, res: Response) => {
    const { searchTerm, category, minPrice, maxPrice } = req.query;

    try {
        let query: any = {};
        if (searchTerm) {
            query = { $or: [{ title: { $regex: searchTerm, $options: 'i' } }, { description: { $regex: searchTerm, $options: 'i' } }] };
        }
        if (category) {
            query.category = category;
        }
        if (minPrice && maxPrice) {
            query.price = { $gte: Number(minPrice), $lte: Number(maxPrice) };
        }

        const products = await Product.find(query);
        res.json(products);
    } catch (error) {
        console.error('Error searching products:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}