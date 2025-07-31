// Define the package for your Activity
package com.example.hygienestore

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import com.example.hygienestore.data.Product
import com.example.hygienestore.databinding.ActivityMainBinding
import com.example.hygienestore.ui.ProductAdapter
import okhttp3.*
import org.json.JSONArray
import java.io.IOException

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private val client = OkHttpClient()

    // --- CONFIGURATION ---
    // IMPORTANT: Replace these placeholder values with your actual data
    private val affiliateTag = "your-amazon-affiliate-tag-20"
    private val googleAppsScriptUrl = "YOUR_GOOGLE_APPS_SCRIPT_JSON_FEED_URL_HERE"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setSupportActionBar(binding.toolbar)
        supportActionBar?.title = "Hygiene & Cleaning Products"

        binding.recyclerView.layoutManager = LinearLayoutManager(this)

        fetchProducts()
    }

    private fun fetchProducts() {
        binding.progressBar.visibility = View.VISIBLE
        binding.recyclerView.visibility = View.GONE
        binding.emptyTextView.visibility = View.GONE

        if (googleAppsScriptUrl == "YOUR_GOOGLE_APPS_SCRIPT_JSON_FEED_URL_HERE") {
            binding.progressBar.visibility = View.GONE
            binding.emptyTextView.visibility = View.VISIBLE
            binding.emptyTextView.text = "Please configure the Google Apps Script URL in MainActivity.kt"
            return
        }

        val request = Request.Builder().url(googleAppsScriptUrl).build()

        client.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                runOnUiThread {
                    binding.progressBar.visibility = View.GONE
                    binding.emptyTextView.visibility = View.VISIBLE
                    binding.emptyTextView.text = "Failed to load products: ${e.message}"
                    Toast.makeText(this@MainActivity, "Failed to load products", Toast.LENGTH_SHORT).show()
                }
                e.printStackTrace()
            }

            override fun onResponse(call: Call, response: Response) {
                if (!response.isSuccessful) {
                    runOnUiThread {
                        binding.progressBar.visibility = View.GONE
                        binding.emptyTextView.visibility = View.VISIBLE
                        binding.emptyTextView.text = "Error fetching products: ${response.code}"
                        Toast.makeText(this@MainActivity, "Error fetching products", Toast.LENGTH_SHORT).show()
                    }
                    response.close()
                    return
                }

                response.body?.string()?.let { body ->
                    try {
                        val products = parseProducts(body)
                        runOnUiThread {
                            binding.progressBar.visibility = View.GONE
                            if (products.isEmpty()) {
                                binding.emptyTextView.visibility = View.VISIBLE
                                binding.emptyTextView.text = "No products available at the moment."
                            } else {
                                binding.emptyTextView.visibility = View.GONE
                                binding.recyclerView.visibility = View.VISIBLE
                                binding.recyclerView.adapter = ProductAdapter(products,
                                    onItemClick = { product -> openAmazonLink(product) },
                                    onViewAmazonClick = { product -> openAmazonLink(product) },
                                    onReviewsClick = { product -> openAmazonLink(product) } // Placeholder action
                                )
                            }
                        }
                    } catch (e: Exception) {
                        runOnUiThread {
                            binding.progressBar.visibility = View.GONE
                            binding.emptyTextView.visibility = View.VISIBLE
                            binding.emptyTextView.text = "Error parsing product data: ${e.message}"
                            Toast.makeText(this@MainActivity, "Error processing products", Toast.LENGTH_SHORT).show()
                        }
                        e.printStackTrace()
                    }
                } ?: run {
                    runOnUiThread {
                        binding.progressBar.visibility = View.GONE
                        binding.emptyTextView.visibility = View.VISIBLE
                        binding.emptyTextView.text = "Received empty response body."
                        Toast.makeText(this@MainActivity, "Empty response", Toast.LENGTH_SHORT).show()
                    }
                }
                response.close()
            }
        })
    }

    private fun parseProducts(jsonString: String): List<Product> {
        val productList = mutableListOf<Product>()
        val jsonArray = JSONArray(jsonString)
        for (i in 0 until jsonArray.length()) {
            val obj = jsonArray.getJSONObject(i)
            val product = Product(
                id = obj.optInt("productId"),
                category = obj.optString("productCategory"),
                name = obj.optString("productName"),
                description = obj.optString("productDescription"),
                price = obj.optDouble("productPrice", 0.0),
                retailPrice = obj.optDouble("productPriceOld", 0.0),
                imageUrl = obj.optString("productImageUrl"),
                amazonAsin = obj.optString("productAsin"),
                videoUrl = obj.optString("productVideoUrl"),
                starRating = obj.optString("productRating", "N/A"),
                stockLeft = obj.optString("productFomoText", "0").filter { it.isDigit() }.toIntOrNull() ?: 0,
                peopleViewing = 10, // Default value
                isVerifiedSeller = obj.optString("productBadge") == "Verified Seller",
                isBestSeller = obj.optString("productBadge") == "Best Seller",
                isEcoCertified = obj.optString("productBadge") == "Eco-Friendly"
            )
            productList.add(product)
        }
        return productList
    }

    private fun openAmazonLink(product: Product) {
        if (product.amazonAsin.isBlank()) {
            Toast.makeText(this, "Product ASIN not available.", Toast.LENGTH_SHORT).show()
            return
        }
        val url = "https://www.amazon.com/dp/${product.amazonAsin}?tag=$affiliateTag"
        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
        startActivity(intent)
    }
}
