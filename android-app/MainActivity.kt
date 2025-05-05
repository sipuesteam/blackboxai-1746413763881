// Define the package for your Activity
package com.example.hygienestore

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.hygienestore.databinding.ActivityMainBinding // Import the generated binding class
import okhttp3.*
import org.json.JSONArray
import java.io.IOException

// Import the Product data class (ensure its package is correct)
import com.example.hygienestore.data.Product
// Import the ProductAdapter (ensure its package is correct)
import com.example.hygienestore.ui.ProductAdapter

// MainActivity is the main screen of the application, responsible for displaying the product list.
class MainActivity : AppCompatActivity() {

    // View Binding instance for accessing UI elements safely
    private lateinit var binding: ActivityMainBinding

    // OkHttpClient instance for making network requests
    private val client = OkHttpClient()

    // Your Amazon Associates affiliate tag
    // <-- IMPORTANT: Replace with your actual Amazon Associates Tracking ID -->
    private val affiliateTag = "youraffiliatetag-20" // <-- REPLACE

    // The URL of your Google Apps Script web app that serves the product data JSON.
    // This URL must be deployed with "Execute as: Me" and "Who has access: Anyone".
    // <-- IMPORTANT: Replace with your actual Google Apps Script Deployment URL for product data -->
    private val googleAppsScriptUrl = "YOUR_GOOGLE_APPS_SCRIPT_JSON_FEED_URL_HERE" // <-- REPLACE

    // Called when the activity is first created.
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // Inflate the layout using View Binding
        binding = ActivityMainBinding.inflate(layoutInflater)
        // Set the root view of the binding as the activity's content view
        setContentView(binding.root)

        // Set up the Toolbar as the Activity's ActionBar
        // Ensure you have a Toolbar with id 'toolbar' in activity_main.xml
        setSupportActionBar(binding.toolbar)
        // Optional: Set a title for the Toolbar
        supportActionBar?.title = "Hygiene & Cleaning Products"

        // Configure the RecyclerView
        // Set the layout manager to LinearLayoutManager for a vertical list
        binding.recyclerView.layoutManager = LinearLayoutManager(this)

