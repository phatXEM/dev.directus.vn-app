package vn.dev.directus

import android.content.Intent
import android.os.Bundle
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import com.facebook.FacebookSdk
import com.facebook.CallbackManager
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.auth.api.signin.GoogleSignInOptions

class MainActivity : ReactActivity() {
  // Facebook callback manager for handling login results
  private var callbackManager: CallbackManager? = null

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    
    // Initialize Facebook callback manager
    callbackManager = CallbackManager.Factory.create()
    
    // Configure Google Sign-In
    val gso = GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
      .requestIdToken(getString(R.string.server_client_id))
      .requestEmail()
      .build()
    
    // Initialize Google Sign-In client
    GoogleSignIn.getClient(this, gso)
  }

  /**
   * Handle Facebook and Google login callbacks from external activities
   */
  override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
    super.onActivityResult(requestCode, resultCode, data)
    
    // Pass the activity result to the Facebook SDK
    callbackManager?.onActivityResult(requestCode, resultCode, data)
    
    // The result is automatically forwarded to the React Native GoogleSignin module
    // so no additional code is needed here for Google Sign-In
  }

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "rn_dev_directus"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}
