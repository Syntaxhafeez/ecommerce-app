import api from "@/constants/api";
import { CartItem, Product } from "@/constants/types";
import { useAuth } from "@clerk/expo";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import Toast from "react-native-toast-message";

export type cartItems = {
    id: string;
    productId: string;
    product: Product;
    quantity: number;
    size: string;
    price: number;
}

type cartContextType = {
    cartItems: CartItem[],
    addToCart: (product: Product, size: string) => Promise<void>;
    removeFromCart: (itemId: string, size: string) => Promise<void>;
    updateQuantity: (itemId: string, quantity: number, size: string) => Promise<void>;
    clearCart: () => Promise<void>;
    cartTotal: number;
    itemCount: number;
    isLoading: boolean;
}


const cartContext = createContext<cartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {

    const [cartItems, setCartItems] = useState<CartItem[]>([])
    const [isLoading, setIsLoading] = useState(false);
    const [cartTotal, setCartTotal] = useState(0);
    const { getToken, isSignedIn } = useAuth();

    const fetchCart = async () => {
        try {
            setIsLoading(true)
            const token = await getToken()
            const { data } = await api.get('/cart', { headers: { Authorization: `Bearer ${token}` } })

            if (data.success && data.data) {
                const serverCart = data.data;
                const mappedItems: CartItem[] = serverCart.items.map((item: any) => ({
                    id: item.product._id,
                    productId: item.product._id,
                    product: item.product,
                    quantity: item.quantity,
                    size: item?.size || 'M',
                    price: item.price
                }));

                setCartItems(mappedItems);
                setCartTotal(serverCart.totalAmount);
                setIsLoading(false);
            }

        } catch (error) {
            console.error("Failed to fetch cart: ", error)

        } finally {
            setIsLoading(true);
        }
    }

    const addToCart = async (product: Product, size: string) => {
        if (!isSignedIn) {
            return Toast.show({
                text1: "Please login to add to cart",
                type: 'error'
            })
        }
        try {
            setIsLoading(true)
            const token = await getToken()
            const { data } = await api.post('/cart/add', { productId: product._id, quantity: 1, size }, { headers: { Authorization: `Bearer ${token}` } })

            if (data.success) {
                await fetchCart()
            }
        } catch (error) {
            console.error("Failed to add to cart:", error);
            Toast.show({
                text1: 'Failed to add to cart',
                type: 'error'
            })
        } finally {
            setIsLoading(false);
        }
    }

    const removeFromCart = async (productId: string, size: string) => {
        if (!isSignedIn) return;

        try {
            setIsLoading(true);
            const token = await getToken();
            const { data } = await api.delete(`/cart/item/${productId}?size=${size}`, { headers: { Authorization: `Bearer ${token}` } })

            if (data.success) {
                await fetchCart()
            }

        } catch (error) {
            console.error("Failed to remove from cart: ", error)
        } finally {
            setIsLoading(false)
        }
    }

    const updateQuantity = async (productId: string, quantity: number, size: string = 'M') => {
        if (!isSignedIn) return;
        if (quantity < 1) return;

        try {
            setIsLoading(true);
            const token = await getToken();
            const { data } = await api.put(`/cart/item/${productId}`, { quantity, size }, { headers: { Authorization: `Bearer ${token}` } })

            if (data.success) {
                await fetchCart()
            }

        } catch (error) {
            console.error("Failed to update quantity: ", error)
        } finally {
            setIsLoading(false)
        }
    }

    const clearCart = async () => {
        if (!isSignedIn) return;

        try {
            setIsLoading(true);
            const token = await getToken();
            const { data } = await api.delete(`/cart`, { headers: { Authorization: `Bearer ${token}` } })

            if (data.success) {
                setCartItems([]);
                setCartTotal(0)
            }

        } catch (error) {
            console.error("Failed to clear cart: ", error)
        } finally {
            setIsLoading(false)
        }
    }

    const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)


    useEffect(() => {
        if (isSignedIn) {
            fetchCart();
        } else {
            setCartItems([]);
            setCartTotal(0);
        }

        fetchCart()
    }, [isSignedIn])

    return (
        <cartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, itemCount, isLoading }}>
            {children}
        </cartContext.Provider>
    )
}


export function useCart() {
    const context = useContext(cartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a cartProvider')
    }
    return context
}
