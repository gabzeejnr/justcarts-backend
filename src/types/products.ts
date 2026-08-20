export interface SeedProduct {
    name: string,
    price: number,
    description?: string,
    category: string
    imageUrl: string
}


interface Review {
    rating: 1 | 2 | 3 | 4 | 5,
    comment: string,
    date: string,
    reviewerName: string,
    reviewerEmail: string
}

export interface DummyJson {
    id: number | string,
    title: string,
    description: string,
    category: string,
    price: number,
    discountPercentage?: number,
    rating: number,
    stock: number,
    tags?: string[],
    brand?: string,
    warrantyInformation?: string,
    shippingInformation?: string,
    availabilityStatus: string,
    reviews: Review[],
    returnPolicy?: string,
    minimumOrderQuantity?: number,
    images: string[],
    thumbnail?: string,
    meta?: string[]
}