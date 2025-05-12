import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
import FBSDKCoreKit
import GoogleSignIn

// Import RNConfig to access environment variables
@_implementationOnly import RNConfig

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
  var window: UIWindow?

  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    // Initialize Facebook SDK FIRST - IMPORTANT: Do this before starting React Native
    initializeFacebookSDK()
    
    // Initialize Google Sign-In
    configureGoogleSignIn()
    
    // Initialize React Native components
    let delegate = ReactNativeDelegate()
    let factory = RCTReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory

    window = UIWindow(frame: UIScreen.main.bounds)

    // Set up a method to update Facebook configuration when env vars are available
    NotificationCenter.default.addObserver(
      forName: NSNotification.Name("RNConfigEnvironmentUpdated"),
      object: nil,
      queue: .main
    ) { notification in
      self.updateFacebookConfiguration(notification.userInfo)
    }
    
    factory.startReactNative(
      withModuleName: "rn_apple_login",
      in: window,
      launchOptions: launchOptions
    )
    
    // Complete Facebook SDK initialization with any remaining options
    ApplicationDelegate.shared.application(
      application,
      didFinishLaunchingWithOptions: launchOptions
    )

    return true
  }
  
  // Initialize Facebook SDK with available configuration
  func initializeFacebookSDK() {
    // Start with default settings from Info.plist
    updateFacebookConfiguration()
    
    // Try to get values directly from RNConfig (these may not be available at launch)
    if let appId = RNConfig.getValueForKey("facebookAppID"), !appId.isEmpty {
      print("[Facebook] Setting App ID from RNConfig: \(appId)")
      Settings.shared.appID = appId
    }
    
    if let clientToken = RNConfig.getValueForKey("facebookClientToken"), !clientToken.isEmpty {
      print("[Facebook] Setting Client Token from RNConfig")
      Settings.shared.clientToken = clientToken
    }
    
    print("[Facebook] SDK initialized with App ID: \(Settings.shared.appID ?? "NOT SET")")
  }
  
  // Configure Google Sign-In with client ID
  func configureGoogleSignIn() {
    // Try to get Google client ID from RNConfig
    if let clientID = RNConfig.getValueForKey("googleClientID"), !clientID.isEmpty {
      print("[Google] Setting Client ID from RNConfig: \(clientID)")
      GIDSignIn.sharedInstance.configuration = GIDConfiguration(clientID: clientID)
    } else if let clientID = Bundle.main.object(forInfoDictionaryKey: "GIDClientID") as? String, !clientID.isEmpty {
      print("[Google] Setting Client ID from Info.plist: \(clientID)")
      GIDSignIn.sharedInstance.configuration = GIDConfiguration(clientID: clientID)
    } else {
      print("[Google] WARNING: No Google Client ID found. Will wait for values from React Native.")
    }
    
    // Listen for RNConfig updates to set Google configuration
    NotificationCenter.default.addObserver(
      forName: NSNotification.Name("RNConfigEnvironmentUpdated"),
      object: nil,
      queue: .main
    ) { notification in
      if let userInfo = notification.userInfo,
         let clientID = userInfo["googleClientID"] as? String,
         !clientID.isEmpty {
        print("[Google] Updating Client ID from notification: \(clientID)")
        GIDSignIn.sharedInstance.configuration = GIDConfiguration(clientID: clientID)
      }
    }
  }
  
  // Handle URL schemes
  func application(
    _ app: UIApplication,
    open url: URL,
    options: [UIApplication.OpenURLOptionsKey : Any] = [:]
  ) -> Bool {
    // Handle Strava deep link (devdirectusapp://auth)
    if url.scheme == "devdirectusapp" {
      return RCTLinkingManager.application(app, open: url, options: options)
    }
    
    // Handle Google Sign-In callback
    if GIDSignIn.sharedInstance.handle(url) {
      return true
    }
    
    // Handle Facebook callback
    return ApplicationDelegate.shared.application(
      app,
      open: url,
      sourceApplication: options[UIApplication.OpenURLOptionsKey.sourceApplication] as? String,
      annotation: options[UIApplication.OpenURLOptionsKey.annotation]
    )
  }
  
  // Handle universal links (optional for future use)
  func application(
    _ application: UIApplication,
    continue userActivity: NSUserActivity,
    restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void
  ) -> Bool {
    return RCTLinkingManager.application(application, continue: userActivity, restorationHandler: restorationHandler)
  }
  
  // Update Facebook configuration with values from environment variables
  func updateFacebookConfiguration(_ userInfo: [AnyHashable: Any]? = nil) {
    // Try to get from notification userInfo first
    if let appId = userInfo?["facebookAppID"] as? String, !appId.isEmpty {
      print("[Facebook] Setting App ID from notification: \(appId)")
      Settings.shared.appID = appId
      
      if let clientToken = userInfo?["facebookClientToken"] as? String, !clientToken.isEmpty {
        print("[Facebook] Setting Client Token from notification")
        Settings.shared.clientToken = clientToken
      }
      return
    }
    
    // Fallback to Bundle settings if available
    if let appId = Bundle.main.object(forInfoDictionaryKey: "FacebookAppID") as? String, !appId.isEmpty {
      print("[Facebook] Setting App ID from Info.plist: \(appId)")
      Settings.shared.appID = appId
      
      if let clientToken = Bundle.main.object(forInfoDictionaryKey: "FacebookClientToken") as? String, !clientToken.isEmpty {
        print("[Facebook] Setting Client Token from Info.plist")
        Settings.shared.clientToken = clientToken
      }
    } else {
      print("[Facebook] WARNING: No Facebook App ID found in Info.plist. Will wait for values from React Native.")
    }
  }
}

class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
#else
    Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}
