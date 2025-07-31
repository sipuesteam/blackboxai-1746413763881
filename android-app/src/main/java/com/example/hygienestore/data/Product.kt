package com.example.hygienestore.data

/**
 * Data class representing a single product.
 * This structure should match the data fields provided by the Google Apps Script JSON feed.
 */
data class Product(
    val id: Int,
    val category: String,
    val name: String,
    val description: String,
    val price: Double,
    val imageUrl: String,
    val amazonAsin: String,
    val stockLeft: Int,
    val peopleViewing: Int,
    val starRating: String,
    val videoUrl: String,
    val isVerifiedSeller: Boolean,
    val isBestSeller: Boolean,
    val isEcoCertified: Boolean,
    val retailPrice: Double
)
