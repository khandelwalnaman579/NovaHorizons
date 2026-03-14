import joi from "joi";
export const listingSchema = joi.object({
    listing : joi.object({
        title: joi.string().required(),
        description: joi.string().required(),
        imageUrl: joi.string().allow("",null),
        price: joi.number().required().min(0),
        destination: joi.string().required(),
        capacity: joi.number().required().min(1),
        durationInDays: joi.number().required().min(0),
        amenities: joi.string().allow("", null),
        availableFrom : joi.date().allow(null),
        availableTo: joi.date().greater(joi.ref('availableFrom')).allow(null),
}).required()
});

// export default listingSchema;

export const reviewSchema = joi.object({
    review : joi.object({
        comment: joi.string().required(),
        rating: joi.number().required().min(1).max(5),
}).required()
});