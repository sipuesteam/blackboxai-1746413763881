// Define the package for your Adapter
// Ensure this matches the package declaration in your project
package com.example.hygienestore.ui // Assuming 'ui' package for adapters

import android.graphics.Paint // Import for strike-through text
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import androidx.core.content.ContextCompat // Import for getting color resources
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide // Import Glide for image loading
import com.example.hygienestore.R // Import your project's R file to access resources (layouts, drawables, colors)
import com.example.hygienestore.data.Product // Import the Product data class (ensure package is correct)


// This class is the Adapter for the RecyclerView.
// It bridges the gap between your data (List<Product>) and the RecyclerView's UI.
// It extends RecyclerView.Adapter and specifies your custom ViewHolder (ProductViewHolder).
// The constructor now accepts click listeners for the whole item, the "View on Amazon" button, and the "View Reviews" button.
class ProductAdapter(
    private val products: List<Product>, // The list of product data to display
    private val onItemClick: (Product) -> Unit, // Lambda function to call when the whole item is clicked (e.g., open description popup)
    private val onViewAmazonClick: (Product) -> Unit, // Lambda function to call when the "View on Amazon" button is clicked
    private val onReviewsClick: (Product) -> Unit // Lambda function to call when the "View Reviews" button is clicked
) : RecyclerView.Adapter<ProductAdapter.ProductViewHolder>() {

    // ProductViewHolder holds the views for a single item in the RecyclerView.
    // It extends RecyclerView.ViewHolder.
    class ProductViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        // Declare and initialize the views from your list item layout (list_item_product.xml)
        // Using findViewById to get references to the UI elements
        val productImageView: ImageView = itemView.findViewById(R.id.productImageView) // Image view for product image
        val productNameTextView: TextView = itemView.findViewById(R.id.productNameTextView) // Text view for product name
        val productDescriptionTextView: TextView = itemView.findViewById(R.id.productDescriptionTextView) // Text view for product description
        val retailPriceTextView: TextView = itemView.findViewById(R.id.retailPriceTextView) // Text view for retail price
        val productPriceTextView: TextView = itemView.findViewById(R.id.productPriceTextView) // Text view for current price
        val starRatingTextView: TextView = itemView.findViewById(R.id.starRatingTextView) // Text view for star rating
        val peopleViewingTextView: TextView = itemView.findViewById(R.id.peopleViewingTextView) // Text view for people viewing count
        val stockLeftTextView: TextView = itemView.findViewById(R.id.stockLeftTextView) // Text view for stock left count

        val badgesContainer: LinearLayout = itemView.findViewById(R.id.badgesContainer) // Container for badges
        val verifiedSellerBadge: TextView = itemView.findViewById(R.id.verifiedSellerBadge) // Verified Seller badge TextView
        val bestSellerBadge: TextView = itemView.findViewById(R.id.bestSellerBadge) // Best Seller badge TextView
        val ecoCertifiedBadge: TextView = itemView.findViewById(R.id.ecoCertifiedBadge) // Eco-Certified badge TextView

        val payWithAmazonButton: Button = itemView.findViewById(R.id.payWithAmazonButton) // Pay with Amazon button
        val viewAmazonButton: Button = itemView.findViewById(R.id.viewAmazonButton) // View on Amazon button
        val viewReviewsButton: Button = itemView.findViewById(R.id.viewReviewsButton) // View Reviews button

        // Hidden TextViews to hold data that might not be displayed but is needed for actions
        val videoUrlTextView: TextView = itemView.findViewById(R.id.videoUrlTextView)
        val amazonAsinTextView: TextView = itemView.findViewById(R.id.amazonAsinTextView)
        val productIdTextView: TextView = itemView.findViewById(R.id.productIdTextView)
        val productCategoryTextView: TextView = itemView.findViewById(R.id.productCategoryTextView)

        // Note: The item view itself (the CardView) can also have a click listener attached.
        // This is handled in the onBindViewHolder method below.
    }

    /**
     * Called when RecyclerView needs a new {@link ProductViewHolder} of the given type to represent
     * an item.
     * This method is called by the RecyclerView. It creates and returns a new ViewHolder,
     * but does not bind any data to it.
     * @param parent The ViewGroup into which the new View will be added after it is bound to
     * an adapter position.
     * @param viewType The view type of the new View.
     * @return A new ViewHolder that holds a View of the given view type.
     */
    @NonNull
    @Override
    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ProductViewHolder {
        // Inflate the layout for a single list item (list_item_product.xml)
        // LayoutInflater is used to instantiate layout XML file into its corresponding View objects.
        // Pass 'false' as the third argument to prevent the inflater from automatically adding the view to the parent.
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.list_item_product, parent, false) // Corrected layout file name

        // Create and return a new instance of your custom ViewHolder, passing the inflated item view.
        return ProductViewHolder(view)
    }

    /**
     * Called by RecyclerView to display the data at the specified position.
     * This method is called by the RecyclerView. It takes the ViewHolder and the position
     * of the item in the data set and updates the views within the ViewHolder to reflect
     * the data of the item at that position.
     * @param holder The ViewHolder which should be updated to represent the contents of the
     * item at the given position in the data set.
     * @param position The position of the item within the adapter's data set.
     */
    @Override
    override fun onBindViewHolder(holder: ProductViewHolder, position: Int) {
        // Get the Product object for the current position
        val product = products[position]

        // Bind data to the TextViews
        holder.productNameTextView.text = product.name
        holder.productDescriptionTextView.text = product.description

        // Format and bind the retail price with strike-through
        if (product.retailPrice > 0 && product.retailPrice > product.price) {
            holder.retailPriceTextView.text = "Reg. Price: $${String.format("%.2f", product.retailPrice)}"
            holder.retailPriceTextView.paintFlags = holder.retailPriceTextView.paintFlags or Paint.STRIKE_THRU_TEXT_FLAG // Apply strike-through
            holder.retailPriceTextView.visibility = View.VISIBLE // Make visible if valid retail price exists
        } else {
            holder.retailPriceTextView.visibility = View.GONE // Hide if no valid retail price
        }

        // Format and bind the current price
        holder.productPriceTextView.text = "$${String.format("%.2f", product.price)}" // Format price to 2 decimal places

        // Bind star rating (assuming it's a string like "4.7")
        if (product.starRating.isNotBlank() && product.starRating != "N/A") {
            holder.starRatingTextView.text = product.starRating
            holder.starRatingTextView.visibility = View.VISIBLE
            // Optional: Set a drawableStart icon for the star if needed (defined in list_item_product.xml)
            // holder.starRatingTextView.setCompoundDrawablesWithIntrinsicBounds(R.drawable.ic_star, 0, 0, 0)
        } else {
            holder.starRatingTextView.visibility = View.GONE
        }

        // Bind Stock Left count and message
        if (product.stockLeft > 0) {
            holder.stockLeftTextView.text = "Only ${product.stockLeft} left in stock!"
            holder.stockLeftTextView.setTextColor(ContextCompat.getColor(holder.itemView.context, android.R.color.holo_red_dark)) // Set text color to red
            holder.stockLeftTextView.visibility = View.VISIBLE
        } else {
            holder.stockLeftTextView.text = "Currently out of stock."
            holder.stockLeftTextView.setTextColor(ContextCompat.getColor(holder.itemView.context, android.R.color.darker_gray)) // Set text color to gray
            holder.stockLeftTextView.visibility = View.VISIBLE // Still show the "out of stock" message
        }

        // Bind People Viewing count and message
        if (product.peopleViewing > 0) {
            holder.peopleViewingTextView.text = "${product.peopleViewing} people viewing now"
            holder.peopleViewingTextView.visibility = View.VISIBLE
        } else {
            holder.peopleViewingTextView.visibility = View.GONE // Hide if 0 or less people viewing
        }


        // Bind product badges visibility based on boolean flags
        holder.verifiedSellerBadge.visibility = if (product.isVerifiedSeller) View.VISIBLE else View.GONE
        holder.bestSellerBadge.visibility = if (product.isBestSeller) View.VISIBLE else View.GONE
        holder.ecoCertifiedBadge.visibility = if (product.isEcoCertified) View.VISIBLE else View.GONE

        // If no badges are visible, you might want to hide the badges container itself
        if (!product.isVerifiedSeller && !product.isBestSeller && !product.isEcoCertified) {
            // Optional: Add a default "Available" badge if none of the others are shown
            // Or simply hide the container if no badges are relevant
             // For simplicity, we'll just ensure the container is visible if any badge is visible.
             // If all are GONE, the LinearLayout might collapse on its own depending on layout params,
             // but explicitly setting the container to GONE ensures it takes no space.
             // However, the layout_marginTop on badgesContainer is constrained to productImageView bottom,
             // so hiding the container might affect subsequent elements' positioning.
             // Let's keep the container visible but ensure the badges inside are correctly hidden/shown.
        }


        // Bind data to the hidden TextViews (for easy access in click listeners)
        holder.videoUrlTextView.text = product.videoUrl
        holder.amazonAsinTextView.text = product.amazonAsin
        holder.productIdTextView.text = product.id.toString()
        holder.productCategoryTextView.text = product.category


        // Load the product image using Glide
        // Glide handles caching, resizing, and asynchronous loading efficiently
        Glide.with(holder.productImageView.context) // Use the context of the ImageView
            .load(product.imageUrl) // Load the image from the provided URL
            .centerCrop() // Or .centerInside() or .fitCenter() depending on desired scaling
            .placeholder(R.drawable.placeholder_image) // Show a placeholder image while loading (create this drawable)
            .error(R.drawable.error_image) // Show an error image if loading fails (create this drawable)
            .into(holder.productImageView) // Display the loaded image in the ImageView


        // Set click listeners
        // Set a click listener for the entire item view (the CardView)
        holder.itemView.setOnClickListener {
            // Call the onItemClick lambda function, passing the current product
            onItemClick(product)
        }

        // Set a click listener for the "View on Amazon" button
        holder.viewAmazonButton.setOnClickListener {
            // Call the onViewAmazonClick lambda function, passing the current product
            onViewAmazonClick(product)
        }

        // Set a click listener for the "View Reviews" button
        holder.viewReviewsButton.setOnClickListener {
            // Call the onReviewsClick lambda function, passing the current product
            onReviewsClick(product)
        }

        // The "Pay with Amazon" button's click behavior is typically handled by the Amazon Pay SDK
        // after it's rendered, but a fallback listener can be added here if needed.
        // holder.payWithAmazonButton.setOnClickListener { /* Fallback action */ }
        // Ensure the Pay with Amazon button's visibility is managed elsewhere if needed
        // based on SDK availability or product type.
        // For now, its visibility is controlled by the layout XML (initially gone) and potentially the Activity/Fragment.
    }

    /**
     * Returns the total number of items in the data set held by the adapter.
     * @return The total number of items in this adapter.
     */
    @Override
    override fun getItemCount(): Int {
        return products.size // Return the size of the product list
    }

    // You can add a method to update the product list if the data changes
    // fun updateProducts(newProducts: List<Product>) {
    //     this.products = newProducts
    //     notifyDataSetChanged() // Notify the adapter that the data set has changed
    // }
}
