package vn.dev.directus

import android.content.Intent
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import androidx.appcompat.app.AppCompatActivity

class SplashActivity : AppCompatActivity() {
    
    private val SPLASH_DISPLAY_TIME = 2000L // 2 seconds
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.splash_screen)
        
        // Using Handler to delay loading the main activity
        Handler(Looper.getMainLooper()).postDelayed({
            // Start main activity
            val mainIntent = Intent(this, MainActivity::class.java)
            startActivity(mainIntent)
            
            // Close splash activity
            finish()
        }, SPLASH_DISPLAY_TIME)
    }
}