        // Initiate fetching the product data from the network
        fetchProducts()
    }

    // Function to fetch product data asynchronously using OkHttp.
    private fun fetchProducts() {
        // Show the loading indicator (ProgressBar)
        binding.progressBar.visibility = View.VISIBLE
        // Hide the RecyclerView and Empty TextView initially
        binding.recyclerView.visibility = View.GONE
        binding.emptyTextView.visibility = View.GONE

        // Build the network request
        val request = Request.Builder()
            .url(googleAppsScriptUrl) // Set the URL to fetch data from
            .build() // Build the request object

        // Enqueue the request to be executed asynchronously
        client.newCall(request).enqueue(object : Callback {
            // Callback for network request failure
            override fun onFailure(call: Call, e: IOException) {
                // Run UI updates on the main thread
                runOnUiThread {
                    // Hide the loading indicator
                    binding.progressBar.visibility = View.GONE
                    // Show the empty state message on failure
                    binding.emptyTextView.visibility = View.VISIBLE
                    binding.emptyTextView.text = "Failed to load products: ${e.message}" // Display error message

                    // Show a Toast message to the user
                    Toast.makeText(this@MainActivity, "Failed to load products", Toast.LENGTH_SHORT).show()
                }
                // Log the failure for debugging
                e.printStackTrace()
            }

            // Callback for successful network response
            override fun onResponse(call: Call, response: Response) {
                // Check if the response was successful (HTTP status code 2xx)
                if (!response.isSuccessful) {
                    runOnUiThread {
                        // Hide the loading indicator
                        binding.progressBar.visibility = View.GONE
                        // Show an error message if the response was not successful
                        binding.emptyTextView.visibility = View.VISIBLE
                        binding.emptyTextView.text = "Error fetching products: ${response.code}"
                        Toast.makeText(this@MainActivity, "Error fetching products", Toast.LENGTH_SHORT).show()
                    }
                    // Close the response body to free up resources
                    response.close()
                    return // Exit the function early
                }

                // Get the response body as a string
                response.body?.string()?.let { body ->
                    try {
                        // Parse the JSON string into a list of Product objects
                        val products = parseProducts(body)

                        // Run UI updates on the main thread
                        runOnUiThread {
                            // Hide the loading indicator
                            binding.progressBar.visibility = View.GONE

                            // Check if the parsed product list is empty
                            if (products.isEmpty()) {
                                // Show the empty state message if no products are found
                                binding.emptyTextView.visibility = View.VISIBLE
                                binding.emptyTextView.text = "No products available at the moment."
                            } else {
                                // Hide the empty state message
                                binding.emptyTextView.visibility = View.GONE
                                // Show the RecyclerView
                                binding.recyclerView.visibility = View.VISIBLE
                                // Create and set the adapter for the RecyclerView
                                // Pass the list of products and a click listener lambda
                                binding.recyclerView.adapter = ProductAdapter(products) { product ->
                                    // This lambda is executed when a product item is clicked
                                    openAmazonLink(product) // Open the Amazon link for the clicked product
                                }
                            }
                        }
                    } catch (e: Exception) {
                        // Catch any exceptions during JSON parsing or other processing
                        runOnUiThread {
                            // Hide the loading indicator
                            binding.progressBar.visibility = View.GONE
                            // Show an error message if parsing failed
                            binding.emptyTextView.visibility = View.VISIBLE
                            binding.emptyTextView.text = "Error parsing product data: ${e.message}"
                            Toast.makeText(this@MainActivity, "Error processing products", Toast.LENGTH_SHORT).show()
                        }
                        // Log the parsing error
                        e.printStackTrace()
                    }
                } ?: run {
                    // Handle the case where the response body is null
                    runOnUiThread {
                        binding.progressBar.visibility = View.GONE
                        binding.emptyTextView.visibility = View.VISIBLE
                        binding.emptyTextView.text = "Received empty response body."
                        Toast.makeText(this@MainActivity, "Empty response", Toast.LENGTH_SHORT).show()
                    }
                    println("OkHttp Response: Received null response body.") // Log the null body
                }

                // Close the response body to free up resources
                response.close()
            }
        })
    }

    // Function to parse the JSON string received from the Google Apps Script.
    // It expects a JSON array of objects, where each object represents a product.
    private fun parseProducts(jsonString: String): List<Product> {
        val productList = mutableListOf<Product>()
        try {
            val jsonArray = JSONArray(jsonString) // Attempt to parse the JSON string as a JSONArray
            for (i in 0 until jsonArray.length()) {
                val obj = jsonArray.getJSONObject(i) // Get each JSON object (product)

                // Extract data from the JSON object, using opt* methods for null safety
                val product = Product(
                    id = obj.optInt("Product ID"),
                    category = obj.optString("Category"),
                    name = obj.optString("Product Name"),
                    description = obj.optString("Description"),
                    price = obj.optDouble("Price ($)", 0.0), // Provide a default value (0.0) if price is missing or not a number
                    imageUrl = obj.optString("Image URL"),
                    amazonAsin = obj.optString("Amazon ASIN"),
                    stockLeft = obj.optInt("Stock Left", 0), // Added missing properties with defaults
                    peopleViewing = obj.optInt("People Viewing", 0),
                    starRating = obj.optString("Star Rating", "N/A"),
                    videoUrl = obj.optString("Video URL", ""),
                    isVerifiedSeller = obj.optBoolean("Is Verified Seller", false),
                    isBestSeller = obj.optBoolean("Is Best Seller", false),
                    isEcoCertified = obj.optBoolean("Is Eco Certified", false),
                    retailPrice = obj.optDouble("Retail Price ($)", 0.0)
                )
                productList.add(product) // Add the created Product object to the list
            }
        } catch (e: Exception) {
            // Catch any exceptions during JSON parsing (e.g., not a valid JSON array)
            println("Error parsing JSON: ${e.message}") // Log the parsing error
            e.printStackTrace()
            // Return an empty list if parsing fails
            return emptyList()
        }
        return productList // Return the list of parsed products
    }

    // Function to open the product link on Amazon using an implicit intent.
    // It constructs the Amazon product URL with the affiliate tag.
    private fun openAmazonLink(product: Product) {
        // Construct the Amazon product URL using the ASIN and affiliate tag
        val url = "https://www.amazon.com/dp/${product.amazonAsin}?tag=$affiliateTag"
        // Create an Intent with the ACTION_VIEW action and the parsed URL
        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
        // Start the activity to handle the intent (e.g., open in a web browser)
        startActivity(intent)
    }
}

// Data class representing a single product.
// This structure should match the data fields provided by your Google Apps Script JSON feed.
// Added missing properties based on the web version's data structure.
data class Product(
    val id: Int, // Product ID
    val category: String, // Product category
    val name: String, // Product name
    val description: String, // Product description
    val price: Double, // Product price
    val imageUrl: String, // URL of the product image
    val amazonAsin: String, // Amazon Standard Identification Number (ASIN)
    val stockLeft: Int, // Number of items left in stock (for FOMO)
    val peopleViewing: Int, // Number of people viewing the product (for FOMO)
    val starRating: String, // Star rating (as a string, e.g., "4.5")
    val videoUrl: String, // URL of a promotional video
    val isVerifiedSeller: Boolean, // Flag for verified seller badge
    val isBestSeller: Boolean, // Flag for best seller badge
    val isEcoCertified: Boolean, // Flag for eco-certified badge
    val retailPrice: Double // Original retail price (for showing discount)
)
